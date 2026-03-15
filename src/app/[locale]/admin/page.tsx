'use client';

import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }

    if (!user?.isAdmin) {
      router.push('/');
      return;
    }

    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    router.replace('/admin/dashboard');
  }, [isAuthenticated, loading, router, user]);

  return (
    <PageLayout>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: '#ff5f9b' }} />
      </Box>
    </PageLayout>
  );
}
