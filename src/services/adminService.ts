import axios from 'axios';

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 관리자 토큰 추가
adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers['x-admin-token'] = adminToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 처리
adminApi.interceptors.response.use(
  (response) => {
    return response.data.data ? { ...response, data: response.data.data } : response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  // 대시보드 통계
  async getDashboardStats() {
    const response = await adminApi.get('/admin/dashboard/stats');
    return response.data;
  },

  // 사용자 관리
  async getUsers(page: number = 1, limit: number = 20, search?: string) {
    const response = await adminApi.get('/admin/users', { params: { page, limit, search } });
    return response.data;
  },

  async getUserDetail(userId: string) {
    const response = await adminApi.get(`/admin/users/${userId}`);
    return response.data;
  },

  async toggleUserBlock(userId: string) {
    const response = await adminApi.put(`/admin/users/${userId}/block`);
    return response.data;
  },

  // 캐릭터 관리
  async getCharacters(page: number = 1, limit: number = 20, search?: string) {
    const response = await adminApi.get('/admin/characters', { params: { page, limit, search } });
    return response.data;
  },

  async toggleCharacterVerify(characterId: string) {
    const response = await adminApi.put(`/admin/characters/${characterId}/verify`);
    return response.data;
  },

  async toggleCharacterPublic(characterId: string) {
    const response = await adminApi.put(`/admin/characters/${characterId}/public`);
    return response.data;
  },

  // 결제 관리
  async getPayments(page: number = 1, limit: number = 50) {
    const response = await adminApi.get('/admin/payments', { params: { page, limit } });
    return response.data;
  },

  // 매출 통계
  async getRevenueStats(period: 'daily' | 'monthly' = 'daily') {
    const response = await adminApi.get('/admin/revenue/stats', { params: { period } });
    return response.data;
  },

  // 인기 캐릭터 Top 10
  async getTopCharacters() {
    const response = await adminApi.get('/admin/characters/top');
    return response.data;
  },

  // 최근 활동
  async getRecentActivities(limit: number = 20) {
    const response = await adminApi.get('/admin/activities/recent', { params: { limit } });
    return response.data;
  },
};
