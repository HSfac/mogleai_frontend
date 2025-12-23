'use client';

import { useEffect, useRef, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import TokenIcon from '@mui/icons-material/Token';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AutorenewIcon from '@mui/icons-material/Autorenew';
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

export default function TokensPage() {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'standard' | 'premium'>('standard');
  const tossPayments = useRef<any>(null);

  const subscriptionPlans = [
    { id: 'basic', name: '베이직', price: 9900, tokens: 300, description: '가벼운 이용자용' },
    { id: 'standard', name: '스탠다드', price: 19900, tokens: 1000, description: '일상 대화용' },
    { id: 'premium', name: '프리미엄', price: 49900, tokens: 5000, description: '헤비 유저용' },
  ];

  useEffect(() => {
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
  }, []);

  const handleBuyTokens = async (pkg: TokenPackage) => {
    if (paymentLoading) return;

    if (!isAuthenticated) {
      openLoginModal('토큰을 구매하려면 로그인이 필요해요', '/tokens');
      return;
    }

    setSelectedPackage(pkg);
    setPaymentLoading(true);

    try {
      const paymentData = await paymentService.buyTokens(pkg.price, pkg.tokens);
      if (paymentData?.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
        return;
      }

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

  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      openLoginModal('구독을 시작하려면 로그인이 필요해요', '/tokens');
      return;
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleSubscription = async () => {
    setDialogOpen(false);
    setPaymentLoading(true);
    try {
      if (!tossPayments.current) throw new Error('결제 시스템 초기화 실패');
      const customerKey = user?._id || '';
      const planType = selectedPlan;
      await tossPayments.current.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/payment/subscription-success?planType=${planType}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error: any) {
      console.error('구독 실패:', error);
      setToast({ severity: 'error', message: '구독을 시작하는데 실패했습니다.' });
      setPaymentLoading(false);
    }
  };

  const getPerTokenPrice = (pkg: TokenPackage) => Math.round(pkg.price / pkg.tokens);

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ width: '100%', bgcolor: '#1a1a1a', minHeight: '100vh' }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
            <CircularProgress sx={{ color: '#ff3366' }} />
          </Box>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box sx={{ width: '100%', bgcolor: '#1a1a1a', minHeight: '100vh' }}>
        {/* 헤더 배너 */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #ff3366 0%, #ff6699 100%)',
            borderRadius: { xs: 0, md: 1 },
            mx: { xs: 0, md: 3 },
            mt: { xs: 0, md: 3 },
            p: { xs: 3, md: 4 },
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(255, 51, 102, 0.3)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: '#fff',
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                토큰 충전소
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 400 }}>
                AI 캐릭터와의 대화에 사용할 토큰을 충전하세요. 더 많이 구매할수록 저렴해집니다!
              </Typography>
            </Box>

            {/* 보유 토큰 표시 */}
            {user && (
              <Box
                sx={{
                  bgcolor: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 1,
                  px: 3,
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <TokenIcon sx={{ color: '#fff', fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                    보유 토큰
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                    {(user.tokens || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>

          {/* 하이라이트 칩 */}
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" sx={{ gap: 1 }}>
            {[
              { icon: <BoltIcon sx={{ fontSize: 14 }} />, label: '즉시 충전' },
              { icon: <AutorenewIcon sx={{ fontSize: 14 }} />, label: '자동 구독' },
              { icon: <VerifiedUserIcon sx={{ fontSize: 14 }} />, label: '안전 결제' },
            ].map((item) => (
              <Chip
                key={item.label}
                icon={item.icon}
                label={item.label}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#fff' },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
          {/* 토큰 패키지 섹션 */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 2 }}>
              토큰 패키지
            </Typography>

            <Grid container spacing={2}>
              {packages.map((pkg, index) => (
                <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                  <Card
                    sx={{
                      bgcolor: '#242424',
                      borderRadius: 1,
                      border: pkg.popular ? '2px solid #ff3366' : '1px solid #333',
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(255, 51, 102, 0.2)',
                        borderColor: '#ff3366',
                      },
                    }}
                  >
                    {/* 인기 배지 */}
                    {pkg.popular && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: '#ff3366',
                          color: '#fff',
                          px: 1,
                          py: 0.3,
                          borderRadius: 1,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.3,
                        }}
                      >
                        <StarIcon sx={{ fontSize: 12 }} /> BEST
                      </Box>
                    )}

                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                        {pkg.name}
                      </Typography>

                      <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', my: 1 }}>
                        {pkg.tokens.toLocaleString()}
                        <Typography component="span" variant="body2" sx={{ color: '#999', ml: 0.5 }}>
                          토큰
                        </Typography>
                      </Typography>

                      <Typography variant="h5" fontWeight={700} sx={{ color: '#ff3366', mb: 0.5 }}>
                        ₩{pkg.price.toLocaleString()}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 2 }}>
                        토큰당 약 {getPerTokenPrice(pkg)}원
                      </Typography>

                      {pkg.bonus && (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: 12, color: '#ff3366 !important' }} />}
                          label={`+${pkg.bonus.toLocaleString()} 보너스`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 51, 102, 0.1)',
                            color: '#ff3366',
                            fontWeight: 600,
                            mb: 2,
                            width: '100%',
                            justifyContent: 'center',
                          }}
                        />
                      )}

                      <Button
                        fullWidth
                        variant={pkg.popular ? 'contained' : 'outlined'}
                        onClick={() => handleBuyTokens(pkg)}
                        disabled={paymentLoading}
                        sx={{
                          borderRadius: 1,
                          py: 1.2,
                          fontWeight: 700,
                          bgcolor: pkg.popular ? '#ff3366' : 'transparent',
                          color: pkg.popular ? '#fff' : '#ff3366',
                          borderColor: '#ff3366',
                          '&:hover': {
                            bgcolor: pkg.popular ? '#e62e5c' : 'rgba(255, 51, 102, 0.1)',
                            borderColor: '#ff3366',
                          },
                        }}
                      >
                        {paymentLoading && selectedPackage?.id === pkg.id ? (
                          <CircularProgress size={20} sx={{ color: pkg.popular ? '#fff' : '#ff3366' }} />
                        ) : (
                          '구매하기'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 구독 플랜 섹션 */}
          <Box sx={{ mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                월간 구독 플랜
              </Typography>
              <Chip
                label="매월 자동 충전"
                size="small"
                sx={{ bgcolor: '#ff3366', color: '#fff', fontWeight: 600 }}
              />
            </Stack>

            <Grid container spacing={2}>
              {subscriptionPlans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const isStandard = plan.id === 'standard';

                return (
                  <Grid item xs={12} sm={4} key={plan.id}>
                    <Card
                      onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                      sx={{
                        bgcolor: '#242424',
                        borderRadius: 1,
                        border: isSelected ? '2px solid #ff3366' : isStandard ? '1px solid #ff3366' : '1px solid #333',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          borderColor: '#ff3366',
                        },
                      }}
                    >
                      {isStandard && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: '#4caf50',
                            color: '#fff',
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                          }}
                        >
                          추천
                        </Box>
                      )}

                      <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>
                          {plan.name}
                        </Typography>

                        <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={0.5}>
                          <Typography variant="h4" fontWeight={800} sx={{ color: '#ff3366' }}>
                            ₩{plan.price.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            /월
                          </Typography>
                        </Stack>

                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 51, 102, 0.1)',
                            borderRadius: 1,
                            py: 1.5,
                            px: 2,
                            my: 2,
                          }}
                        >
                          <Typography variant="h5" fontWeight={700} sx={{ color: '#ff3366' }}>
                            {plan.tokens.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            토큰/월
                          </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
                          {plan.description}
                        </Typography>

                        <Stack spacing={0.8} alignItems="flex-start" sx={{ mb: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                            <Typography variant="caption" sx={{ color: '#ccc' }}>자동 월간 충전</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                            <Typography variant="caption" sx={{ color: '#ccc' }}>언제든 취소 가능</Typography>
                          </Stack>
                          {plan.id !== 'basic' && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                              <Typography variant="caption" sx={{ color: '#ccc' }}>우선 고객 지원</Typography>
                            </Stack>
                          )}
                        </Stack>

                        {isSelected && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ color: '#fff !important', fontSize: 14 }} />}
                            label="선택됨"
                            size="small"
                            sx={{ bgcolor: '#ff3366', color: '#fff', fontWeight: 600 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleOpenDialog}
                sx={{
                  bgcolor: '#ff3366',
                  borderRadius: 1,
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#e62e5c',
                  },
                }}
              >
                {subscriptionPlans.find((p) => p.id === selectedPlan)?.name} 플랜으로 구독 시작하기
              </Button>
            </Box>
          </Box>

          {/* 보안 배지 */}
          <Box
            sx={{
              bgcolor: '#242424',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              border: '1px solid #333',
            }}
          >
            <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
              안전하고 신뢰할 수 있는 결제
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <LockIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#ccc', fontWeight: 600 }}>SSL 보안 결제</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <VerifiedUserIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#ccc', fontWeight: 600 }}>토스페이먼츠 인증</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CreditCardIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#ccc', fontWeight: 600 }}>카드 정보 암호화</Typography>
              </Stack>
            </Stack>
          </Box>
        </Container>

        {/* 구독 확인 다이얼로그 */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: { bgcolor: '#242424', borderRadius: 1, maxWidth: 360, border: '1px solid #333' },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', pt: 3, color: '#fff' }}>
            구독을 시작하시겠습니까?
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 51, 102, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <CreditCardIcon sx={{ fontSize: 28, color: '#ff3366' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }} gutterBottom>
                {subscriptionPlans.find((p) => p.id === selectedPlan)?.name} 플랜
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#ff3366' }} gutterBottom>
                월 ₩{subscriptionPlans.find((p) => p.id === selectedPlan)?.price.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                매월 {subscriptionPlans.find((p) => p.id === selectedPlan)?.tokens.toLocaleString()}개의 토큰이 자동으로 충전됩니다.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{ flex: 1, borderRadius: 1, py: 1.2, color: '#999', borderColor: '#444', '&:hover': { borderColor: '#666' } }}
              variant="outlined"
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSubscription}
              sx={{
                flex: 1,
                borderRadius: 1,
                py: 1.2,
                bgcolor: '#ff3366',
                fontWeight: 700,
                '&:hover': { bgcolor: '#e62e5c' },
              }}
            >
              결제 정보 등록
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

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
