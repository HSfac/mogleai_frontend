'use client';

import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { getLocalePath } = useLocaleNavigation();

  const loginPath = getLocalePath('/login');
  const adminLoginPath = getLocalePath('/admin/login');
  const adminDashboardPath = getLocalePath('/admin/dashboard');
  const homePath = getLocalePath('/');

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
      router.push(adminLoginPath);
      return;
    }

    router.replace(adminDashboardPath);
  }, [adminDashboardPath, adminLoginPath, homePath, isAuthenticated, loading, loginPath, router, user]);

  return (
    <PageLayout>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: '#ff5f9b' }} />
      </Box>
    </PageLayout>
  );
}
