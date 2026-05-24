'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { alpha } from '@mui/material/styles';
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
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
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
import { localizePath } from '@/lib/localePath';

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

const CARD_SX = {
  borderRadius: '18px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'rgba(18, 22, 34, 0.78)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)',
} as const;

export default function TokensPage() {
  const params = useParams<{ locale?: string }>();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'standard' | 'premium'>('standard');
  const tossPayments = useRef<any>(null);
  const tossClientKey = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY;
  const tokensPath = localizePath(params?.locale, '/tokens');
  const paymentSuccessPath = localizePath(params?.locale, '/payment/success');
  const paymentFailPath = localizePath(params?.locale, '/payment/fail');
  const subscriptionSuccessPath = localizePath(params?.locale, '/payment/subscription-success');

  const subscriptionPlans = [
    {
      id: 'basic',
      name: '베이직',
      price: 9900,
      tokens: 300,
      description: '가끔 사용하는 분들을 위한 입문 플랜',
      perToken: Math.round(9900 / 300),
    },
    {
      id: 'standard',
      name: '스탠다드',
      price: 19900,
      tokens: 1000,
      description: '매일 대화를 즐기는 분들을 위한 추천 플랜',
      perToken: Math.round(19900 / 1000),
    },
    {
      id: 'premium',
      name: '프리미엄',
      price: 49900,
      tokens: 5000,
      description: '대화량이 많은 헤비 유저를 위한 최고 가치 플랜',
      perToken: Math.round(49900 / 5000),
    },
  ];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    script.onload = () => {
      if (window.TossPayments && tossClientKey) {
        tossPayments.current = window.TossPayments(tossClientKey);
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
  }, [tossClientKey]);

  const handleBuyTokens = async (pkg: TokenPackage) => {
    if (paymentLoading) return;

    if (!isAuthenticated) {
      openLoginModal('토큰을 구매하려면 로그인이 필요해요', tokensPath);
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
        successUrl: `${window.location.origin}${paymentSuccessPath}`,
        failUrl: `${window.location.origin}${paymentFailPath}`,
      });
    } catch (error: any) {
      console.error('결제 시작 실패:', error);
      setToast({ severity: 'error', message: error.message || '결제 시작에 실패했습니다.' });
      setPaymentLoading(false);
    }
  };

  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      openLoginModal('구독을 시작하려면 로그인이 필요해요', tokensPath);
      return;
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleSubscription = async () => {
    setDialogOpen(false);
    setPaymentLoading(true);
    try {
      if (!tossClientKey) throw new Error('토스 결제 클라이언트 키가 설정되지 않았습니다.');
      if (!tossPayments.current) throw new Error('결제 시스템 초기화 실패');
      const customerKey = user?._id || '';
      const planType = selectedPlan;
      await tossPayments.current.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}${subscriptionSuccessPath}?planType=${planType}`,
        failUrl: `${window.location.origin}${paymentFailPath}`,
      });
    } catch (error: any) {
      console.error('구독 실패:', error);
      setToast({ severity: 'error', message: '구독을 시작하는데 실패했습니다.' });
      setPaymentLoading(false);
    }
  };

  const getPerTokenPrice = (pkg: TokenPackage) => Math.round(pkg.price / pkg.tokens);

  const selectedSubscription = subscriptionPlans.find((plan) => plan.id === selectedPlan) || subscriptionPlans[1];

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
          <CircularProgress sx={{ color: '#ff5f9b' }} />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 7 },
          background:
            'radial-gradient(circle at top right, rgba(124,199,255,0.08) 0%, transparent 50%), linear-gradient(160deg, rgba(255,95,155,0.1) 0%, transparent 50%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={3}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: '#ff5f9b', fontWeight: 700, letterSpacing: 2, fontSize: '0.72rem' }}
              >
                MONGLAI STORE
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.2rem', md: '3rem' },
                  lineHeight: 1.15,
                  color: '#f6f7fb',
                  mt: 0.8,
                }}
              >
                토큰 충전 &amp;<br />구독 플랜
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(240,242,250,0.6)', mt: 1.5, maxWidth: 480, lineHeight: 1.8 }}
              >
                일회성 충전부터 월간 구독까지 — 사용 패턴에 맞게 선택하세요.
              </Typography>
            </Box>

            {isAuthenticated && (
              <Box
                sx={{
                  borderRadius: '18px',
                  px: 3.5,
                  py: 3,
                  background: 'rgba(18,22,34,0.88)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minWidth: 200,
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(240,242,250,0.46)',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                  }}
                >
                  현재 잔액
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: '#f6f7fb', mt: 0.5, lineHeight: 1.1 }}>
                  {(user?.tokens || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ff5f9b', fontWeight: 700, mt: 0.3 }}>
                  토큰
                </Typography>
              </Box>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        {/* Token Packages */}
        <Box sx={{ mb: 9 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#f6f7fb' }}>
                토큰 패키지
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.5)', mt: 0.6 }}>
                결제 즉시 충전 · 만료 기간 없음
              </Typography>
            </Box>
            <Chip
              icon={<BoltIcon sx={{ fontSize: 13 }} />}
              label="즉시 충전"
              size="small"
              sx={{
                bgcolor: alpha('#ffb347', 0.12),
                color: '#ffb347',
                fontWeight: 700,
                '& .MuiChip-icon': { color: '#ffb347' },
                display: { xs: 'none', sm: 'flex' },
              }}
            />
          </Stack>

          <Grid container spacing={2.5} justifyContent="center">
            {packages.map((pkg) => {
              const totalTokens = pkg.tokens + (pkg.bonus || 0);
              const isLoading = paymentLoading && selectedPackage?.id === pkg.id;

              return (
                <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                  <Card
                    sx={{
                      ...CARD_SX,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      ...(pkg.popular && {
                        border: '1.5px solid rgba(255, 95, 155, 0.45)',
                        background: 'rgba(22, 16, 32, 0.88)',
                      }),
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: pkg.popular
                          ? '0 20px 56px rgba(255, 95, 155, 0.2)'
                          : '0 20px 56px rgba(0, 0, 0, 0.36)',
                      },
                    }}
                  >
                    {pkg.popular && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: 'linear-gradient(90deg, #ff5f9b, #ff9ec2)',
                          borderRadius: '18px 18px 0 0',
                        }}
                      />
                    )}

                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(240,242,250,0.4)',
                              fontWeight: 700,
                              letterSpacing: 0.8,
                              textTransform: 'uppercase',
                              fontSize: '0.66rem',
                            }}
                          >
                            {pkg.name}
                          </Typography>
                          <Stack direction="row" alignItems="baseline" spacing={0.8} mt={0.4}>
                            <Typography variant="h3" fontWeight={800} sx={{ color: '#f6f7fb', lineHeight: 1 }}>
                              {totalTokens.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.4)' }}>
                              토큰
                            </Typography>
                          </Stack>
                        </Box>
                        {pkg.popular && (
                          <Chip
                            icon={<StarIcon sx={{ fontSize: 12, color: '#fff !important' }} />}
                            label="BEST"
                            size="small"
                            sx={{
                              bgcolor: '#ff5f9b',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '0.66rem',
                              height: 22,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Stack>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2 }} />

                      <Stack spacing={1.2} sx={{ mb: 3, flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.5)' }}>
                            가격
                          </Typography>
                          <Typography variant="h6" fontWeight={800} sx={{ color: '#ff5f9b' }}>
                            ₩{pkg.price.toLocaleString()}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.5)' }}>
                            토큰당
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: 'rgba(240,242,250,0.68)' }}>
                            약 {getPerTokenPrice(pkg)}원
                          </Typography>
                        </Stack>
                        {pkg.bonus ? (
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.5)' }}>
                              보너스
                            </Typography>
                            <Chip
                              label={`+${pkg.bonus.toLocaleString()} 토큰`}
                              size="small"
                              sx={{
                                bgcolor: alpha('#7ddc86', 0.12),
                                color: '#7ddc86',
                                fontWeight: 700,
                                height: 20,
                                fontSize: '0.7rem',
                              }}
                            />
                          </Stack>
                        ) : null}
                        <Stack direction="row" spacing={0.8} alignItems="center" pt={0.5}>
                          <CheckCircleIcon sx={{ fontSize: 14, color: '#7ddc86' }} />
                          <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.5)' }}>
                            결제 후 즉시 잔액에 반영
                          </Typography>
                        </Stack>
                      </Stack>

                      <Button
                        fullWidth
                        variant={pkg.popular ? 'contained' : 'outlined'}
                        onClick={() => handleBuyTokens(pkg)}
                        disabled={paymentLoading}
                        sx={{
                          borderRadius: '12px',
                          py: 1.3,
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          ...(pkg.popular
                            ? {
                                bgcolor: '#ff5f9b',
                                color: '#fff',
                                boxShadow: '0 4px 20px rgba(255,95,155,0.3)',
                                '&:hover': { bgcolor: '#e84e8a', boxShadow: '0 4px 28px rgba(255,95,155,0.45)' },
                              }
                            : {
                                borderColor: 'rgba(255,255,255,0.12)',
                                color: 'rgba(240,242,250,0.76)',
                                '&:hover': {
                                  borderColor: 'rgba(255,95,155,0.4)',
                                  bgcolor: 'rgba(255,95,155,0.05)',
                                  color: '#f6f7fb',
                                },
                              }),
                        }}
                      >
                        {isLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : '충전하기'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Subscription Plans */}
        <Box sx={{ mb: 7 }}>
          {/* Section header */}
          <Box sx={{ mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#f6f7fb' }}>
                월간 구독 플랜
              </Typography>
              <Chip
                icon={<AutorenewIcon sx={{ fontSize: 13 }} />}
                label="자동 충전"
                size="small"
                sx={{
                  bgcolor: alpha('#7cc7ff', 0.1),
                  color: '#7cc7ff',
                  fontWeight: 700,
                  '& .MuiChip-icon': { color: '#7cc7ff' },
                }}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'rgba(240,242,250,0.5)', maxWidth: 560, lineHeight: 1.8 }}>
              매월 토큰이 자동으로 충전됩니다. 사용량이 많을수록 단가가 낮아지며, 언제든지 취소할 수 있습니다.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {subscriptionPlans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const isRecommended = plan.id === 'standard';

              const tierConfig = {
                basic: { color: '#7cc7ff', bgAccent: 'rgba(124,199,255,0.06)', label: 'BASIC', features: ['월 300 토큰 지급', '매월 자동 충전', '기본 고객 지원', '언제든지 취소'] },
                standard: { color: '#ff5f9b', bgAccent: 'rgba(255,95,155,0.06)', label: 'STANDARD', features: ['월 1,000 토큰 지급', '매월 자동 충전', '우선 고객 지원', '언제든지 취소'] },
                premium: { color: '#f38bff', bgAccent: 'rgba(243,139,255,0.06)', label: 'PREMIUM', features: ['월 5,000 토큰 지급', '매월 자동 충전', '전담 고객 지원', '언제든지 취소'] },
              }[plan.id as 'basic' | 'standard' | 'premium'];

              return (
                <Grid item xs={12} md={4} key={plan.id}>
                  <Card
                    onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '20px',
                      border: isSelected
                        ? `2px solid ${tierConfig.color}`
                        : '1.5px solid rgba(255,255,255,0.08)',
                      background: isSelected
                        ? `linear-gradient(160deg, ${tierConfig.bgAccent} 0%, rgba(18,22,34,0.95) 60%)`
                        : 'rgba(18,22,34,0.78)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: isSelected
                        ? `0 16px 56px ${tierConfig.color}28`
                        : '0 8px 32px rgba(0,0,0,0.24)',
                      transition: 'all 0.22s ease',
                      '&:hover': !isSelected
                        ? {
                            transform: 'translateY(-4px)',
                            border: `1.5px solid ${tierConfig.color}44`,
                            boxShadow: `0 16px 48px rgba(0,0,0,0.32)`,
                          }
                        : {},
                    }}
                  >
                    {/* Top accent line */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: isSelected
                          ? `linear-gradient(90deg, ${tierConfig.color}, ${tierConfig.color}88)`
                          : `linear-gradient(90deg, ${tierConfig.color}44, transparent)`,
                        transition: 'all 0.22s ease',
                      }}
                    />

                    <CardContent sx={{ p: { xs: 3, md: 4 }, pt: { xs: 3.5, md: 4.5 } }}>
                      {/* Tier badge + recommend */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isSelected ? tierConfig.color : 'rgba(240,242,250,0.38)',
                            fontWeight: 800,
                            letterSpacing: 1.5,
                            fontSize: '0.68rem',
                            transition: 'color 0.2s',
                          }}
                        >
                          {tierConfig.label}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {isRecommended && (
                            <Box
                              sx={{
                                px: 1.2,
                                py: 0.3,
                                borderRadius: '8px',
                                bgcolor: 'rgba(76,175,80,0.15)',
                                border: '1px solid rgba(76,175,80,0.3)',
                                color: '#7ddc86',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                letterSpacing: 0.5,
                              }}
                            >
                              추천
                            </Box>
                          )}
                          {isSelected && (
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                bgcolor: tierConfig.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />
                            </Box>
                          )}
                        </Stack>
                      </Stack>

                      {/* Plan name */}
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{ color: '#f6f7fb', mb: 1, lineHeight: 1 }}
                      >
                        {plan.name}
                      </Typography>

                      {/* Price */}
                      <Stack direction="row" alignItems="baseline" spacing={0.5} mb={0.8}>
                        <Typography
                          sx={{
                            fontSize: { xs: '2.4rem', md: '2.8rem' },
                            fontWeight: 800,
                            lineHeight: 1,
                            color: isSelected ? tierConfig.color : '#f6f7fb',
                            transition: 'color 0.2s',
                          }}
                        >
                          ₩{plan.price.toLocaleString()}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(240,242,250,0.36)', pb: 0.5 }}>
                          /월
                        </Typography>
                      </Stack>

                      <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.48)', mb: 3.5, lineHeight: 1.6 }}>
                        {plan.description}
                      </Typography>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 3 }} />

                      {/* Token highlight */}
                      <Box
                        sx={{
                          borderRadius: '14px',
                          px: 2.5,
                          py: 2,
                          mb: 3,
                          background: isSelected
                            ? `linear-gradient(135deg, ${tierConfig.color}18, ${tierConfig.color}08)`
                            : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isSelected ? `${tierConfig.color}30` : 'rgba(255,255,255,0.07)'}`,
                          transition: 'all 0.22s ease',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.4)', letterSpacing: 0.5 }}>
                              매월 지급
                            </Typography>
                            <Stack direction="row" alignItems="baseline" spacing={0.6} mt={0.2}>
                              <Typography
                                variant="h5"
                                fontWeight={800}
                                sx={{ color: isSelected ? tierConfig.color : '#f6f7fb', transition: 'color 0.2s' }}
                              >
                                {plan.tokens.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.46)' }}>
                                토큰
                              </Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.4)', letterSpacing: 0.5 }}>
                              토큰당
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight={800}
                              sx={{ color: 'rgba(240,242,250,0.72)', mt: 0.2 }}
                            >
                              {plan.perToken}원
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Features */}
                      <Stack spacing={1.2}>
                        {tierConfig.features.map((feature) => (
                          <Stack key={feature} direction="row" spacing={1.2} alignItems="center">
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                bgcolor: isSelected ? `${tierConfig.color}22` : 'rgba(125,220,134,0.12)',
                                border: `1px solid ${isSelected ? `${tierConfig.color}44` : 'rgba(125,220,134,0.2)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                              }}
                            >
                              <CheckCircleIcon
                                sx={{
                                  fontSize: 12,
                                  color: isSelected ? tierConfig.color : '#7ddc86',
                                  transition: 'color 0.2s',
                                }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.65)', lineHeight: 1.4 }}>
                              {feature}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* CTA checkout strip */}
          <Box
            sx={{
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.09)',
              background: 'linear-gradient(135deg, rgba(255,95,155,0.08) 0%, rgba(18,22,34,0.9) 60%)',
              backdropFilter: 'blur(20px)',
              px: { xs: 3, md: 4.5 },
              py: { xs: 3, md: 3.5 },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={3}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={0.8}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: '#f6f7fb' }}>
                    {selectedSubscription.name} 플랜 선택됨
                  </Typography>
                  <CheckCircleIcon sx={{ color: '#ff5f9b', fontSize: 20 }} />
                </Stack>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.4)' }}>월 결제</Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#ff5f9b' }}>
                      ₩{selectedSubscription.price.toLocaleString()}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.4)' }}>월 지급 토큰</Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#f6f7fb' }}>
                      {selectedSubscription.tokens.toLocaleString()}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', display: { xs: 'none', md: 'block' } }} />
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.4)' }}>토큰당</Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: 'rgba(240,242,250,0.7)' }}>
                      {selectedSubscription.perToken}원
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Stack alignItems={{ xs: 'stretch', sm: 'flex-end' }} spacing={1} sx={{ flexShrink: 0 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleOpenDialog}
                  disabled={paymentLoading}
                  startIcon={<AutorenewIcon />}
                  sx={{
                    borderRadius: '14px',
                    px: { xs: 3, md: 4 },
                    py: 1.6,
                    bgcolor: '#ff5f9b',
                    fontWeight: 800,
                    fontSize: '1rem',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 24px rgba(255,95,155,0.35)',
                    '&:hover': { bgcolor: '#e84e8a', boxShadow: '0 4px 36px rgba(255,95,155,0.55)' },
                  }}
                >
                  구독 시작하기
                </Button>
                <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.32)', textAlign: { xs: 'left', sm: 'right' } }}>
                  카드 등록 후 매월 자동 결제 · 언제든지 취소 가능
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Trust Badges */}
        <Box
          sx={{
            borderRadius: '16px',
            px: { xs: 3, sm: 5 },
            py: 2.5,
            bgcolor: 'rgba(18,22,34,0.6)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 5 }}
            justifyContent="center"
            alignItems="center"
          >
            {[
              { icon: <LockIcon sx={{ color: '#7ddc86', fontSize: 17 }} />, label: 'SSL 보안 결제' },
              { icon: <VerifiedUserIcon sx={{ color: '#7cc7ff', fontSize: 17 }} />, label: '토스페이먼츠 인증' },
              { icon: <CreditCardIcon sx={{ color: '#f38bff', fontSize: 17 }} />, label: '카드 정보 암호화' },
            ].map((item) => (
              <Stack key={item.label} direction="row" spacing={1} alignItems="center">
                {item.icon}
                <Typography variant="body2" fontWeight={600} sx={{ color: 'rgba(240,242,250,0.54)' }}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Container>

      {/* 플랜 비교 테이블 */}
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h5" fontWeight={800} color="#f6f7fb" textAlign="center" mb={1}>
          플랜 비교
        </Typography>
        <Typography variant="body2" color="rgba(240,242,250,0.5)" textAlign="center" mb={4}>
          내 사용 패턴에 맞는 플랜을 선택하세요
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 560 }}>
            {/* 헤더 */}
            <Grid container sx={{ mb: 1 }}>
              <Grid item xs={4} />
              {[
                { name: '베이직', color: '#7cc7ff' },
                { name: '스탠다드', color: '#ff5f9b' },
                { name: '프리미엄', color: '#f38bff' },
              ].map(({ name, color }) => (
                <Grid item xs={8 / 3} key={name} sx={{ textAlign: 'center' }}>
                  <Typography fontWeight={700} sx={{ color, fontSize: '0.9rem' }}>{name}</Typography>
                </Grid>
              ))}
            </Grid>
            {/* 행들 */}
            {[
              { label: '월 토큰', values: ['300', '1,000', '5,000'] },
              { label: '토큰당 가격', values: ['₩33', '₩20', '₩10'] },
              { label: '월 요금', values: ['₩9,900', '₩19,900', '₩49,900'] },
              { label: '우선 지원', values: [false, true, true] },
              { label: '전담 지원', values: [false, false, true] },
              { label: '자동 충전', values: [true, true, true] },
              { label: '언제든 취소', values: [true, true, true] },
            ].map(({ label, values }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', py: 1.2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ width: '33.3%', flexShrink: 0 }}>
                  <Typography variant="body2" color="rgba(240,242,250,0.6)" fontSize="0.85rem">{label}</Typography>
                </Box>
                {values.map((val, i) => (
                  <Box key={i} sx={{ width: '22.2%', textAlign: 'center', flexShrink: 0 }}>
                    {typeof val === 'boolean' ? (
                      val
                        ? <CheckCircleIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                        : <Typography color="rgba(255,255,255,0.2)" fontSize="0.9rem">—</Typography>
                    ) : (
                      <Typography variant="body2" color="#f6f7fb" fontWeight={600} fontSize="0.85rem">{val}</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Subscription Confirm Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            bgcolor: '#0e1118',
            borderRadius: '22px',
            maxWidth: 420,
            width: '100%',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 32px 96px rgba(0,0,0,0.7)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Dialog header */}
          <Box
            sx={{
              background:
                'linear-gradient(135deg, rgba(255,95,155,0.14) 0%, rgba(124,199,255,0.06) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              px: 3.5,
              pt: 3.5,
              pb: 3,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '16px',
                bgcolor: alpha('#ff5f9b', 0.14),
                border: '1px solid rgba(255,95,155,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <AutorenewIcon sx={{ fontSize: 28, color: '#ff5f9b' }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#f6f7fb' }}>
              구독 시작 확인
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.5)', mt: 0.5 }}>
              아래 내용으로 구독이 시작됩니다
            </Typography>
          </Box>

          {/* Dialog body */}
          <Box sx={{ px: 3.5, py: 3 }}>
            <Box
              sx={{
                borderRadius: '14px',
                p: 2.5,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                mb: 2.5,
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.5)' }}>플랜</Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#f6f7fb' }}>
                    {selectedSubscription.name}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.5)' }}>월 지급 토큰</Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#f6f7fb' }}>
                    {selectedSubscription.tokens.toLocaleString()} 토큰
                  </Typography>
                </Stack>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.5)' }}>월 결제금액</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: '#ff5f9b' }}>
                    ₩{selectedSubscription.price.toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Typography
              variant="caption"
              sx={{ color: 'rgba(240,242,250,0.34)', display: 'block', textAlign: 'center', lineHeight: 1.7 }}
            >
              카드 정보 등록 후 매월 자동으로 결제됩니다.
              <br />
              언제든지 마이페이지에서 취소할 수 있습니다.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3.5, pb: 3.5, pt: 0, gap: 1.5 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              flex: 1,
              borderRadius: '12px',
              py: 1.3,
              fontWeight: 700,
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'rgba(240,242,250,0.55)',
              '&:hover': { borderColor: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(255,255,255,0.04)' },
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSubscription}
            sx={{
              flex: 1.5,
              borderRadius: '12px',
              py: 1.3,
              fontWeight: 800,
              bgcolor: '#ff5f9b',
              boxShadow: '0 4px 20px rgba(255,95,155,0.3)',
              '&:hover': { bgcolor: '#e84e8a', boxShadow: '0 4px 28px rgba(255,95,155,0.45)' },
            }}
          >
            결제 정보 등록
          </Button>
        </DialogActions>
      </Dialog>

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
