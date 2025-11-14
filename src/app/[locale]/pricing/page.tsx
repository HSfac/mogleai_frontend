'use client';

import { useEffect, useState } from 'react';
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
} from '@mui/material';
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

const heroHighlights = [
  { title: '즉시충전', detail: '결제 직후 모든 캐릭터와 대화 가능' },
  { title: '자동 구독', detail: '매월 지정 토큰이 자동으로 충전됩니다' },
  { title: '투명 로그', detail: '결제/구독 이력을 프로필에서 확인' },
];

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getTokenPackages();
        setTokenPackages(data);
      } catch (error) {
        console.error('토큰 패키지를 불러오는데 실패했습니다:', error);
        setToast({
          severity: 'error',
          message: '토큰 패키지 정보를 불러오는데 실패했습니다.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const ensureAuth = (redirect = '/pricing') => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${redirect}`);
      return false;
    }
    return true;
  };

  const handleBuyTokens = async (pkg: TokenPackage) => {
    if (!ensureAuth()) return;

    setRequesting(true);
    try {
      const response = await paymentService.buyTokens(pkg.price, pkg.tokens);
      window.location.href = response.paymentUrl;
    } catch (error) {
      console.error('토큰 구매 실패:', error);
      setToast({
        severity: 'error',
        message: '토큰 구매 요청 중 오류가 발생했습니다.',
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleSubscribe = async () => {
    if (!ensureAuth()) return;

    setRequesting(true);
    try {
      const response = await paymentService.subscribe(9900);
      window.location.href = response.paymentUrl;
    } catch (error) {
      console.error('구독 실패:', error);
      setToast({
        severity: 'error',
        message: '구독 신청 중 오류가 발생했습니다.',
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(255,95,155,0.9), rgba(255,214,227,0.9))',
            color: '#fff',
            px: { xs: 3, md: 4 },
            py: { xs: 4, md: 5 },
            mb: 5,
            boxShadow: '0 30px 60px rgba(255, 95, 155, 0.3)',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            요금제 및 토큰 구매
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
            몽글AI와 함께 더 많은 대화를 즐길 수 있는 토큰과 구독 플랜을 확인해보세요.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {heroHighlights.map((highlight) => (
              <Chip
                key={highlight.title}
                label={`${highlight.title} · ${highlight.detail}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 10 }}
              />
            ))}
          </Stack>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: '#ff5f9b' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {tokenPackages.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                <Card
                  sx={{
                    borderRadius: 24,
                    border: pkg.popular ? '2px solid #ff5f9b' : '1px solid rgba(15,23,42,0.08)',
                    boxShadow: '0 15px 35px rgba(255, 95, 155, 0.15)',
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      {pkg.name}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {pkg.tokens.toLocaleString()} 토큰
                    </Typography>
                    <Typography variant="h5" color="#ff5f9b">
                      {pkg.price.toLocaleString()}원
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={1} mb={2}>
                      {pkg.bonus && (
                        <Chip
                          label={`${pkg.bonus} 보너스`}
                          color="secondary"
                          size="small"
                          sx={{ borderRadius: 8 }}
                        />
                      )}
                      {pkg.popular && (
                        <Chip label="인기" variant="outlined" sx={{ borderColor: '#ff5f9b', color: '#ff5f9b' }} />
                      )}
                    </Stack>
                    <Button
                      variant={pkg.popular ? 'contained' : 'outlined'}
                      color="secondary"
                      fullWidth
                      sx={{ borderRadius: 999, py: 1.5 }}
                      onClick={() => handleBuyTokens(pkg)}
                      disabled={requesting}
                    >
                      구매하기
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 6 }}>
          <Card
            sx={{
              borderRadius: 24,
              border: '1px solid rgba(255, 95, 155, 0.25)',
              background: '#fff5fb',
              boxShadow: '0 20px 50px rgba(255, 95, 155, 0.18)',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" fontWeight={700}>
                월간 프리미엄 구독
              </Typography>
              <Typography variant="body2" color="text.secondary">
                매달 정기적으로 500토큰이 자동 충전되며, 프리미엄 캐릭터와 신규 기능을 누구보다 먼저 만나보세요.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                sx={{ width: 'fit-content', borderRadius: 999 }}
                onClick={handleSubscribe}
                disabled={requesting}
              >
                구독 시작하기
              </Button>
            </CardContent>
          </Card>
        </Box>

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
