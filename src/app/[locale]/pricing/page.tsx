'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/paymentService';
import { localizePath } from '@/lib/localePath';

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
  const params = useParams<{ locale?: string }>();
  const { isAuthenticated } = useAuth();
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed' | 'tokens';
    discountValue: number;
  } | null>(null);
  const loginPath = localizePath(params?.locale, '/login');

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
      router.push(`${loginPath}?redirect=${encodeURIComponent(localizePath(params?.locale, redirect))}`);
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setToast({
        severity: 'error',
        message: '쿠폰 코드를 입력해주세요.',
      });
      return;
    }

    if (!ensureAuth()) return;

    setCouponLoading(true);
    try {
      const result = await paymentService.applyCoupon(couponCode.trim());
      setAppliedCoupon({
        code: couponCode.trim(),
        discountType: result.discountType,
        discountValue: result.discountValue,
      });
      setCouponCode('');
      setToast({
        severity: 'success',
        message: result.message || '쿠폰이 성공적으로 적용되었습니다!',
      });
    } catch (error: any) {
      console.error('쿠폰 적용 실패:', error);
      setToast({
        severity: 'error',
        message: error.response?.data?.message || '유효하지 않은 쿠폰 코드입니다.',
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setToast({
      severity: 'success',
      message: '쿠폰이 제거되었습니다.',
    });
  };

  const getCouponDescription = () => {
    if (!appliedCoupon) return '';
    switch (appliedCoupon.discountType) {
      case 'percentage':
        return `${appliedCoupon.discountValue}% 할인`;
      case 'fixed':
        return `${appliedCoupon.discountValue.toLocaleString()}원 할인`;
      case 'tokens':
        return `${appliedCoupon.discountValue.toLocaleString()} 토큰 추가 지급`;
      default:
        return '';
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

        {/* 쿠폰 입력 섹션 */}
        <Card
          sx={{
            mt: 4,
            borderRadius: 24,
            border: '1px solid rgba(255, 95, 155, 0.15)',
            boxShadow: '0 8px 24px rgba(255, 95, 155, 0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <LocalOfferIcon sx={{ color: '#ff5f9b' }} />
              <Typography variant="h6" fontWeight={600}>
                쿠폰 코드
              </Typography>
            </Stack>

            {appliedCoupon ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon sx={{ color: '#4caf50' }} />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {appliedCoupon.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getCouponDescription()}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={handleRemoveCoupon}
                  sx={{ borderRadius: 999 }}
                >
                  제거
                </Button>
              </Box>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  placeholder="쿠폰 코드를 입력하세요"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyCoupon();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOfferIcon sx={{ color: 'rgba(0,0,0,0.4)' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 3,
                      bgcolor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                  disabled={couponLoading}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  sx={{
                    borderRadius: 999,
                    px: 4,
                    whiteSpace: 'nowrap',
                    minWidth: { xs: '100%', sm: 'auto' },
                  }}
                >
                  {couponLoading ? <CircularProgress size={20} color="inherit" /> : '적용'}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>

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
        {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
      </Snackbar>
    </PageLayout>
  );
}
