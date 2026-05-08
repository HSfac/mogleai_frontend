import axios from 'axios';
import { localizePath } from './localePath';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getTokenExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

// 만료까지 24시간 미만이면 갱신 (토큰은 7일 유효)
function shouldRefresh(token: string): boolean {
  const exp = getTokenExp(token);
  if (!exp) return false;
  return exp * 1000 - Date.now() < 24 * 60 * 60 * 1000;
}

let isRefreshing = false;

// 요청 인터셉터 - 토큰 추가 + 만료 임박 시 백그라운드 갱신
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        if (!isRefreshing && shouldRefresh(token)) {
          isRefreshing = true;
          axios
            .post(`${BASE_URL}/auth/refresh-token`, {}, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              const newToken = res.data?.data?.access_token ?? res.data?.access_token;
              if (newToken) localStorage.setItem('token', newToken);
            })
            .catch(() => {})
            .finally(() => { isRefreshing = false; });
        }
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
    if (response.data && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        const locale = window.location.pathname.split('/')[1];
        window.location.href = localizePath(locale, '/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };
