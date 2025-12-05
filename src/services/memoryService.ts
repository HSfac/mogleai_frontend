import api from '@/lib/api';
import {
  MemorySummary,
  MemoryStats,
  UserNote,
  CreateNoteDto,
  UpdateNoteDto,
} from '@/types/memory';

export const memoryService = {
  // ==================== 메모리 요약 ====================

  // 채팅의 메모리 요약 목록 조회
  async getMemorySummaries(chatId: string, limit?: number): Promise<MemorySummary[]> {
    const response = await api.get(`/chat/${chatId}/memory`, {
      params: { limit },
    });
    return response.data;
  },

  // 메모리 통계 조회
  async getMemoryStats(chatId: string): Promise<MemoryStats> {
    const response = await api.get(`/chat/${chatId}/memory/stats`);
    return response.data;
  },

  // ==================== 유저 노트 ====================

  // 노트 생성
  async createNote(data: CreateNoteDto): Promise<UserNote> {
    const response = await api.post('/notes', data);
    return response.data;
  },

  // 채팅의 노트 목록 조회
  async getNotesByChat(chatId: string): Promise<UserNote[]> {
    const response = await api.get(`/chat/${chatId}/notes`);
    return response.data;
  },

  // 캐릭터의 노트 목록 조회
  async getNotesByCharacter(characterId: string): Promise<UserNote[]> {
    const response = await api.get(`/characters/${characterId}/notes`);
    return response.data;
  },

  // 노트 상세 조회
  async getNote(noteId: string): Promise<UserNote> {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  },

  // 노트 수정
  async updateNote(noteId: string, data: UpdateNoteDto): Promise<UserNote> {
    const response = await api.put(`/notes/${noteId}`, data);
    return response.data;
  },

  // 노트 삭제
  async deleteNote(noteId: string): Promise<void> {
    await api.delete(`/notes/${noteId}`);
  },

  // 노트 고정 토글
  async togglePinNote(noteId: string): Promise<UserNote> {
    const response = await api.post(`/notes/${noteId}/toggle-pin`);
    return response.data;
  },

  // 컨텍스트 포함 토글
  async toggleContextNote(noteId: string): Promise<UserNote> {
    const response = await api.post(`/notes/${noteId}/toggle-context`);
    return response.data;
  },
};
