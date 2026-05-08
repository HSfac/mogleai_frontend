'use client';

import { Box, CircularProgress } from '@mui/material';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';
import { authService } from '@/services/authService';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { getLocalePath } = useLocaleNavigation();

  const loginPath = getLocalePath('/login');
  const adminLoginPath = getLocalePath('/admin/login');
  const adminDashboardPath = getLocalePath('/admin/dashboard');
  const homePath = getLocalePath('/');

  const autoExchangeAdminToken = useCallback(async () => {
    try {
      const result = await authService.exchangeAdminToken();
      const token = result?.access_token;
      if (token) {
        localStorage.setItem('adminToken', token);
        router.replace(adminDashboardPath);
      } else {
        router.push(adminLoginPath);
      }
    } catch {
      router.push(adminLoginPath);
    }
  }, [adminDashboardPath, adminLoginPath, router]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push(`${loginPath}?redirect=${encodeURIComponent(adminDashboardPath)}`);
      return;
    }

    if (!user?.isAdmin) {
      router.push(homePath);
      return;
    }

    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!adminToken) {
      // 소셜 로그인 유저도 어드민 접근 가능하도록 자동 토큰 교환
      autoExchangeAdminToken();
      return;
    }

    router.replace(adminDashboardPath);
  }, [adminDashboardPath, adminLoginPath, autoExchangeAdminToken, homePath, isAuthenticated, loading, loginPath, router, user]);

  return (
    <PageLayout>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: '#ff5f9b' }} />
      </Box>
    </PageLayout>
  );
}
