'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { useRouter } from 'next/navigation';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = authService.getToken();
      if (token) {
        fetchUser();
      } else {
        setLoading(false);
      }
    }
  }, []);

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
      await fetchUser();
      router.push('/');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      await authService.register(email, password, username);
      await fetchUser();
      router.push('/');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user
      }}
    >
      {children}
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