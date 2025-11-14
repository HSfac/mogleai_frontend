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

  // NICE 본인인증 팝업 열기
  async openNiceVerification(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 700;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);

      // NICE 인증 팝업 열기
      const popup = window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/verification/request?userId=${userId}`,
        'niceVerification',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!popup) {
        reject(new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.'));
        return;
      }

      // postMessage 리스너
      const handleMessage = (event: MessageEvent) => {
        // 보안: 출처 확인
        if (event.origin !== process.env.NEXT_PUBLIC_API_URL) {
          return;
        }

        if (event.data.success) {
          window.removeEventListener('message', handleMessage);
          resolve();
        } else if (event.data.error) {
          window.removeEventListener('message', handleMessage);
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', handleMessage);

      // 팝업이 닫혔는지 체크
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          // 팝업이 닫혔지만 메시지가 없으면 취소로 간주
          reject(new Error('인증이 취소되었습니다.'));
        }
      }, 500);
    });
  },

  // 테스트용 성인인증 (개발 환경)
  async testVerifyAdult() {
    const response = await api.post('/verification/test-verify');
    return response.data;
  },

  // 성인인증 상태 조회
  async getAdultStatus() {
    const response = await api.get('/verification/status');
    return response.data;
  },
};
