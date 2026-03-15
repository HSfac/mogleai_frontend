'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Card, CardContent, CircularProgress, Container, Typography, Chip } from '@mui/material';
import PageLayout from '@/components/PageLayout';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { localizePath } from '@/lib/localePath';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const { isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const loginPath = localizePath(params?.locale, '/login');
  const subscriptionSuccessPath = localizePath(params?.locale, '/payment/subscription-success');
  const tokensPath = localizePath(params?.locale, '/tokens');

  const planType = useMemo(() => searchParams.get('planType') || 'basic', [searchParams]);

  useEffect(() => {
    const authKey = searchParams.get('authKey');

    const completeSubscription = async () => {
      if (authLoading) {
        return;
      }

      if (!authKey) {
        setMessage('authKey가 전달되지 않았습니다.');
        setStatus('error');
        return;
      }

      if (!isAuthenticated) {
        router.push(
          `${loginPath}?redirect=${encodeURIComponent(`${subscriptionSuccessPath}?planType=${planType}`)}`,
        );
        return;
      }

      try {
        await paymentService.issueBillingKey(authKey);
        await paymentService.startSubscription(planType);
        await refreshUser();
        setStatus('success');
        setMessage('구독이 활성화되었습니다. 매월 자동으로 토큰이 충전됩니다.');
      } catch (error: any) {
        console.error('구독 완료 실패:', error);
        setStatus('error');
        setMessage(error?.response?.data?.message || '구독을 완료하지 못했습니다.');
      }
    };

    completeSubscription();
  }, [authLoading, isAuthenticated, loginPath, planType, refreshUser, router, searchParams, subscriptionSuccessPath]);

  return (
    <PageLayout>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ borderRadius: 2, p: 2 }}>
          <CardContent>
            {status === 'loading' && (
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <CircularProgress sx={{ color: '#ff5f9b' }} />
                <Typography>결제를 확인하고 있습니다...</Typography>
              </Box>
            )}

            {status !== 'loading' && (
              <Box display="flex" flexDirection="column" gap={2} alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {status === 'success' ? '등록 완료' : '처리 실패'}
                </Typography>
                <Chip label={`플랜: ${planType}`} color="secondary" />
                <Typography color="text.secondary" textAlign="center">
                  {message}
                </Typography>
                <Button variant="contained" color="secondary" onClick={() => router.push(tokensPath)}>
                  토큰/구독 페이지로 이동
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  );
}
