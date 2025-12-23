'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/auth/LoginModal';

interface User {
  _id: string;
  email: string;
  username: string;
  profileImage?: string;
  tokens: number;
  totalConversations: number;
  creatorLevel: string;
  popularCharacters: number;
  isSubscribed: boolean;
  subscriptionEndDate?: Date;
  isVerified: boolean;
  isAdultVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  token: string | null;
  // 새로운 함수들
  openLoginModal: (message?: string, redirectAfterLogin?: string) => void;
  closeLoginModal: () => void;
  requireAuth: (action: () => void, message?: string) => void;
  requireAuthAsync: <T>(action: () => Promise<T>, message?: string) => Promise<T | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // 로그인 모달 상태
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');
  const [loginModalRedirect, setLoginModalRedirect] = useState<string | undefined>();
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = authService.getToken();
      if (storedToken) {
        setToken(storedToken);
        fetchUser();
      } else {
        setLoading(false);
      }
    }
  }, []);

  // 로그인 성공 후 대기중인 액션 실행
  useEffect(() => {
    if (user && pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [user, pendingAction]);

  const fetchUser = async () => {
    try {
      const userData = await userService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('사용자 정보를 가져오는데 실패했습니다:', error);
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.login(email, password);
      setToken(authService.getToken());
      await fetchUser();
      // 모달에서 로그인한 경우 리다이렉트하지 않음
      if (!loginModalOpen) {
        router.push('/');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      await authService.register(email, password, username);
      setToken(authService.getToken());
      await fetchUser();
      // 모달에서 회원가입한 경우 리다이렉트하지 않음
      if (!loginModalOpen) {
        router.push('/');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    router.push('/');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  // 로그인 모달 열기
  const openLoginModal = useCallback((message?: string, redirectAfterLogin?: string) => {
    setLoginModalMessage(message || '이 기능을 이용하려면 로그인이 필요해요');
    setLoginModalRedirect(redirectAfterLogin);
    setLoginModalOpen(true);
  }, []);

  // 로그인 모달 닫기
  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
    setLoginModalMessage('');
    setLoginModalRedirect(undefined);
  }, []);

  // 인증이 필요한 액션 실행 (동기)
  const requireAuth = useCallback((action: () => void, message?: string) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      openLoginModal(message);
    }
  }, [user, openLoginModal]);

  // 인증이 필요한 액션 실행 (비동기)
  const requireAuthAsync = useCallback(async <T,>(action: () => Promise<T>, message?: string): Promise<T | null> => {
    if (user) {
      return await action();
    } else {
      openLoginModal(message);
      return null;
    }
  }, [user, openLoginModal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        token,
        openLoginModal,
        closeLoginModal,
        requireAuth,
        requireAuthAsync,
      }}
    >
      {children}
      {/* 전역 로그인 모달 */}
      <LoginModal
        open={loginModalOpen}
        onClose={closeLoginModal}
        message={loginModalMessage}
        redirectAfterLogin={loginModalRedirect}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
