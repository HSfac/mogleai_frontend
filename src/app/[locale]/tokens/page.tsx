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
  Grow,
  keyframes,
} from '@mui/material';
import TokenIcon from '@mui/icons-material/Token';
import SettingsIcon from '@mui/icons-material/Settings';
import PagesIcon from '@mui/icons-material/Pages';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import DiamondIcon from '@mui/icons-material/Diamond';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/paymentService';

// 애니메이션
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

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
  { label: '즉시 충전', icon: <BoltIcon />, description: '결제 완료 후 바로 사용' },
  { label: '자동 구독', icon: <AutorenewIcon />, description: '매달 자동 충전' },
  { label: '안전 결제', icon: <VerifiedUserIcon />, description: '토스페이먼츠 보안' },
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
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'standard' | 'premium'>('basic');
  const tossPayments = useRef<any>(null);

  const subscriptionPlans = [
    { id: 'basic', name: '베이직', price: 9900, tokens: 300, description: '가벼운 이용자용' },
    { id: 'standard', name: '스탠다드', price: 19900, tokens: 1000, description: '일상 대화용' },
    { id: 'premium', name: '프리미엄', price: 49900, tokens: 5000, description: '헤비 유저용' },
  ];

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
      const planType = selectedPlan;
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

  // 토큰당 가격 계산
  const getPerTokenPrice = (pkg: TokenPackage) => {
    return Math.round(pkg.price / pkg.tokens);
  };

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 헤더 섹션 - 글래스모피즘 스타일 */}
        <Box
          sx={{
            borderRadius: 6,
            background: 'linear-gradient(135deg, rgba(255,95,155,0.95) 0%, rgba(255,140,180,0.9) 50%, rgba(255,180,200,0.85) 100%)',
            color: '#fff',
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 6 },
            mb: 5,
            boxShadow: '0 20px 60px rgba(255, 95, 155, 0.3), 0 8px 20px rgba(255, 95, 155, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 90% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: `${float} 3s ease-in-out infinite`,
                  }}
                >
                  <DiamondIcon sx={{ fontSize: 28, color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    토큰 충전소
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="body1" sx={{ maxWidth: 500, opacity: 0.95, lineHeight: 1.7, mb: 3 }}>
                AI 캐릭터와의 대화에 사용할 토큰을 충전하세요.
                더 많이 구매할수록 토큰당 가격이 저렴해집니다!
              </Typography>

              {/* 현재 토큰 잔액 */}
              {user && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <TokenIcon sx={{ fontSize: 24 }} />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                      현재 보유 토큰
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {(user.tokens || 0).toLocaleString()}개
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* 하이라이트 카드 */}
            <Stack spacing={1.5}>
              {heroHighlights.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.5,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Box sx={{ color: '#fff', display: 'flex' }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{item.label}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{item.description}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>

        {/* 토큰 패키지 섹션 */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <TokenIcon sx={{ color: '#ff5f9b' }} />
            <Typography variant="h6" fontWeight={700}>
              토큰 패키지
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {packages.map((pkg, index) => (
              <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                <Grow in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      borderRadius: 5,
                      border: pkg.popular ? '3px solid #ff5f9b' : '1px solid rgba(255, 95, 155, 0.15)',
                      boxShadow: pkg.popular
                        ? '0 15px 50px rgba(255, 95, 155, 0.25)'
                        : '0 4px 20px rgba(0,0,0,0.06)',
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: pkg.popular ? 'scale(1.02)' : 'scale(1)',
                      '&:hover': {
                        transform: pkg.popular ? 'scale(1.05) translateY(-8px)' : 'scale(1.02) translateY(-8px)',
                        boxShadow: '0 20px 50px rgba(255, 95, 155, 0.3)',
                      },
                    }}
                  >
                    {/* 인기 배지 */}
                    {pkg.popular && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: 'linear-gradient(135deg, #ff5f9b 0%, #ff8fab 100%)',
                          background: 'linear-gradient(135deg, #ff5f9b 0%, #ff8fab 100%)',
                          color: '#fff',
                          px: 3,
                          py: 0.75,
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          boxShadow: '0 4px 15px rgba(255, 95, 155, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          animation: `${pulse} 2s infinite`,
                        }}
                      >
                        <StarIcon sx={{ fontSize: 14 }} /> BEST
                      </Box>
                    )}

                    <CardContent sx={{ p: 3, pt: pkg.popular ? 4 : 3 }}>
                      {/* 패키지 이름 */}
                      <Typography variant="overline" color="text.secondary" fontWeight={600}>
                        {pkg.name}
                      </Typography>

                      {/* 토큰 수량 */}
                      <Stack direction="row" alignItems="baseline" spacing={1} mb={1}>
                        <Typography variant="h3" fontWeight={800} color={pkg.popular ? '#ff5f9b' : 'text.primary'}>
                          {pkg.tokens.toLocaleString()}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                          토큰
                        </Typography>
                      </Stack>

                      {/* 가격 */}
                      <Typography variant="h5" fontWeight={700} color="#ff5f9b" mb={1}>
                        ₩{pkg.price.toLocaleString()}
                      </Typography>

                      {/* 토큰당 가격 */}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        토큰당 약 {getPerTokenPrice(pkg)}원
                      </Typography>

                      {/* 보너스 */}
                      {pkg.bonus && (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: 14, color: '#ff5f9b !important' }} />}
                          label={`+${pkg.bonus.toLocaleString()} 보너스`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 95, 155, 0.1)',
                            color: '#c3006e',
                            fontWeight: 600,
                            mb: 2,
                            width: '100%',
                            justifyContent: 'center',
                          }}
                        />
                      )}

                      {/* 구매 버튼 */}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleBuyTokens(pkg)}
                        disabled={paymentLoading}
                        sx={{
                          borderRadius: 3,
                          py: 1.5,
                          fontWeight: 700,
                          background: pkg.popular
                            ? 'linear-gradient(135deg, #ff5f9b 0%, #ff8fab 100%)'
                            : 'transparent',
                          color: pkg.popular ? '#fff' : '#ff5f9b',
                          border: pkg.popular ? 'none' : '2px solid #ff5f9b',
                          boxShadow: pkg.popular ? '0 4px 15px rgba(255, 95, 155, 0.35)' : 'none',
                          '&:hover': {
                            background: pkg.popular
                              ? 'linear-gradient(135deg, #ff4d8d 0%, #ff7fa0 100%)'
                              : 'rgba(255, 95, 155, 0.08)',
                          },
                        }}
                      >
                        {paymentLoading && selectedPackage?.id === pkg.id ? (
                          <CircularProgress size={24} sx={{ color: pkg.popular ? '#fff' : '#ff5f9b' }} />
                        ) : (
                          '구매하기'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 구독 서비스 섹션 */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <AutorenewIcon sx={{ color: '#ff5f9b' }} />
            <Typography variant="h6" fontWeight={700}>
              월간 구독 플랜
            </Typography>
            <Chip
              label="매월 자동 충전"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 95, 155, 0.1)',
                color: '#c3006e',
                fontWeight: 600,
              }}
            />
          </Stack>

          <Grid container spacing={3}>
            {subscriptionPlans.map((plan, index) => {
              const isSelected = selectedPlan === plan.id;
              const isStandard = plan.id === 'standard';

              return (
                <Grid item xs={12} sm={4} key={plan.id}>
                  <Grow in timeout={400 + index * 100}>
                    <Card
                      onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                      sx={{
                        borderRadius: 5,
                        border: isSelected
                          ? '3px solid #ff5f9b'
                          : isStandard
                            ? '2px solid rgba(255, 95, 155, 0.3)'
                            : '1px solid rgba(255, 95, 155, 0.1)',
                        boxShadow: isSelected
                          ? '0 15px 50px rgba(255, 95, 155, 0.25)'
                          : '0 4px 20px rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'visible',
                        transition: 'all 0.3s ease',
                        transform: isStandard ? 'scale(1.02)' : 'scale(1)',
                        '&:hover': {
                          transform: 'scale(1.03) translateY(-5px)',
                          boxShadow: '0 15px 40px rgba(255, 95, 155, 0.2)',
                        },
                      }}
                    >
                      {/* 추천 배지 */}
                      {isStandard && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -12,
                            right: 16,
                            bgcolor: '#10b981',
                            color: '#fff',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                          }}
                        >
                          추천
                        </Box>
                      )}

                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        {/* 플랜 이름 */}
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {plan.name}
                        </Typography>

                        {/* 가격 */}
                        <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={0.5} mb={1}>
                          <Typography variant="h4" fontWeight={800} color="#ff5f9b">
                            ₩{plan.price.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            /월
                          </Typography>
                        </Stack>

                        {/* 토큰 수 */}
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 95, 155, 0.08)',
                            borderRadius: 3,
                            py: 1.5,
                            px: 2,
                            mb: 2,
                          }}
                        >
                          <Typography variant="h5" fontWeight={700} color="#c3006e">
                            {plan.tokens.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            토큰/월
                          </Typography>
                        </Box>

                        {/* 설명 */}
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {plan.description}
                        </Typography>

                        {/* 혜택 리스트 */}
                        <Stack spacing={1} mb={2}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                            <Typography variant="caption">자동 월간 충전</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                            <Typography variant="caption">언제든 취소 가능</Typography>
                          </Stack>
                          {plan.id !== 'basic' && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                              <Typography variant="caption">우선 고객 지원</Typography>
                            </Stack>
                          )}
                        </Stack>

                        {/* 선택 표시 */}
                        {isSelected && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ color: '#fff !important', fontSize: 16 }} />}
                            label="선택됨"
                            sx={{
                              bgcolor: '#ff5f9b',
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              );
            })}
          </Grid>

          {/* 구독 시작 버튼 */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleOpenDialog}
              sx={{
                borderRadius: 4,
                px: 6,
                py: 2,
                fontWeight: 700,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #ff5f9b 0%, #ff8fab 100%)',
                boxShadow: '0 8px 25px rgba(255, 95, 155, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff4d8d 0%, #ff7fa0 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 30px rgba(255, 95, 155, 0.4)',
                },
              }}
            >
              {subscriptionPlans.find((p) => p.id === selectedPlan)?.name} 플랜으로 구독 시작하기
            </Button>
          </Box>
        </Box>

        {/* 보안 및 신뢰 배지 */}
        <Box
          sx={{
            bgcolor: 'rgba(255, 95, 155, 0.03)',
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
            border: '1px solid rgba(255, 95, 155, 0.1)',
          }}
        >
          <Typography variant="body2" color="text.secondary" mb={2}>
            안전하고 신뢰할 수 있는 결제
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockIcon sx={{ color: '#10b981', fontSize: 20 }} />
              <Typography variant="body2" fontWeight={600}>SSL 보안 결제</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <VerifiedUserIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
              <Typography variant="body2" fontWeight={600}>토스페이먼츠 인증</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CreditCardIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
              <Typography variant="body2" fontWeight={600}>카드 정보 암호화</Typography>
            </Stack>
          </Stack>
        </Box>

        {/* 구독 확인 다이얼로그 */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: { borderRadius: 4, maxWidth: 400 },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', pt: 4 }}>
            구독을 시작하시겠습니까?
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 95, 155, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <CreditCardIcon sx={{ fontSize: 32, color: '#ff5f9b' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {subscriptionPlans.find((p) => p.id === selectedPlan)?.name} 플랜
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#ff5f9b" gutterBottom>
                월 ₩{subscriptionPlans.find((p) => p.id === selectedPlan)?.price.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                매월 {subscriptionPlans.find((p) => p.id === selectedPlan)?.tokens.toLocaleString()}개의 토큰이 자동으로 충전됩니다.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{ flex: 1, borderRadius: 3, py: 1.5 }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSubscription}
              sx={{
                flex: 1,
                borderRadius: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, #ff5f9b 0%, #ff8fab 100%)',
                fontWeight: 700,
              }}
            >
              결제 정보 등록
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
