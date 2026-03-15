import api from '@/lib/api';

export const userService = {
  // 내 정보 조회
  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  // 내 정보 수정
  async updateMe(data: any) {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  // 즐겨찾기 목록
  async getFavorites() {
    const response = await api.get('/users/me/favorites');
    return response.data;
  },

  // 즐겨찾기 추가
  async addFavorite(characterId: string) {
    const response = await api.put(`/users/me/favorites/${characterId}`);
    return response.data;
  },

  // 즐겨찾기 제거
  async removeFavorite(characterId: string) {
    const response = await api.delete(`/users/me/favorites/${characterId}`);
    return response.data;
  },
};
