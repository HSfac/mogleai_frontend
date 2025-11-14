import api from '@/lib/api';

export const paymentService = {
  // 토큰 패키지 목록
  async getTokenPackages() {
    const response = await api.get('/payment/token-packages');
    return response.data;
  },

  // 토큰 구매 (단건 결제)
  async buyTokens(amount: number, tokens: number) {
    const response = await api.post('/payment/buy-tokens', { amount, tokens });
    return response.data;
  },

  // 월 구독 (단순 결제)
  async subscribe(amount: number) {
    const response = await api.post('/payment/subscribe', { amount });
    return response.data;
  },

  // 결제 확인
  async confirmPayment(paymentKey: string, orderId: string, amount: number) {
    const response = await api.post('/payment/confirm', { paymentKey, orderId, amount });
    return response.data;
  },

  // 결제 내역 조회
  async getPaymentHistory() {
    const response = await api.get('/payment/history');
    return response.data;
  },

  // 결제 취소
  async cancelPayment(paymentId: string, reason: string) {
    const response = await api.post(`/payment/${paymentId}/cancel`, { reason });
    return response.data;
  },

  // ==================== 빌링(구독) 결제 ====================

  // 빌링키 발급
  async issueBillingKey(authKey: string) {
    const response = await api.post('/payment/billing/issue', { authKey });
    return response.data;
  },

  // 구독 시작
  async startSubscription(planType: string) {
    const response = await api.post('/payment/billing/subscribe', { planType });
    return response.data;
  },

  // 구독 해지
  async cancelSubscription() {
    const response = await api.post('/payment/billing/cancel');
    return response.data;
  },

  // 구독 상태 조회
  async getSubscriptionStatus() {
    const response = await api.get('/payment/billing/status');
    return response.data;
  },
};
