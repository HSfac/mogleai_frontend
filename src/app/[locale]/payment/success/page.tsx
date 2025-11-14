'use client';

import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Snackbar,
  Alert,
  Stack,
  Avatar,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TokenIcon from '@mui/icons-material/Token';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/paymentService';

interface PaymentInfo {
  orderId: string;
  amount: number;
  method: string;
  approvedAt: string;
  type: 'token_purchase' | 'subscription';
  tokens?: number;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, refreshUser } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/payment/success');
      return;
    }

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setToast({ severity: 'error', message: '결제 정보가 올바르지 않습니다.' });
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        const result = await paymentService.confirmPayment({
          paymentKey,
          orderId,
          amount: parseInt(amount),
        });
        setPaymentInfo({
          orderId: result.orderId,
          amount: result.amount,
          method: result.method,
          approvedAt: result.approvedAt,
          type: result.type,
          tokens: result.tokens,
        });
        await refreshUser();
        setToast({ severity: 'success', message: '결제가 성공적으로 완료되었습니다.' });
      } catch (error: any) {
        console.error('결제 인증 실패:', error);
        setToast({ severity: 'error', message: error.response?.data?.message || '결제 승인에 실패했습니다.' });
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [isAuthenticated, searchParams, router, refreshUser]);

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
          <CircularProgress sx={{ color: '#ff5f9b' }} />
        </Box>
      </PageLayout>
    );
  }

  if (!paymentInfo) {
    return (
      <PageLayout>
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Card sx={{ borderRadius: 20, px: 4, py: 6, textAlign: 'center', boxShadow: '0 20px 60px rgba(255, 95, 155, 0.2)' }}>
            <Typography variant="h6" color="text.secondary">
              결제 정보를 불러올 수 없습니다.
            </Typography>
            <Button variant="contained" color="secondary" sx={{ mt: 3, borderRadius: 999 }} onClick={() => router.push('/')}>
              홈으로 돌아가기
            </Button>
          </Card>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card
          sx={{
            borderRadius: 28,
            px: 4,
            py: 5,
            textAlign: 'center',
            boxShadow: '0 30px 60px rgba(255, 95, 155, 0.3)',
          }}
        >
          <Avatar sx={{ bgcolor: '#fff', color: '#ff5f9b', width: 100, height: 100, mx: 'auto', mb: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            결제가 완료되었습니다!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            안전하게 토큰 또는 구독이 활성화되었으며, 내 정보로 반영되었습니다.
          </Typography>
          <Card
            sx={{
              borderRadius: 20,
              mb: 3,
              background: '#fff',
              textAlign: 'left',
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <InfoRow label="주문번호" value={paymentInfo.orderId} />
                <InfoRow label="결제금액" value={`${paymentInfo.amount.toLocaleString()}원`} />
                <InfoRow label="결제수단" value={paymentInfo.method} />
                <InfoRow label="승인시각" value={new Date(paymentInfo.approvedAt).toLocaleString('ko-KR')} />
              </Stack>
              <Divider sx={{ my: 2 }} />
              {paymentInfo.type === 'token_purchase' ? (
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                  <TokenIcon sx={{ color: '#ff5f9b' }} />
                  <Chip label={`${paymentInfo.tokens?.toLocaleString()} 토큰 충전`} color="secondary" />
                </Stack>
              ) : (
                <Chip label="월간 구독 활성화" color="secondary" sx={{ py: 1 }} />
              )}
            </CardContent>
          </Card>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button fullWidth variant="outlined" sx={{ borderRadius: 999 }} onClick={() => router.push('/profile')}>
              내 정보
            </Button>
            <Button fullWidth variant="contained" color="secondary" sx={{ borderRadius: 999 }} onClick={() => router.push('/')}>
              홈으로
            </Button>
          </Stack>
        </Card>
        <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
        </Snackbar>
      </Container>
    </PageLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  );
}
