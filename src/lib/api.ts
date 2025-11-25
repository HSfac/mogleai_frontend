import axios from 'axios';

const api = axios.create({
  // 기본값은 백엔드 개발 포트(5001). 배포/로컬 변경은 NEXT_PUBLIC_API_URL 환경변수로 조정.
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리 및 데이터 언래핑
api.interceptors.response.use(
  (response) => {
    // 백엔드 응답 구조: { success: true, data: {...} }
    // data 부분만 반환하여 사용하기 쉽게 만듦
    if (response.data && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    // 401 에러 처리 (인증 만료)
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { api }; 
