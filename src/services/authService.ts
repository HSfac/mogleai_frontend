import api from '@/lib/api';

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  async register(email: string, password: string, username: string) {
    const response = await api.post('/auth/register', { email, password, username });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  // 토큰 확인
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // 로그인 여부 확인
  isAuthenticated() {
    return !!this.getToken();
  },
}; 
