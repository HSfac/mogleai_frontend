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
  DialogTitle,
  DialogContent,
  DialogActions,
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

const panelSx = {
  borderRadius: 4,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'linear-gradient(180deg, rgba(21, 23, 35, 0.92), rgba(14, 16, 27, 0.88))',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 24px 60px rgba(8, 10, 18, 0.28)',
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
    { id: 'basic', name: '베이직', price: 9900, tokens: 300, description: '가벼운 이용자용' },
    { id: 'standard', name: '스탠다드', price: 19900, tokens: 1000, description: '일상 대화용' },
    { id: 'premium', name: '프리미엄', price: 49900, tokens: 5000, description: '헤비 유저용' },
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

  const featuredPackage = useMemo(
    () => packages.find((pkg) => pkg.popular) || packages[0] || null,
    [packages]
  );

  const selectedSubscription = subscriptionPlans.find((plan) => plan.id === selectedPlan) || subscriptionPlans[1];

  const summaryCards = useMemo(
    () => [
      {
        label: '현재 잔액',
        value: `${(user?.tokens || 0).toLocaleString()} 토큰`,
        helper: '바로 사용할 수 있는 대화 연료',
      },
      {
        label: '베스트 딜',
        value: featuredPackage ? `${featuredPackage.tokens.toLocaleString()} 토큰` : '패키지 준비중',
        helper: featuredPackage ? `토큰당 약 ${getPerTokenPrice(featuredPackage)}원` : '잠시 후 다시 확인해주세요',
      },
      {
        label: '선택한 구독',
        value: selectedSubscription.name,
        helper: `월 ${selectedSubscription.tokens.toLocaleString()} 토큰 자동 충전`,
      },
    ],
    [featuredPackage, selectedSubscription, user?.tokens]
  );

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
        <Box
          sx={{
            mx: { xs: 0, md: 3 },
            mt: { xs: 0, md: 3 },
            borderRadius: { xs: 0, md: 4 },
            overflow: 'hidden',
            background:
              'radial-gradient(circle at top right, rgba(255,255,255,0.16), transparent 26%), linear-gradient(135deg, #ff3366 0%, #ff5f9b 55%, #ff8fab 100%)',
            boxShadow: '0 24px 60px rgba(255, 51, 102, 0.24)',
          }}
        >
          <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3.5, md: 4.5 } }}>
            <Grid container spacing={3} alignItems="stretch">
              <Grid item xs={12} md={7}>
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                          bgcolor: 'rgba(255,255,255,0.16)',
                          color: '#fff',
                          fontWeight: 700,
                          '& .MuiChip-icon': { color: '#fff' },
                        }}
                      />
                    ))}
                  </Stack>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: '#fff',
                        mb: 1.2,
                        fontSize: { xs: '2rem', md: '2.8rem' },
                        lineHeight: 1.1,
                      }}
                    >
                      토큰 충전과 구독을
                      <br />
                      한 화면에서 결정하기
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', maxWidth: 560, lineHeight: 1.8 }}>
                      대화 빈도와 예산에 맞게 일회성 충전과 월간 구독을 바로 비교할 수 있게 정리했습니다.
                      많이 쓸수록 단가가 낮아지고, 정기 이용자는 자동 충전으로 흐름이 끊기지 않습니다.
                    </Typography>
                  </Box>

                  {featuredPackage && (
                    <Box
                      sx={{
                        borderRadius: 3,
                        px: 2.2,
                        py: 1.8,
                        bgcolor: 'rgba(0,0,0,0.18)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        maxWidth: 420,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.68)', letterSpacing: 0.4 }}>
                        추천 패키지
                      </Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mt: 0.5 }}>
                        {featuredPackage.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {(featuredPackage.tokens + (featuredPackage.bonus || 0)).toLocaleString()} 토큰 가치,
                        토큰당 약 {getPerTokenPrice(featuredPackage)}원
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                <Grid container spacing={1.5}>
                  {summaryCards.map((card) => (
                    <Grid item xs={12} sm={4} md={12} key={card.label}>
                      <Box
                        sx={{
                          height: '100%',
                          borderRadius: 3,
                          px: 2.2,
                          py: 2,
                          background: 'rgba(16, 14, 26, 0.28)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.68)', letterSpacing: 0.3 }}>
                          {card.label}
                        </Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', mt: 0.5 }}>
                          {card.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.74)' }}>
                          {card.helper}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
          <Grid container spacing={2} sx={{ mb: 5 }}>
            {[
              {
                icon: <BoltIcon sx={{ color: '#ffb347' }} />,
                title: '즉시 충전',
                description: '원할 때 필요한 만큼만 충전하고 바로 대화를 이어갈 수 있습니다.',
              },
              {
                icon: <AutorenewIcon sx={{ color: '#7ddc86' }} />,
                title: '월간 자동화',
                description: '매달 정해진 양을 채워주는 구독 플랜으로 잔액 관리 부담을 줄입니다.',
              },
              {
                icon: <VerifiedUserIcon sx={{ color: '#58a6ff' }} />,
                title: '검증된 결제',
                description: '토스페이먼츠 기반 인증 흐름으로 카드 등록과 결제가 안전하게 진행됩니다.',
              },
            ].map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <Card sx={{ ...panelSx, height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>
                        {item.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)', lineHeight: 1.7 }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mb: 5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} mb={2.5}>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
                  토큰 패키지
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)', mt: 0.6 }}>
                  자주 쓰는 사람일수록 상단 베스트 패키지나 보너스 포함 패키지가 유리합니다.
                </Typography>
              </Box>
              {featuredPackage && (
                <Chip
                  label={`추천 ${featuredPackage.name} · 토큰당 약 ${getPerTokenPrice(featuredPackage)}원`}
                  sx={{
                    alignSelf: { xs: 'flex-start', md: 'center' },
                    borderRadius: '12px',
                    bgcolor: alpha('#ff8fab', 0.14),
                    color: '#ff8fab',
                    fontWeight: 700,
                  }}
                />
              )}
            </Stack>

            <Grid container spacing={2}>
              {packages.map((pkg) => {
                const totalTokens = pkg.tokens + (pkg.bonus || 0);

                return (
                  <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                    <Card
                      sx={{
                        ...panelSx,
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        border: pkg.popular ? '1px solid rgba(255, 143, 171, 0.45)' : panelSx.border,
                        transition: 'transform 0.24s ease, border-color 0.24s ease',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          borderColor: 'rgba(255, 143, 171, 0.55)',
                        },
                      }}
                    >
                      {pkg.popular && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            px: 1.1,
                            py: 0.4,
                            borderRadius: '12px',
                            bgcolor: '#ff5f9b',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <StarIcon sx={{ fontSize: 14 }} /> BEST
                        </Box>
                      )}

                      <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.52)', fontWeight: 700, letterSpacing: 0.4 }}>
                          {pkg.name}
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', mt: 1 }}>
                          {totalTokens.toLocaleString()}
                          <Typography component="span" variant="body2" sx={{ color: 'rgba(255,255,255,0.54)', ml: 0.5 }}>
                            총 토큰 가치
                          </Typography>
                        </Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#ff6f9f', mt: 1.2 }}>
                          ₩{pkg.price.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)', mt: 0.4 }}>
                          기본 {pkg.tokens.toLocaleString()} 토큰 · 토큰당 약 {getPerTokenPrice(pkg)}원
                        </Typography>

                        <Stack spacing={1} sx={{ mt: 2.2, mb: 2.5 }}>
                          {pkg.bonus ? (
                            <Chip
                              icon={<StarIcon sx={{ fontSize: 14, color: '#ff8fab !important' }} />}
                              label={`보너스 +${pkg.bonus.toLocaleString()} 지급`}
                              size="small"
                              sx={{
                                borderRadius: '12px',
                                justifyContent: 'flex-start',
                                bgcolor: alpha('#ff8fab', 0.14),
                                color: '#ff8fab',
                                fontWeight: 700,
                              }}
                            />
                          ) : (
                            <Chip
                              label="필요할 때 쓰는 단건 충전"
                              size="small"
                              sx={{
                                borderRadius: '12px',
                                justifyContent: 'flex-start',
                                bgcolor: 'rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.68)',
                              }}
                            />
                          )}
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <CheckCircleIcon sx={{ fontSize: 16, color: '#7ddc86' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)' }}>
                              결제 후 바로 토큰이 활성화됩니다.
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
                            py: 1.2,
                            fontWeight: 800,
                            bgcolor: pkg.popular ? '#ff5f9b' : 'transparent',
                            color: '#fff',
                            borderColor: pkg.popular ? '#ff5f9b' : 'rgba(255,255,255,0.12)',
                            '&:hover': {
                              bgcolor: pkg.popular ? '#eb4f8d' : 'rgba(255,255,255,0.05)',
                              borderColor: '#ff8fab',
                            },
                          }}
                        >
                          {paymentLoading && selectedPackage?.id === pkg.id ? (
                            <CircularProgress size={20} sx={{ color: '#fff' }} />
                          ) : (
                            '이 패키지로 충전하기'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <Box sx={{ mb: 5 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} lg={8}>
                <Box sx={{ mb: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
                      월간 구독 플랜
                    </Typography>
                    <Chip
                      label="매월 자동 충전"
                      size="small"
                      sx={{ bgcolor: '#ff5f9b', color: '#fff', fontWeight: 700 }}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)' }}>
                    고정적으로 대화량이 많은 경우에는 자동 충전 플랜이 잔액 관리와 단가 측면에서 안정적입니다.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {subscriptionPlans.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    const isStandard = plan.id === 'standard';

                    return (
                      <Grid item xs={12} md={4} key={plan.id}>
                        <Card
                          onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                          sx={{
                            ...panelSx,
                            height: '100%',
                            cursor: 'pointer',
                            position: 'relative',
                            border: isSelected
                              ? '1px solid rgba(255, 143, 171, 0.55)'
                              : isStandard
                                ? '1px solid rgba(255, 143, 171, 0.28)'
                                : panelSx.border,
                            transition: 'transform 0.24s ease, border-color 0.24s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              borderColor: 'rgba(255, 143, 171, 0.55)',
                            },
                          }}
                        >
                          {isStandard && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 14,
                                right: 14,
                                px: 1.1,
                                py: 0.4,
                                borderRadius: '12px',
                                bgcolor: '#4caf50',
                                color: '#fff',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                              }}
                            >
                              추천
                            </Box>
                          )}

                          <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mb: 1 }}>
                              {plan.name}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="baseline">
                              <Typography variant="h4" fontWeight={800} sx={{ color: '#ff6f9f' }}>
                                ₩{plan.price.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.46)' }}>
                                /월
                              </Typography>
                            </Stack>

                            <Box
                              sx={{
                                mt: 2,
                                mb: 2,
                                px: 2,
                                py: 1.6,
                                borderRadius: 3,
                                bgcolor: alpha('#ff8fab', 0.1),
                                border: '1px solid rgba(255, 143, 171, 0.15)',
                              }}
                            >
                              <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
                                {plan.tokens.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.58)' }}>
                                토큰 / 월
                              </Typography>
                            </Box>

                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)', mb: 2 }}>
                              {plan.description}
                            </Typography>

                            <Stack spacing={1}>
                              <Stack direction="row" spacing={0.7} alignItems="center">
                                <CheckCircleIcon sx={{ fontSize: 16, color: '#7ddc86' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.66)' }}>
                                  자동 월간 충전
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={0.7} alignItems="center">
                                <CheckCircleIcon sx={{ fontSize: 16, color: '#7ddc86' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.66)' }}>
                                  언제든 취소 가능
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={0.7} alignItems="center">
                                <CheckCircleIcon sx={{ fontSize: 16, color: '#7ddc86' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.66)' }}>
                                  {plan.id === 'basic' ? '기본 지원 제공' : '우선 고객 지원 포함'}
                                </Typography>
                              </Stack>
                            </Stack>

                            {isSelected && (
                              <Chip
                                icon={<CheckCircleIcon sx={{ color: '#fff !important', fontSize: 14 }} />}
                                label="선택됨"
                                size="small"
                                sx={{ mt: 2.2, bgcolor: '#ff5f9b', color: '#fff', fontWeight: 700 }}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card sx={{ ...panelSx, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.52)', letterSpacing: 0.3 }}>
                      선택한 플랜
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', mt: 0.8 }}>
                      {selectedSubscription.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)', mt: 0.8, lineHeight: 1.7 }}>
                      월 {selectedSubscription.tokens.toLocaleString()} 토큰을 자동 충전하고, 사용량이 많은 기간에도 잔액이 끊기지 않도록 관리합니다.
                    </Typography>

                    <Box
                      sx={{
                        mt: 2.5,
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)', mb: 0.8 }}>
                        예상 결제
                      </Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#ff8fab' }}>
                        월 ₩{selectedSubscription.price.toLocaleString()}
                      </Typography>
                    </Box>

                    <Stack spacing={1.2} sx={{ mt: 2.5, mb: 3 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AutorenewIcon sx={{ color: '#7ddc86', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.66)' }}>
                          결제 정보 등록 후 매월 자동 충전
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <VerifiedUserIcon sx={{ color: '#58a6ff', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.66)' }}>
                          토스 인증 기반 안전한 빌링 절차
                        </Typography>
                      </Stack>
                    </Stack>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleOpenDialog}
                      sx={{
                        borderRadius: '12px',
                        py: 1.4,
                        bgcolor: '#ff5f9b',
                        fontWeight: 800,
                        '&:hover': {
                          bgcolor: '#eb4f8d',
                        },
                      }}
                    >
                      {selectedSubscription.name} 플랜 시작하기
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Card sx={panelSx}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.54)', mb: 2.5, textAlign: 'center' }}>
                안전하고 신뢰할 수 있는 결제
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LockIcon sx={{ color: '#7ddc86', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', fontWeight: 700 }}>
                    SSL 보안 결제
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <VerifiedUserIcon sx={{ color: '#58a6ff', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', fontWeight: 700 }}>
                    토스페이먼츠 인증
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CreditCardIcon sx={{ color: '#f38bff', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', fontWeight: 700 }}>
                    카드 정보 암호화
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
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
