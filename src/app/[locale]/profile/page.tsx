'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  LinearProgress,
  Divider,
  IconButton,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import TokenIcon from '@mui/icons-material/Token';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ReceiptIcon from '@mui/icons-material/Receipt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BoltIcon from '@mui/icons-material/Bolt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import Switch from '@mui/material/Switch';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { characterService } from '@/services/character.service';
import { chatService } from '@/services/chatService';
import { paymentService } from '@/services/paymentService';
import { authService } from '@/services/authService';
import { localizePath } from '@/lib/localePath';

const TAB_LABELS = ['내가 만든 캐릭터', '즐겨찾기', '최근 대화', '결제 내역', '구독 관리', '계정 설정'];

const panelSx = {
  borderRadius: 4,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'linear-gradient(180deg, rgba(21, 23, 35, 0.92), rgba(14, 16, 27, 0.88))',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 24px 60px rgba(8, 10, 18, 0.28)',
} as const;

const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed: { label: '결제 완료', color: '#7ddc86' },
  pending:   { label: '처리 중',   color: '#ffb347' },
  failed:    { label: '실패',      color: '#ff6b6b' },
  refunded:  { label: '환불 완료', color: '#7cc7ff' },
  cancelled: { label: '취소됨',   color: 'rgba(255,255,255,0.4)' },
};

