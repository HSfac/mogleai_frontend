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

          <Grid container spacing={2.5}>
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
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#f6f7fb' }}>
                월간 구독 플랜
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.5)', mt: 0.6 }}>
                매월 자동 충전 · 언제든지 취소 가능
              </Typography>
            </Box>
            <Chip
              icon={<AutorenewIcon sx={{ fontSize: 13 }} />}
              label="자동 충전"
              size="small"
              sx={{
                bgcolor: alpha('#7cc7ff', 0.1),
                color: '#7cc7ff',
                fontWeight: 700,
                '& .MuiChip-icon': { color: '#7cc7ff' },
                display: { xs: 'none', sm: 'flex' },
              }}
            />
          </Stack>

          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {subscriptionPlans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const isRecommended = plan.id === 'standard';

              return (
                <Grid item xs={12} md={4} key={plan.id}>
                  <Card
                    onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                    sx={{
                      ...CARD_SX,
                      height: '100%',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.15s ease',
                      ...(isSelected
                        ? {
                            border: '1.5px solid rgba(255, 95, 155, 0.55)',
                            background: 'rgba(255, 95, 155, 0.04)',
                            boxShadow: '0 8px 36px rgba(255, 95, 155, 0.16)',
                          }
                        : {
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              borderColor: 'rgba(255,255,255,0.14)',
                            },
                          }),
                    }}
                  >
                    {isSelected && (
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

                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f6f7fb' }}>
                          {plan.name}
                        </Typography>
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          {isRecommended && (
                            <Chip
                              label="추천"
                              size="small"
                              sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 700, height: 22, fontSize: '0.66rem' }}
                            />
                          )}
                          {isSelected && (
                            <CheckCircleIcon sx={{ color: '#ff5f9b', fontSize: 20 }} />
                          )}
                        </Stack>
                      </Stack>

                      <Stack direction="row" alignItems="baseline" spacing={0.5} mb={0.5}>
                        <Typography
                          variant="h4"
                          fontWeight={800}
                          sx={{ color: isSelected ? '#ff5f9b' : '#f6f7fb' }}
                        >
                          ₩{plan.price.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.38)' }}>
                          /월
                        </Typography>
                      </Stack>

                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(240,242,250,0.5)', mb: 2.5, lineHeight: 1.65, minHeight: 40 }}
                      >
                        {plan.description}
                      </Typography>

                      <Box
                        sx={{
                          borderRadius: '12px',
                          px: 2,
                          py: 1.5,
                          bgcolor: isSelected ? alpha('#ff5f9b', 0.08) : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isSelected ? 'rgba(255,95,155,0.18)' : 'rgba(255,255,255,0.07)'}`,
                          mb: 2.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.42)', display: 'block' }}>
                            월 지급량
                          </Typography>
                          <Typography variant="h6" fontWeight={800} sx={{ color: '#f6f7fb', lineHeight: 1.2 }}>
                            {plan.tokens.toLocaleString()}
                            <Typography component="span" variant="body2" sx={{ color: 'rgba(240,242,250,0.5)', ml: 0.5, fontWeight: 400 }}>
                              토큰
                            </Typography>
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.42)', display: 'block' }}>
                            토큰당
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: 'rgba(240,242,250,0.68)' }}>
                            {plan.perToken}원
                          </Typography>
                        </Box>
                      </Box>

                      <Stack spacing={0.9}>
                        {[
                          '매월 자동 충전',
                          '언제든지 취소 가능',
                          plan.id === 'basic' ? '기본 고객 지원' : '우선 고객 지원',
                        ].map((feature) => (
                          <Stack key={feature} direction="row" spacing={1} alignItems="center">
                            <CheckCircleIcon sx={{ fontSize: 14, color: '#7ddc86', flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.58)' }}>
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

          <Stack alignItems="center">
            <Button
              variant="contained"
              size="large"
              onClick={handleOpenDialog}
              disabled={paymentLoading}
              startIcon={<AutorenewIcon />}
              sx={{
                borderRadius: '14px',
                px: 5,
                py: 1.7,
                bgcolor: '#ff5f9b',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 4px 24px rgba(255,95,155,0.32)',
                '&:hover': { bgcolor: '#e84e8a', boxShadow: '0 4px 32px rgba(255,95,155,0.5)' },
              }}
            >
              {selectedSubscription.name} 플랜 시작하기&nbsp;·&nbsp;월 ₩{selectedSubscription.price.toLocaleString()}
            </Button>
            <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.36)', mt: 1.5 }}>
              카드 등록 후 매월 자동 결제 · 언제든지 취소 가능
            </Typography>
          </Stack>
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
