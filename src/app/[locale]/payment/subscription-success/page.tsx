'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Card, CardContent, CircularProgress, Container, Typography } from '@mui/material';
import PageLayout from '@/components/PageLayout';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const authKey = searchParams.get('authKey');

    const issueKey = async () => {
      if (!authKey) {
        setMessage('authKey가 전달되지 않았습니다.');
        setStatus('error');
        return;
      }

      if (!isAuthenticated) {
        router.push('/login?redirect=/payment/subscription-success');
        return;
      }

      try {
        await paymentService.issueBillingKey(authKey);
        setStatus('success');
        setMessage('카드가 등록되었어요. 이제 구독을 시작할 수 있습니다.');
      } catch (error: any) {
        console.error('빌링키 발급 실패:', error);
        setStatus('error');
        setMessage(error?.response?.data?.message || '빌링키 발급에 실패했습니다.');
      }
    };

    issueKey();
  }, [isAuthenticated, router, searchParams]);

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
                <Typography color="text.secondary" textAlign="center">
                  {message}
                </Typography>
                <Button variant="contained" color="secondary" onClick={() => router.push('/tokens')}>
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
