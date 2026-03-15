import axios from 'axios';

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
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
  // ==================== 관리자 로그인 ====================

  async login(email: string, password: string) {
    const response = await adminApi.post('/auth/admin/login', { email, password });
    const data = response.data?.data || response.data;
    if (data.access_token) {
      localStorage.setItem('adminToken', data.access_token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('adminToken');
  },

  // ==================== 대시보드 ====================

  async getDashboardStats() {
    const response = await adminApi.get('/admin/dashboard/stats');
    return response.data;
  },

  async getChartStats(days: number = 30) {
    const response = await adminApi.get('/admin/charts', { params: { days } });
    return response.data;
  },

  // ==================== 사용자 관리 ====================

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

  // ==================== 캐릭터 관리 ====================

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

  async getTopCharacters() {
    const response = await adminApi.get('/admin/characters/top');
    return response.data;
  },

  // ==================== 결제 관리 ====================

  async getPayments(page: number = 1, limit: number = 50) {
    const response = await adminApi.get('/admin/payments', { params: { page, limit } });
    return response.data;
  },

  async getRevenueStats(period: 'daily' | 'monthly' = 'daily') {
    const response = await adminApi.get('/admin/revenue/stats', { params: { period } });
    return response.data;
  },

  async refundPayment(paymentId: string, reason: string) {
    const response = await adminApi.put(`/admin/payments/${paymentId}/refund`, { reason });
    return response.data;
  },

  async getRecentActivities(limit: number = 20) {
    const response = await adminApi.get('/admin/activities/recent', { params: { limit } });
    return response.data;
  },

  // ==================== 크리에이터 파트너 관리 ====================

  async getCreators(page: number = 1, limit: number = 20, level?: string) {
    const response = await adminApi.get('/admin/creators', { params: { page, limit, level } });
    return response.data;
  },

  async setPartner(userId: string) {
    const response = await adminApi.put(`/admin/users/${userId}/partner`);
    return response.data;
  },

  async removePartner(userId: string) {
    const response = await adminApi.put(`/admin/users/${userId}/partner/remove`);
    return response.data;
  },

  async getCreatorEarnings(creatorId: string, page: number = 1, limit: number = 50) {
    const response = await adminApi.get(`/admin/creators/${creatorId}/earnings`, { params: { page, limit } });
    return response.data;
  },

  // ==================== 신고 관리 ====================

  async getReports(page: number = 1, limit: number = 20, status?: string) {
    const response = await adminApi.get('/admin/reports', { params: { page, limit, status } });
    return response.data;
  },

  async updateReportStatus(reportId: string, status: string, adminNote?: string) {
    const response = await adminApi.put(`/admin/reports/${reportId}/status`, { status, adminNote });
    return response.data;
  },

  // ==================== 공지사항 관리 ====================

  async getAnnouncements(page: number = 1, limit: number = 20, isActive?: boolean) {
    const response = await adminApi.get('/admin/announcements', {
      params: { page, limit, isActive: isActive !== undefined ? String(isActive) : undefined }
    });
    return response.data;
  },

  async createAnnouncement(data: {
    title: string;
    content: string;
    type?: string;
    priority?: string;
    isActive?: boolean;
    isPinned?: boolean;
    startDate?: Date;
    endDate?: Date;
  }) {
    const response = await adminApi.post('/admin/announcements', data);
    return response.data;
  },

  async updateAnnouncement(id: string, data: {
    title?: string;
    content?: string;
    type?: string;
    priority?: string;
    isActive?: boolean;
    isPinned?: boolean;
    startDate?: Date;
    endDate?: Date;
  }) {
    const response = await adminApi.put(`/admin/announcements/${id}`, data);
    return response.data;
  },

  async deleteAnnouncement(id: string) {
    const response = await adminApi.delete(`/admin/announcements/${id}`);
    return response.data;
  },

  // ==================== 쿠폰 관리 ====================

  async getCoupons(page: number = 1, limit: number = 20, isActive?: boolean) {
    const response = await adminApi.get('/admin/coupons', {
      params: { page, limit, isActive: isActive !== undefined ? String(isActive) : undefined }
    });
    return response.data;
  },

  async createCoupon(data: {
    code: string;
    name: string;
    description?: string;
    type: string;
    discountType?: string;
    value: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    isActive?: boolean;
    startDate: Date;
    endDate: Date;
    maxUsageCount?: number;
    maxUsagePerUser?: number;
  }) {
    const response = await adminApi.post('/admin/coupons', data);
    return response.data;
  },

  async updateCoupon(id: string, data: {
    code?: string;
    name?: string;
    description?: string;
    type?: string;
    discountType?: string;
    value?: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    maxUsageCount?: number;
    maxUsagePerUser?: number;
  }) {
    const response = await adminApi.put(`/admin/coupons/${id}`, data);
    return response.data;
  },

  async deleteCoupon(id: string) {
    const response = await adminApi.delete(`/admin/coupons/${id}`);
    return response.data;
  },

  async getCouponUsageStats(couponId: string) {
    const response = await adminApi.get(`/admin/coupons/${couponId}/usage`);
    return response.data;
  },

  // ==================== 정산 관리 ====================

  async getSettlements(page: number = 1, limit: number = 20, status?: string) {
    const response = await adminApi.get('/admin/settlements', { params: { page, limit, status } });
    return response.data;
  },

  async processSettlement(settlementId: string, status: string, adminNote?: string, transactionId?: string) {
    const response = await adminApi.put(`/admin/settlements/${settlementId}/process`, {
      status, adminNote, transactionId
    });
    return response.data;
  },

  // ==================== FAQ 관리 ====================

  async getFAQs(page: number = 1, limit: number = 50, category?: string) {
    const response = await adminApi.get('/admin/faqs', { params: { page, limit, category } });
    return response.data;
  },

  async createFAQ(data: {
    question: string;
    answer: string;
    category?: string;
    order?: number;
    isActive?: boolean;
  }) {
    const response = await adminApi.post('/admin/faqs', data);
    return response.data;
  },

  async updateFAQ(id: string, data: {
    question?: string;
    answer?: string;
    category?: string;
    order?: number;
    isActive?: boolean;
  }) {
    const response = await adminApi.put(`/admin/faqs/${id}`, data);
    return response.data;
  },

  async deleteFAQ(id: string) {
    const response = await adminApi.delete(`/admin/faqs/${id}`);
    return response.data;
  },

  async reorderFAQs(orders: { id: string; order: number }[]) {
    const response = await adminApi.put('/admin/faqs/reorder', { orders });
    return response.data;
  },
};
