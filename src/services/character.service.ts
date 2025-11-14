import api from '@/lib/api';

export const characterService = {
  // 캐릭터 목록 조회
  async getCharacters(query?: string, tags?: string[]) {
    const params: any = {};
    if (query) params.query = query;
    if (tags && tags.length > 0) params.tags = tags.join(',');

    const response = await api.get('/characters', { params });
    return response.data;
  },

  // 인기 태그 조회
  async getPopularTags(limit?: number) {
    const response = await api.get('/characters/tags/popular', { params: { limit } });
    return response.data;
  },

  // 캐릭터 상세 조회
  async getCharacter(id: string) {
    const response = await api.get(`/characters/${id}`);
    return response.data;
  },

  // 인기 캐릭터 조회
  async getPopularCharacters() {
    const response = await api.get('/characters/popular');
    return response.data;
  },

  // 캐릭터 생성
  async createCharacter(data: any) {
    const response = await api.post('/characters', data);
    return response.data;
  },

  // 캐릭터 수정
  async updateCharacter(id: string, data: any) {
    const response = await api.put(`/characters/${id}`, data);
    return response.data;
  },

  // 캐릭터 삭제
  async deleteCharacter(id: string) {
    const response = await api.delete(`/characters/${id}`);
    return response.data;
  },

  // 캐릭터 좋아요
  async likeCharacter(id: string) {
    const response = await api.post(`/characters/${id}/like`);
    return response.data;
  },

  // ==================== 크리에이터 API ====================

  // 내가 만든 캐릭터
  async getMyCharacters() {
    const response = await api.get('/characters/creator/my-characters');
    return response.data;
  },

  // 크리에이터 수익 조회
  async getCreatorEarnings(period?: string) {
    const response = await api.get('/characters/creator/earnings', { params: { period } });
    return response.data;
  },

  // 크리에이터 대시보드
  async getCreatorDashboard() {
    const response = await api.get('/characters/creator/dashboard');
    return response.data;
  },
};