const PAYMENT_TYPE_MAP: Record<string, string> = {
  token_purchase: '토큰 충전',
  subscription:   '월간 구독',
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '정보 없음';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const { user: authUser, isAuthenticated, refreshUser } = useAuth();

  const [userData, setUserData] = useState<any>(null);
  const [createdCharacters, setCreatedCharacters] = useState<any[]>([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);

  // 프로필 편집
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: '' });
  const [saving, setSaving] = useState(false);

  // 성인인증
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 구독 해지
  const [cancelSubDialogOpen, setCancelSubDialogOpen] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  // 쿠폰
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // 자동충전
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [savingAutoRecharge, setSavingAutoRecharge] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, createdRes, favoriteRes, chatRes, paymentRes, subRes] = await Promise.all([
        userService.getMe(),
        characterService.getMyCharacters(),
        userService.getFavorites(),
        chatService.getChats(),
        paymentService.getPaymentHistory(),
        paymentService.getSubscriptionStatus().catch(() => null),
      ]);

      setUserData(userRes);
      setCreatedCharacters(createdRes || []);
      setFavoriteCharacters(favoriteRes || []);
      setRecentChats((chatRes || []).slice(0, 10));
      setPaymentHistory(paymentRes || []);
      setSubscriptionStatus(subRes);
      setAutoRecharge(userRes?.autoRechargeEnabled ?? false);
    } catch {
      setToast({ message: '프로필 정보를 불러오는데 실패했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProfile();
  }, [isAuthenticated, fetchProfile]);

  const stats = useMemo(() => ({
    tokens: userData?.tokens ?? 0,
    conversations: userData?.totalConversations ?? 0,
    favorites: favoriteCharacters.length,
    created: createdCharacters.length,
  }), [userData, favoriteCharacters.length, createdCharacters.length]);

  const navigateTo = (path: string) => router.push(localizePath(params?.locale, path));

  const statCards = [
    { label: '보유 토큰', value: stats.tokens.toLocaleString(), helper: '대화 연료', color: '#ffb347' },
    { label: '누적 대화', value: stats.conversations.toLocaleString(), helper: '상호작용 횟수', color: '#7cc7ff' },
    { label: '즐겨찾기', value: stats.favorites.toLocaleString(), helper: '찜한 캐릭터', color: '#ff8fab' },
    { label: '내 캐릭터', value: stats.created.toLocaleString(), helper: '직접 만든 세계관', color: '#7ddc86' },
  ];

  const quickActions = [
    {
      label: '토큰 충전',
      description: '잔액을 확인하고 바로 충전',
      icon: <TokenIcon sx={{ color: '#ffb347' }} />,
      onClick: () => navigateTo('/tokens'),
    },
    {
      label: '알림 확인',
      description: '최신 소식 & 이벤트 알림',
      icon: <NotificationsIcon sx={{ color: '#ff8fab' }} />,
      onClick: () => navigateTo('/notifications'),
    },
    {
      label: '캐릭터 둘러보기',
      description: '새 대화 상대 찾기',
      icon: <AutoAwesomeIcon sx={{ color: '#7ddc86' }} />,
      onClick: () => navigateTo('/characters'),
    },
  ];

  const renderEmptyState = (title: string, description: string, actionLabel: string, path: string) => (
    <Card sx={{ ...panelSx, textAlign: 'center' }}>
      <CardContent sx={{ py: 7 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
          <AutoAwesomeIcon sx={{ color: '#ff8fab', fontSize: 34 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)', mb: 3 }}>{description}</Typography>
        <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigateTo(path)}
          sx={{ borderRadius: '12px', px: 3, background: 'linear-gradient(135deg, #ff5f9b, #ff8fab)', fontWeight: 700 }}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );

  // ── 프로필 편집 ──
  const handleOpenEditDialog = () => {
    setEditForm({ username: authUser?.username || '' });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.username.trim()) {
      setToast({ message: '사용자 이름을 입력해주세요.', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      await userService.updateMe({ username: editForm.username.trim() });
      setToast({ message: '프로필이 업데이트되었습니다.', severity: 'success' });
      setEditDialogOpen(false);
      const userRes = await userService.getMe();
      setUserData(userRes);
      await refreshUser();
    } catch {
      setToast({ message: '프로필 업데이트에 실패했습니다.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── KCP 성인인증 ──
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'KCP_CERT_RESULT') {
        if (event.data.success && event.data.data) {
          try {
            await authService.completeAdultVerification({
              ci: event.data.data.ci,
              name: event.data.data.name,
              birthDate: event.data.data.birthDate,
            });
            setToast({ message: '성인인증이 완료되었습니다.', severity: 'success' });
            await refreshUser();
            const userRes = await userService.getMe();
            setUserData(userRes);
          } catch (error: any) {
            setToast({ message: error.response?.data?.message || '인증 정보 저장에 실패했습니다.', severity: 'error' });
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshUser]);

  const handleVerifyAdult = async () => {
    setVerifying(true);
    try {
      const statusResult = await authService.getAdultVerificationStatus();
      if (!statusResult.kcpConfigured) {
        setToast({ message: 'KCP 본인인증이 설정되지 않았습니다. 관리자에게 문의하세요.', severity: 'error' });
        return;
      }
      const popupWidth = 500, popupHeight = 600;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;
      const popup = window.open(authService.getKcpPopupUrl(), 'kcpCertification',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`);
      if (popup) {
        setToast({ message: '본인인증 창이 열렸습니다. 인증을 완료해주세요.', severity: 'info' });
      } else {
        setToast({ message: '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.', severity: 'error' });
      }
      setVerifyDialogOpen(false);
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || '인증에 실패했습니다.', severity: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  // ── 구독 해지 ──
  const handleCancelSubscription = async () => {
    setCancellingSubscription(true);
    try {
      await paymentService.cancelSubscription();
      setToast({ message: '구독이 해지되었습니다.', severity: 'success' });
      setCancelSubDialogOpen(false);
      const subRes = await paymentService.getSubscriptionStatus().catch(() => null);
      setSubscriptionStatus(subRes);
      await refreshUser();
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || '구독 해지에 실패했습니다.', severity: 'error' });
    } finally {
      setCancellingSubscription(false);
    }
  };

  // ── 자동충전 토글 ──
  const handleToggleAutoRecharge = async (enabled: boolean) => {
    setSavingAutoRecharge(true);
    try {
      await userService.updateAutoRecharge({ enabled });
      setAutoRecharge(enabled);
      setToast({ message: enabled ? '자동 충전이 활성화되었습니다.' : '자동 충전이 비활성화되었습니다.', severity: 'success' });
    } catch {
      setToast({ message: '자동 충전 설정 변경에 실패했습니다.', severity: 'error' });
    } finally {
      setSavingAutoRecharge(false);
    }
  };

  // ── 쿠폰 적용 ──
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setToast({ message: '쿠폰 코드를 입력해주세요.', severity: 'error' });
      return;
    }
    setApplyingCoupon(true);
    try {
      const result = await paymentService.applyCoupon(couponCode.trim());
      setToast({ message: result.message || '쿠폰이 적용되었습니다!', severity: 'success' });
      setCouponCode('');
      const userRes = await userService.getMe();
      setUserData(userRes);
      await refreshUser();
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || '쿠폰 적용에 실패했습니다.', severity: 'error' });
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6">로그인이 필요합니다.</Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: '#ff5f9b' }} />
          </Box>
        ) : (
          <>
            {/* ── 프로필 헤더 ── */}
            <Card sx={{
              ...panelSx,
              mb: 3,
              overflow: 'hidden',
              background: 'radial-gradient(circle at top right, rgba(255, 95, 155, 0.24), transparent 32%), linear-gradient(160deg, rgba(34, 24, 44, 0.96), rgba(15, 16, 28, 0.96))',
            }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={authUser?.isAdultVerified ? '성인 인증 완료' : '기본 프로필'}
                          size="small"
                          sx={{
                            bgcolor: authUser?.isAdultVerified ? 'rgba(125, 220, 134, 0.16)' : 'rgba(255,255,255,0.08)',
                            color: authUser?.isAdultVerified ? '#99efab' : '#fff',
                            fontWeight: 700,
                          }}
                        />
                        {subscriptionStatus?.isSubscribed && (
                          <Chip
                            icon={<AutorenewIcon sx={{ fontSize: 13, color: '#7cc7ff !important' }} />}
                            label={`구독 중 · ${subscriptionStatus.daysRemaining}일 남음`}
                            size="small"
                            sx={{ bgcolor: 'rgba(124,199,255,0.14)', color: '#7cc7ff', fontWeight: 700 }}
                          />
                        )}
                        <Chip
                          label={`캐릭터 ${stats.created}개 운영 중`}
                          size="small"
                          sx={{ bgcolor: 'rgba(255, 95, 155, 0.14)', color: '#ff8fab', fontWeight: 700 }}
                        />
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Box sx={{ position: 'relative', flexShrink: 0 }}>
                          <Avatar
                            src={authUser?.profileImage}
                            sx={{
                              width: 92, height: 92,
                              bgcolor: '#fff', color: '#ff5f9b',
                              fontWeight: 800, fontSize: '1.8rem',
                              border: '3px solid rgba(255,255,255,0.16)',
                              boxShadow: '0 18px 40px rgba(255, 95, 155, 0.2)',
                            }}
                          >
                            {authUser?.username?.slice(0, 1) ?? 'U'}
                          </Avatar>
                          <Tooltip title="프로필 사진 변경 (준비 중)" arrow>
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute', bottom: -4, right: -4,
                                bgcolor: 'rgba(30,32,48,0.92)', border: '2px solid rgba(255,255,255,0.12)',
                                width: 28, height: 28,
                                '&:hover': { bgcolor: 'rgba(255,95,155,0.2)' },
                              }}
                            >
                              <PhotoCameraIcon sx={{ fontSize: 14, color: '#fff' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap" useFlexGap>
                            <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
                              {authUser?.username || '사용자'}
                            </Typography>
                            {authUser?.isAdultVerified && (
                              <Tooltip title="19세 이상 인증 완료" arrow>
                                <Chip
                                  icon={<VerifiedUserIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
                                  label="19+"
                                  size="small"
                                  sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700 }}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.68)', mt: 0.6 }}>
                            {authUser?.email}
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={1.5}>
                        {statCards.map((item) => (
                          <Grid item xs={6} md={3} key={item.label}>
                            <Box sx={{
                              height: '100%', borderRadius: 3, px: 2, py: 1.8,
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.54)' }}>
                                {item.label}
                              </Typography>
                              <Typography variant="h5" fontWeight={800} sx={{ color: item.color, mt: 0.4 }}>
                                {item.value}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)' }}>
                                {item.helper}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Stack spacing={1.5} sx={{ height: '100%' }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleOpenEditDialog}
                        sx={{
                          borderRadius: '12px', py: 1.3,
                          background: 'linear-gradient(135deg, #ff5f9b, #ff8fab)',
                          fontWeight: 700,
                        }}
                      >
                        프로필 편집
                      </Button>

                      {quickActions.map((action) => (
                        <Box
                          key={action.label}
                          onClick={action.onClick}
                          sx={{
                            p: 2, borderRadius: 3,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, border-color 0.2s ease',
                            '&:hover': { transform: 'translateY(-2px)', borderColor: 'rgba(255, 143, 171, 0.4)' },
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 42, height: 42, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {action.icon}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>{action.label}</Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)' }}>{action.description}</Typography>
                            </Box>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ── 성인인증 배너 ── */}
            {!authUser?.isAdultVerified && (
              <Card sx={{
                ...panelSx, mb: 3,
                border: '1px solid rgba(255, 95, 155, 0.24)',
                background: 'linear-gradient(135deg, rgba(255,95,155,0.14) 0%, rgba(255,143,179,0.08) 100%)',
              }}>
                <CardContent sx={{ py: 2.5 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
                    <Box sx={{ width: 52, height: 52, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShieldIcon sx={{ color: '#fff', fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>
                        19세 이상 인증하고 더 넓은 캐릭터 풀을 열어보세요
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
                        인증을 마치면 19+ 캐릭터 생성과 성인 대화 모드를 사용할 수 있습니다.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => setVerifyDialogOpen(true)}
                      sx={{ borderRadius: '12px', px: 3, py: 1.1, bgcolor: '#fff', color: '#ff5f9b', fontWeight: 800, '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' } }}
                    >
                      인증하기
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* ── 탭 ── */}
            <Card sx={{ ...panelSx, mb: 3 }}>
              <CardContent sx={{ p: 1 }}>
                <Tabs
                  value={tabValue}
                  onChange={(_, v) => setTabValue(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 0,
                    '& .MuiTabs-indicator': { display: 'none' },
                    '& .MuiTab-root': { minHeight: 44, borderRadius: '12px', color: 'rgba(255,255,255,0.54)', fontWeight: 700, mr: 1, fontSize: '0.82rem' },
                    '& .Mui-selected': { background: 'linear-gradient(135deg, rgba(255,95,155,0.92), rgba(255,143,171,0.92))', color: '#fff !important' },
                  }}
                >
                  {TAB_LABELS.map((label) => <Tab key={label} label={label} />)}
                </Tabs>
              </CardContent>
            </Card>

            {/* ── 탭 0: 내가 만든 캐릭터 ── */}
            {tabValue === 0 && (
              createdCharacters.length === 0
                ? renderEmptyState('아직 만든 캐릭터가 없습니다', '첫 캐릭터를 만들면 조회수와 태그를 한눈에 볼 수 있습니다.', '캐릭터 만들기', '/characters/create')
                : (
                  <Grid container spacing={2}>
                    {createdCharacters.map((character) => (
                      <Grid item xs={12} sm={6} md={4} key={character._id}>
                        <Card onClick={() => navigateTo(`/characters/${character._id}`)} sx={{ ...panelSx, cursor: 'pointer', transition: 'transform 0.2s ease, border-color 0.2s ease', '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(255, 143, 171, 0.4)' } }}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" justifyContent="space-between" spacing={1} mb={1.5}>
                              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>{character.name}</Typography>
                              <Chip label={character.visibility === 'private' ? '비공개' : '운영중'} size="small" sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }} />
                            </Stack>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)', mb: 2, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {character.description || '설명 정보가 없습니다.'}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {(character.tags?.slice(0, 3) || []).map((tag: string) => (
                                <Chip key={tag} label={tag} size="small" sx={{ borderRadius: '12px', bgcolor: alpha('#ff8fab', 0.12), color: '#ff8fab', fontWeight: 700 }} />
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )
            )}

            {/* ── 탭 1: 즐겨찾기 ── */}
            {tabValue === 1 && (
              favoriteCharacters.length === 0
                ? renderEmptyState('즐겨찾기한 캐릭터가 없습니다', '관심 있는 캐릭터를 저장해두면 빠르게 추적할 수 있습니다.', '캐릭터 둘러보기', '/characters')
                : (
                  <Stack spacing={2}>
                    {favoriteCharacters.map((character, idx) => (
                      <Card key={character._id ?? idx} sx={panelSx}>
                        <CardContent sx={{ p: 2.25 }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Avatar sx={{ bgcolor: '#ffe4f5', color: '#c3006e', width: 52, height: 52 }}>{character.name?.slice(0, 1)}</Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>{character.name}</Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {character.description || '설명이 없습니다.'}
                                </Typography>
                              </Box>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              <Chip icon={<FavoriteIcon sx={{ color: '#ff8fab !important' }} />} label="즐겨찾기" sx={{ borderRadius: '12px', bgcolor: alpha('#ff8fab', 0.12), color: '#ff8fab', fontWeight: 700 }} />
                              <Button variant="outlined" size="small" onClick={() => navigateTo(`/characters/${character._id}`)} sx={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700 }}>
                                대화하기
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )
            )}

            {/* ── 탭 2: 최근 대화 ── */}
            {tabValue === 2 && (
              recentChats.length === 0
                ? renderEmptyState('최근 대화가 없습니다', '캐릭터와의 대화를 시작하면 마지막 활동 시간을 여기서 빠르게 이어볼 수 있습니다.', '대화 시작하기', '/characters')
                : (
                  <Stack spacing={2}>
                    {recentChats.map((chat) => (
                      <Card key={chat._id} sx={panelSx}>
                        <CardContent sx={{ p: 2.25 }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Avatar sx={{ bgcolor: '#ffe4f5', color: '#c3006e', width: 52, height: 52 }}>
                                {chat.characterInfo?.name?.slice(0, 1) || 'C'}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>
                                  {chat.characterInfo?.name || '알 수 없는 캐릭터'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)' }}>
                                  마지막 대화 {formatDate(chat.lastActivity)}
                                </Typography>
                                {chat.messages?.length > 0 && (
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                    메시지 {chat.messages.length}개
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                            <Button
                              variant="outlined"
                              startIcon={<ChatBubbleOutlineIcon />}
                              onClick={() => navigateTo(`/chat/${chat._id}`)}
                              sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700 }}
                            >
                              이어보기
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )
            )}

            {/* ── 탭 3: 결제 내역 ── */}
            {tabValue === 3 && (
              paymentHistory.length === 0
                ? renderEmptyState('결제 기록이 없습니다', '토큰 구매와 구독 내역이 이곳에 표시됩니다.', '토큰 보러가기', '/tokens')
                : (
                  <Stack spacing={2}>
                    {paymentHistory.map((payment) => {
                      const statusInfo = PAYMENT_STATUS_MAP[payment.status] ?? { label: payment.status, color: 'rgba(255,255,255,0.5)' };
                      const typeLabel = PAYMENT_TYPE_MAP[payment.type] ?? payment.type;
                      return (
                        <Card key={payment._id} sx={panelSx}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                              <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <ReceiptIcon sx={{ color: payment.type === 'subscription' ? '#7cc7ff' : '#ffb347', fontSize: 22 }} />
                              </Box>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={0.4}>
                                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>{typeLabel}</Typography>
                                  <Chip label={statusInfo.label} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha(statusInfo.color, 0.14), color: statusInfo.color, borderRadius: '8px' }} />
                                </Stack>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                  {formatDate(payment.createdAt)}
                                </Typography>
                              </Box>
                              <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.3}>
                                {payment.tokens > 0 && (
                                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#ffb347' }}>
                                    +{payment.tokens.toLocaleString()} 토큰
                                  </Typography>
                                )}
                                <Typography variant="body2" fontWeight={700} sx={{ color: '#ff5f9b' }}>
                                  ₩{payment.amount?.toLocaleString()}
                                </Typography>
                                {payment.receiptUrl && (
                                  <Button
                                    size="small"
                                    endIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
                                    href={payment.receiptUrl}
                                    target="_blank"
                                    sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', p: 0, minWidth: 0, '&:hover': { color: '#fff' } }}
                                  >
                                    영수증
                                  </Button>
                                )}
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                )
            )}

            {/* ── 탭 4: 구독 관리 ── */}
            {tabValue === 4 && (
              <Stack spacing={3}>
                {subscriptionStatus?.isSubscribed ? (
                  <>
                    {/* 구독 상태 카드 */}
                    <Card sx={{ ...panelSx, border: '1px solid rgba(124,199,255,0.24)', background: 'linear-gradient(135deg, rgba(124,199,255,0.10) 0%, rgba(15,16,28,0.96) 100%)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Box sx={{ width: 56, height: 56, borderRadius: '18px', bgcolor: 'rgba(124,199,255,0.14)', border: '1px solid rgba(124,199,255,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AutorenewIcon sx={{ color: '#7cc7ff', fontSize: 28 }} />
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                              <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>구독 활성화</Typography>
                              <Chip label="이용 중" size="small" sx={{ bgcolor: 'rgba(125,220,134,0.16)', color: '#7ddc86', fontWeight: 700 }} />
                            </Stack>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)', mb: 1.5 }}>
                              {subscriptionStatus.subscriptionEndDate
                                ? `${formatDate(subscriptionStatus.subscriptionEndDate)}까지 유효`
                                : '구독 중'}
                            </Typography>
                            {subscriptionStatus.daysRemaining !== undefined && (
                              <Box>
                                <Stack direction="row" justifyContent="space-between" mb={0.8}>
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.46)' }}>남은 기간</Typography>
                                  <Typography variant="caption" fontWeight={700} sx={{ color: '#7cc7ff' }}>
                                    {subscriptionStatus.daysRemaining}일 남음
                                  </Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, ((30 - subscriptionStatus.daysRemaining) / 30) * 100)}
                                  sx={{
                                    height: 6, borderRadius: 3,
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    '& .MuiLinearProgress-bar': { bgcolor: '#7cc7ff', borderRadius: 3 },
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={() => setCancelSubDialogOpen(true)}
                            sx={{ borderRadius: '12px', borderColor: 'rgba(255,107,107,0.4)', color: '#ff6b6b', fontWeight: 700, flexShrink: 0, '&:hover': { borderColor: '#ff6b6b', bgcolor: 'rgba(255,107,107,0.08)' } }}
                          >
                            구독 해지
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* 플랜 업그레이드 안내 */}
                    <Card sx={panelSx}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff', mb: 0.5 }}>플랜 변경</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.56)', mb: 2 }}>
                          더 많은 토큰이 필요하신가요? 플랜을 업그레이드하세요.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => navigateTo('/tokens')}
                          sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #7cc7ff, #5ab0f5)', fontWeight: 700 }}
                        >
                          플랜 보러가기
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card sx={{ ...panelSx, textAlign: 'center' }}>
                    <CardContent sx={{ py: 7 }}>
                      <Box sx={{ width: 72, height: 72, borderRadius: '24px', bgcolor: 'rgba(124,199,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                        <AutorenewIcon sx={{ color: '#7cc7ff', fontSize: 34 }} />
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>구독 중인 플랜이 없습니다</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)', mb: 3 }}>
                        월간 구독으로 매달 토큰을 자동 충전하고 더 저렴하게 이용하세요.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AutorenewIcon />}
                        onClick={() => navigateTo('/tokens')}
                        sx={{ borderRadius: '12px', px: 4, background: 'linear-gradient(135deg, #7cc7ff, #5ab0f5)', fontWeight: 700 }}
                      >
                        구독 플랜 보기
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            )}

            {/* ── 탭 5: 계정 설정 ── */}
            {tabValue === 5 && (
              <Stack spacing={3}>
                {/* 쿠폰 입력 */}
                <Card sx={panelSx}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'rgba(125,220,134,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LocalOfferIcon sx={{ color: '#7ddc86', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>쿠폰 입력</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.54)' }}>쿠폰 코드를 입력하면 토큰 또는 할인이 즉시 적용됩니다.</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.5}>
                      <TextField
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="쿠폰 코드 입력 (대문자)"
                        variant="outlined"
                        size="small"
                        fullWidth
                        onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'rgba(255,255,255,0.04)',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                            '&:hover fieldset': { borderColor: 'rgba(125,220,134,0.4)' },
                            '&.Mui-focused fieldset': { borderColor: '#7ddc86' },
                          },
                          '& input': { color: '#fff', letterSpacing: 1.5, fontWeight: 700 },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        sx={{ borderRadius: '12px', px: 3, bgcolor: '#7ddc86', color: '#0a1a10', fontWeight: 800, flexShrink: 0, '&:hover': { bgcolor: '#5dc46a' }, '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' } }}
                      >
                        {applyingCoupon ? <CircularProgress size={18} sx={{ color: '#0a1a10' }} /> : '적용'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                {/* 계정 정보 */}
                <Card sx={panelSx}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff', mb: 2 }}>계정 정보</Typography>
                    <Stack spacing={2}>
                      {[
                        { label: '이메일', value: authUser?.email || '—' },
                        { label: '사용자 이름', value: authUser?.username || '—' },
                        { label: '가입일', value: formatDate(userData?.createdAt) },
                      ].map((item) => (
                        <Box key={item.label}>
                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.46)' }}>{item.label}</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#fff' }}>{item.value}</Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mt: 2, mb: 2 }} />
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleOpenEditDialog}
                      sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700 }}
                    >
                      사용자 이름 변경
                    </Button>
                  </CardContent>
                </Card>

                {/* 자동 충전 */}
                <Card sx={panelSx}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'rgba(255,179,71,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BoltIcon sx={{ color: '#ffb347', fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>자동 충전</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.54)' }}>
                          토큰이 설정 기준치 이하로 떨어지면 자동으로 충전합니다.
                        </Typography>
                      </Box>
                      <Switch
                        checked={autoRecharge}
                        disabled={savingAutoRecharge}
                        onChange={(e) => handleToggleAutoRecharge(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#ffb347' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#ffb347' },
                        }}
                      />
                    </Stack>
                    {autoRecharge && (
                      <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(255,179,71,0.06)', border: '1px solid rgba(255,179,71,0.18)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.54)' }}>
                          기준치: <strong style={{ color: '#ffb347' }}>{userData?.autoRechargeThreshold ?? 100} 토큰</strong> 이하 시 자동 충전
                        </Typography>
                        <br />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.5, display: 'block' }}>
                          자세한 설정은 토큰 충전 페이지에서 변경하세요.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* 크리에이터 레벨 */}
                {userData?.creatorProgress && (
                  <Card sx={panelSx}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'rgba(243,139,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <WorkspacePremiumIcon sx={{ color: '#f38bff', fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>크리에이터 레벨</Typography>
                          <Typography variant="body2" sx={{ color: '#f38bff' }}>
                            {userData.creatorProgress.currentLabel}
                          </Typography>
                        </Box>
                        <Chip
                          label={`수익 ${userData.creatorProgress.earningRatePercent}%`}
                          size="small"
                          sx={{ bgcolor: 'rgba(243,139,255,0.14)', color: '#f38bff', fontWeight: 700 }}
                        />
                      </Stack>
                      {userData.creatorProgress.nextLabel && (
                        <Box>
                          <Stack direction="row" justifyContent="space-between" mb={0.8}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.46)' }}>
                              다음: {userData.creatorProgress.nextLabel}
                            </Typography>
                            <Typography variant="caption" fontWeight={700} sx={{ color: '#f38bff' }}>
                              {userData.creatorProgress.progressPercent}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={userData.creatorProgress.progressPercent}
                            sx={{
                              height: 6, borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.08)',
                              '& .MuiLinearProgress-bar': { bgcolor: '#f38bff', borderRadius: 3 },
                            }}
                          />
                          {userData.creatorProgress.nextRequirement && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.36)', mt: 0.8, display: 'block' }}>
                              {userData.creatorProgress.nextRequirement}까지 {userData.creatorProgress.remainingConversations?.toLocaleString()}회 남음
                            </Typography>
                          )}
                        </Box>
                      )}
                      <Button
                        size="small"
                        onClick={() => navigateTo('/creator/dashboard')}
                        sx={{ mt: 1.5, color: '#f38bff', fontWeight: 700, p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                      >
                        크리에이터 대시보드 →
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* 성인인증 상태 */}
                <Card sx={panelSx}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: authUser?.isAdultVerified ? 'rgba(125,220,134,0.12)' : 'rgba(255,95,155,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldIcon sx={{ color: authUser?.isAdultVerified ? '#7ddc86' : '#ff5f9b', fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>성인인증</Typography>
                        <Typography variant="body2" sx={{ color: authUser?.isAdultVerified ? '#7ddc86' : 'rgba(255,255,255,0.54)' }}>
                          {authUser?.isAdultVerified ? '19세 이상 인증 완료' : '미인증 상태'}
                        </Typography>
                      </Box>
                      {!authUser?.isAdultVerified && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setVerifyDialogOpen(true)}
                          sx={{ borderRadius: '10px', borderColor: 'rgba(255,95,155,0.4)', color: '#ff8fab', fontWeight: 700 }}
                        >
                          인증하기
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            )}
          </>
        )}

        {/* ── 프로필 편집 다이얼로그 ── */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 600 }}>프로필 편집</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="사용자 이름"
              type="text"
              fullWidth
              variant="outlined"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditDialogOpen(false)} sx={{ color: 'text.secondary' }}>취소</Button>
            <Button
              onClick={handleSaveProfile}
              variant="contained"
              disabled={saving}
              sx={{ bgcolor: '#ff5f9b', '&:hover': { bgcolor: '#e54d87' }, borderRadius: 2, px: 3 }}
            >
              {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '저장'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── 성인인증 다이얼로그 ── */}
        <Dialog open={verifyDialogOpen} onClose={() => !verifying && setVerifyDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 600, textAlign: 'center', pb: 1 }}>
            <ShieldIcon sx={{ fontSize: 40, color: '#ff5f9b', mb: 1, display: 'block', mx: 'auto' }} />
            19세 이상 인증
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
              성인 콘텐츠 이용을 위해 휴대폰 본인인증이 필요합니다.
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,95,155,0.05)', borderRadius: 2, border: '1px solid rgba(255,95,155,0.2)' }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>인증 절차 안내</Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                1. 아래 인증하기 버튼을 클릭합니다.<br />
                2. 본인인증 팝업이 열립니다.<br />
                3. 휴대폰 번호를 입력하고 본인인증을 진행합니다.<br />
                4. 인증이 완료되면 자동으로 반영됩니다.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
            <Button onClick={() => setVerifyDialogOpen(false)} disabled={verifying} sx={{ color: 'text.secondary', mr: 1 }}>취소</Button>
            <Button onClick={handleVerifyAdult} variant="contained" disabled={verifying}
              sx={{ bgcolor: '#ff5f9b', '&:hover': { bgcolor: '#e54d87' }, borderRadius: 2, px: 4, minWidth: 120 }}>
              {verifying ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '본인인증하기'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── 구독 해지 확인 다이얼로그 ── */}
        <Dialog open={cancelSubDialogOpen} onClose={() => !cancellingSubscription && setCancelSubDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>구독 해지 확인</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              구독을 해지하면 현재 구독 기간이 끝나는 날짜 이후에는 자동 결제가 중단됩니다.
              남은 기간 동안은 계속 이용하실 수 있습니다.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCancelSubDialogOpen(false)} disabled={cancellingSubscription} sx={{ color: 'text.secondary' }}>취소</Button>
            <Button
              onClick={handleCancelSubscription}
              variant="contained"
              disabled={cancellingSubscription}
              sx={{ bgcolor: '#ff6b6b', '&:hover': { bgcolor: '#e55a5a' }, borderRadius: 2, px: 3 }}
            >
              {cancellingSubscription ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '해지 확인'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
        </Snackbar>
      </Container>
    </PageLayout>
  );
}
