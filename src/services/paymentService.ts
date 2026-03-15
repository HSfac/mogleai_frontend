import api from '@/lib/api';

export interface PaymentRecord {
  _id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  tokens: number;
  status: string;
  type: 'token_purchase' | 'subscription';
  createdAt: string;
  paymentMethod?: string;
  approvedAt?: string;
  paymentKey?: string;
  receiptUrl?: string;
}

function normalizePaymentRecord(record: any): PaymentRecord {
  const metadata = record?.metadata || {};

  return {
    _id: record?._id || '',
    paymentId: record?.paymentId || record?.orderId || '',
    orderId: record?.orderId || record?.paymentId || '',
    amount: Number(record?.amount || 0),
    tokens: Number(record?.tokens || 0),
    status: record?.status || 'pending',
    type: record?.type === 'subscription' ? 'subscription' : 'token_purchase',
    createdAt: record?.createdAt || metadata.approvedAt || new Date().toISOString(),
    paymentMethod: record?.paymentMethod || record?.method || metadata.method,
    approvedAt: record?.approvedAt || metadata.approvedAt,
    paymentKey: record?.paymentKey || metadata.paymentKey,
    receiptUrl: record?.receiptUrl,
  };
}

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
    return normalizePaymentRecord(response.data);
  },

  // 결제 내역 조회
  async getPaymentHistory() {
    const response = await api.get('/payment/history');
    return Array.isArray(response.data)
      ? response.data.map(normalizePaymentRecord)
      : [];
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

  // ==================== 쿠폰 ====================

  // 쿠폰 적용
  async applyCoupon(code: string) {
    const response = await api.post('/payment/coupon/apply', { code });
    return response.data;
  },

  // 쿠폰 유효성 검사
  async validateCoupon(code: string) {
    const response = await api.get(`/payment/coupon/validate?code=${encodeURIComponent(code)}`);
    return response.data;
  },
};
