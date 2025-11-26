'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import TokenIcon from '@mui/icons-material/Token';
import SettingsIcon from '@mui/icons-material/Settings';
import PagesIcon from '@mui/icons-material/Pages';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/paymentService';

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

declare global {
  interface Window {
    TossPayments: any;
  }
}

const heroHighlights = [
  { label: '구매 즉시 반영', icon: <TokenIcon />, description: '토큰은 충전 직후 사용 가능합니다.' },
  { label: '자동 구독', icon: <SettingsIcon />, description: '매달 자동 충전으로 대화 흐름 유지.' },
  { label: '투명한 기록', icon: <PagesIcon />, description: '결제 이력은 프로필에서 바로 확인 가능합니다.' },
];

export default function TokensPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const tossPayments = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/tokens');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    script.onload = () => {
      if (window.TossPayments) {
        tossPayments.current = window.TossPayments(process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY);
      }
    };
    document.body.appendChild(script);

    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getTokenPackages();
        setPackages(data);
      } catch (error: any) {
        console.error(error);
        setToast({ severity: 'error', message: '토큰 패키지를 불러오는데 실패했습니다.' });
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();

    return () => {
      document.body.removeChild(script);
    };
  }, [isAuthenticated, router]);

  const handleBuyTokens = async (pkg: TokenPackage) => {
    if (paymentLoading) return;
    setSelectedPackage(pkg);
    setPaymentLoading(true);

    try {
      const paymentData = await paymentService.buyTokens(pkg.price, pkg.tokens);
      // 백엔드가 생성한 결제 페이지 URL이 있으면 바로 이동
      if (paymentData?.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
        return;
      }

      // fallback: Toss JS SDK로 직접 결제 요청
      if (!tossPayments.current) throw new Error('결제 시스템 초기화 실패');

      const orderId =
        paymentData?.payment?.paymentId ||
        paymentData?.orderId ||
        `token_${Date.now()}`;

      await tossPayments.current.requestPayment('카드', {
        amount: pkg.price,
        orderId,
        orderName: pkg.name,
        customerName: user?.username || '사용자',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error: any) {
      console.error('결제 시작 실패:', error);
      setToast({ severity: 'error', message: error.message || '결제 시작에 실패했습니다.' });
      setPaymentLoading(false);
    }
  };

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleSubscription = async () => {
    setDialogOpen(false);
    setPaymentLoading(true);
    try {
      if (!tossPayments.current) throw new Error('결제 시스템 초기화 실패');
      const customerKey = user?._id || '';
      const planType = 'basic'; // 현재는 단일 플랜, 필요 시 UI로 선택 지원
      await tossPayments.current.requestBillingAuth('카드', {
        customerKey,
        // authKey가 이 URL로 전달되며, 성공 페이지에서 백엔드로 전달해 빌링키를 발급함
        successUrl: `${window.location.origin}/payment/subscription-success?planType=${planType}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error: any) {
      console.error('구독 실패:', error);
      setToast({ severity: 'error', message: '구독을 시작하는데 실패했습니다.' });
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
          <CircularProgress size={60} sx={{ color: '#ff5f9b' }} />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(255,95,155,0.9), rgba(255,214,222,0.95))',
            color: '#fff',
            px: { xs: 3, md: 4 },
            py: { xs: 4, md: 5 },
            mb: 5,
            boxShadow: '0 30px 60px rgba(255, 95, 155, 0.35)',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            토큰을 충전하고, 자유롭게 대화하세요
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 620, opacity: 0.9, mb: 3 }}>
            원하는 토큰 패키지를 선택하고 즉시 AI 캐릭터와 대화를 시작하세요. 구독 옵션을 통해 매월 자동으로 토큰을 충전할 수도 있습니다.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {heroHighlights.map((item) => (
              <Chip
                key={item.label}
                icon={item.icon}
                label={item.label}
                variant="filled"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {packages.map((pkg) => (
            <Grid item xs={12} sm={6} md={4} key={pkg.id}>
              <Card
                sx={{
                  borderRadius: 24,
                  border: pkg.popular ? '2px solid #ff5f9b' : '1px solid rgba(15,23,42,0.08)',
                  boxShadow: '0 15px 40px rgba(255, 95, 155, 0.15)',
                }}
              >
                <CardContent>
                  <Stack spacing={1} mb={2}>
                    <Typography variant="subtitle1" color="text.secondary">
                      {pkg.name}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {pkg.tokens.toLocaleString()} 토큰
                    </Typography>
                    <Typography variant="h6" color="#ff5f9b" fontWeight={600}>
                      {pkg.price.toLocaleString()}원
                    </Typography>
                  </Stack>
                  {pkg.bonus && (
                    <Chip
                      label={`${pkg.bonus} 토큰 보너스`}
                      color="secondary"
                      sx={{ mb: 2, borderRadius: 8 }}
                    />
                  )}
                  <Button
                    fullWidth
                    variant={pkg.popular ? 'contained' : 'outlined'}
                    color="secondary"
                    sx={{ borderRadius: 999, py: 1.5 }}
                    onClick={() => handleBuyTokens(pkg)}
                    disabled={paymentLoading}
                  >
                    {pkg.popular ? '최고 인기' : '구매하기'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 24, background: '#fff5fb' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              구독 서비스
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              매달 자동으로 토큰이 충전되며, 특별 보상 캐릭터와 수익 혜택이 제공됩니다.
            </Typography>
            <Button variant="contained" color="secondary" sx={{ borderRadius: 999 }} onClick={handleOpenDialog}>
              구독 시작하기
            </Button>
          </Paper>
        </Box>

        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>구독 설정</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              카드 결제 정보를 등록하면 매월 자동으로 {packages[0]?.tokens || '정해진'} 토큰이 충전됩니다.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>취소</Button>
            <Button variant="contained" color="secondary" onClick={handleSubscription}>
              연동하기
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </PageLayout>
  );
}
