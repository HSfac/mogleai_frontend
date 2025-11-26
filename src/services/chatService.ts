import api from '@/lib/api';

export const chatService = {
  // 새 채팅 생성
  async createChat(characterId: string, aiModel: string) {
    const response = await api.post('/chat', { characterId, aiModel });
    return response.data;
  },

  // 채팅 목록 조회
  async getChats() {
    const response = await api.get('/chat');
    return response.data;
  },

  // 채팅 상세 조회
  async getChat(chatId: string) {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  },

  // 메시지 전송
  async sendMessage(chatId: string, content: string) {
    const response = await api.post(`/chat/${chatId}/messages`, { content });
    return response.data;
  },

  // AI 모델 변경
  async changeAIModel(chatId: string, aiModel: string) {
    const response = await api.put(`/chat/${chatId}/ai-model`, { aiModel });
    return response.data;
  },

  // 채팅 삭제
  async deleteChat(chatId: string) {
    const response = await api.delete(`/chat/${chatId}`);
    return response.data;
  },

  /**
   * SSE 스트리밍 메시지 전송
   */
  streamMessage(
    chatId: string,
    content: string,
    handlers: {
      onChunk?: (chunk: string, fullText: string) => void;
      onDone?: (payload?: any) => void;
      onError?: (error: Error) => void;
    } = {},
  ) {
    const controller = new AbortController();

    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const baseURL =
          (api.defaults?.baseURL as string | undefined) ||
          process.env.NEXT_PUBLIC_API_URL ||
          'http://localhost:5001';

        const response = await fetch(`${baseURL}/chat/${chatId}/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ content }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error('스트리밍 응답을 받을 수 없습니다.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const segments = buffer.split('\n\n');
          buffer = segments.pop() || '';

          segments.forEach((segment) => {
            const line = segment.trim();
            if (!line.startsWith('data:')) return;
            const payloadRaw = line.replace(/^data:\s*/, '');
            if (!payloadRaw) return;
            const payload = JSON.parse(payloadRaw);

            if (payload.type === 'chunk') {
              const chunk = payload.content || '';
              fullResponse += chunk;
              handlers.onChunk?.(chunk, fullResponse);
            } else if (payload.type === 'done') {
              handlers.onDone?.(payload);
            } else if (payload.type === 'error') {
              throw new Error(payload.message || '스트리밍 오류');
            }
          });
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        handlers.onError?.(err);
      }
    })();

    return {
      cancel: () => controller.abort(),
    };
  },
};
