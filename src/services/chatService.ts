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
};
