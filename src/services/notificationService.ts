import api from '@/lib/api';

export const notificationService = {
  // 알림 목록 조회
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  // 알림 읽음 처리
  async markAsRead(notificationId: string) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // 모든 알림 읽음 처리
  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // 읽지 않은 알림 개수
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // 알림 삭제
  async deleteNotification(notificationId: string) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // 모든 알림 삭제
  async deleteAllNotifications() {
    const response = await api.delete('/notifications/all');
    return response.data;
  },
};
