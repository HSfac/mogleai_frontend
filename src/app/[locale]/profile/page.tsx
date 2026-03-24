'use client';

import { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import TokenIcon from '@mui/icons-material/Token';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { characterService } from '@/services/character.service';
import { chatService } from '@/services/chatService';
import { paymentService } from '@/services/paymentService';
import { authService } from '@/services/authService';
import { localizePath } from '@/lib/localePath';

const tabLabels = ['내가 만든 캐릭터', '즐겨찾기', '최근 대화', '결제 내역'];

const panelSx = {
  borderRadius: 4,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'linear-gradient(180deg, rgba(21, 23, 35, 0.92), rgba(14, 16, 27, 0.88))',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 24px 60px rgba(8, 10, 18, 0.28)',
} as const;

const formatDateLabel = (value?: string) =>
  value
    ? new Date(value).toLocaleString('ko-KR', {
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
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: '' });
  const [saving, setSaving] = useState(false);

  // 성인인증 관련 상태
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [userRes, createdRes, favoriteRes, chatRes, paymentRes] = await Promise.all([
          userService.getMe(),
          characterService.getMyCharacters(),
          userService.getFavorites(),
          chatService.getChats(),
          paymentService.getPaymentHistory(),
        ]);

        setUserData(userRes);
        setCreatedCharacters(createdRes || []);
        setFavoriteCharacters(favoriteRes || []);
        setRecentChats((chatRes || []).slice(0, 5));
        setPaymentHistory(paymentRes || []);
      } catch (error: any) {
        console.error('프로필 데이터를 불러오는데 실패했습니다:', error);
        setToast({ message: '프로필 정보를 불러오는데 실패했습니다.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  const stats = useMemo(() => ({
    tokens: userData?.tokens ?? 0,
    conversations: userData?.totalConversations ?? 0,
    favorites: favoriteCharacters.length,
    created: createdCharacters.length,
  }), [userData, favoriteCharacters.length, createdCharacters.length]);

  const navigateTo = (path: string) => {
    router.push(localizePath(params?.locale, path));
  };

  const statCards = [
    { label: '보유 토큰', value: stats.tokens.toLocaleString(), helper: '대화 연료' },
    { label: '최근 대화', value: stats.conversations.toLocaleString(), helper: '누적 상호작용' },
    { label: '즐겨찾기', value: stats.favorites.toLocaleString(), helper: '찜한 캐릭터' },
    { label: '내 캐릭터', value: stats.created.toLocaleString(), helper: '직접 만든 세계관' },
  ];

  const quickActions = [
    {
      label: '토큰 충전',
      description: '잔액을 확인하고 바로 충전',
      icon: <TokenIcon sx={{ color: '#ffb347' }} />,
      onClick: () => navigateTo('/tokens'),
    },
    {
      label: '알림 정리',
      description: `${Math.max(0, favoriteCharacters.length)}개 즐겨찾기와 최신 소식 확인`,
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
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '24px',
            bgcolor: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <AutoAwesomeIcon sx={{ color: '#ff8fab', fontSize: 34 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)', mb: 3 }}>
          {description}
        </Typography>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigateTo(path)}
          sx={{
            borderRadius: '12px',
            px: 3,
            background: 'linear-gradient(135deg, #ff5f9b, #ff8fab)',
            fontWeight: 700,
          }}
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );

  const handleOpenEditDialog = () => {
    setEditForm({ username: authUser?.username || '' });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditForm({ username: '' });
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
      handleCloseEditDialog();
      // 프로필 데이터 새로고침 (로컬 + 전역 상태)
      const userRes = await userService.getMe();
      setUserData(userRes);
      await refreshUser();
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      setToast({ message: '프로필 업데이트에 실패했습니다.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // KCP 인증 결과 메시지 수신 핸들러
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'KCP_CERT_RESULT') {
        if (event.data.success && event.data.data) {
          try {
            // 인증 결과를 서버에 저장
            await authService.completeAdultVerification({
              ci: event.data.data.ci,
              name: event.data.data.name,
              birthDate: event.data.data.birthDate,
            });

            setToast({ message: '성인인증이 완료되었습니다.', severity: 'success' });
            // 사용자 정보 새로고침
            await refreshUser();
            const userRes = await userService.getMe();
            setUserData(userRes);
          } catch (error: any) {
            console.error('인증 정보 저장 실패:', error);
            setToast({ message: error.response?.data?.message || '인증 정보 저장에 실패했습니다.', severity: 'error' });
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshUser]);

  // KCP 성인인증 시작
  const handleVerifyAdult = async () => {
    setVerifying(true);
    try {
      // 1. 인증 상태 확인
      const statusResult = await authService.getAdultVerificationStatus();

      if (!statusResult.kcpConfigured) {
        setToast({ message: 'KCP 본인인증이 설정되지 않았습니다. 관리자에게 문의하세요.', severity: 'error' });
        setVerifying(false);
        return;
      }

      // 2. KCP 인증 팝업 열기
      const popupWidth = 500;
      const popupHeight = 600;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;

      const popupUrl = authService.getKcpPopupUrl();
      const popup = window.open(
        popupUrl,
        'kcpCertification',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (popup) {
        setToast({ message: '본인인증 창이 열렸습니다. 인증을 완료해주세요.', severity: 'info' });
      } else {
        setToast({ message: '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.', severity: 'error' });
      }

      setVerifyDialogOpen(false);
    } catch (error: any) {
      console.error('성인인증 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '인증에 실패했습니다.';
      setToast({ message: errorMessage, severity: 'error' });
    } finally {
      setVerifying(false);
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
            <Card
              sx={{
                ...panelSx,
                mb: 3,
                overflow: 'hidden',
                background:
                  'radial-gradient(circle at top right, rgba(255, 95, 155, 0.24), transparent 32%), linear-gradient(160deg, rgba(34, 24, 44, 0.96), rgba(15, 16, 28, 0.96))',
              }}
            >
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
                        <Chip
                          label={`${stats.created}개 캐릭터 관리중`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 95, 155, 0.14)',
                            color: '#ff8fab',
                            fontWeight: 700,
                          }}
                        />
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Avatar
                          src={authUser?.profileImage}
                          sx={{
                            width: 92,
                            height: 92,
                            bgcolor: '#fff',
                            color: '#ff5f9b',
                            fontWeight: 800,
                            fontSize: '1.8rem',
                            border: '3px solid rgba(255,255,255,0.16)',
                            boxShadow: '0 18px 40px rgba(255, 95, 155, 0.2)',
                          }}
                        >
                          {authUser?.username?.slice(0, 1) ?? 'U'}
                        </Avatar>

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
                                  sx={{
                                    bgcolor: 'rgba(255,255,255,0.12)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    '& .MuiChip-icon': { color: '#fff' },
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Stack>

                          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.68)', mt: 0.6 }}>
                            {authUser?.email}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)', mt: 1.5, maxWidth: 520, lineHeight: 1.7 }}>
                            대화 기록, 즐겨찾기, 결제 내역까지 한 화면에서 관리할 수 있도록 구성했습니다.
                            자주 쓰는 작업은 오른쪽 퀵 액션으로 바로 이동할 수 있습니다.
                          </Typography>
                        </Box>
                      </Stack>

                      <Grid container spacing={1.5}>
                        {statCards.map((item) => (
                          <Grid item xs={6} md={3} key={item.label}>
                            <Box
                              sx={{
                                height: '100%',
                                borderRadius: 3,
                                px: 2,
                                py: 1.8,
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }}
                            >
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.54)' }}>
                                {item.label}
                              </Typography>
                              <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', mt: 0.4 }}>
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
                        onClick={handleOpenEditDialog}
                        sx={{
                          borderRadius: '12px',
                          py: 1.3,
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
                            p: 2,
                            borderRadius: 3,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, border-color 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              borderColor: 'rgba(255, 143, 171, 0.4)',
                            },
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {action.icon}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>
                                {action.label}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)' }}>
                                {action.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {!authUser?.isAdultVerified && (
              <Card
                sx={{
                  ...panelSx,
                  mb: 3,
                  border: '1px solid rgba(255, 95, 155, 0.24)',
                  background:
                    'linear-gradient(135deg, rgba(255,95,155,0.14) 0%, rgba(255,143,179,0.08) 100%)',
                }}
              >
                <CardContent sx={{ py: 2.5 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '18px',
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
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
                      size="medium"
                      onClick={() => setVerifyDialogOpen(true)}
                      sx={{
                        borderRadius: '12px',
                        px: 3,
                        py: 1.1,
                        bgcolor: '#fff',
                        color: '#ff5f9b',
                        fontWeight: 800,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.92)',
                        },
                      }}
                    >
                      인증하기
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card sx={{ ...panelSx, mb: 3 }}>
              <CardContent sx={{ p: 1 }}>
                <Tabs
                  value={tabValue}
                  onChange={(_, value) => setTabValue(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 0,
                    '& .MuiTabs-indicator': { display: 'none' },
                    '& .MuiTab-root': {
                      minHeight: 44,
                      borderRadius: '12px',
                      color: 'rgba(255,255,255,0.54)',
                      fontWeight: 700,
                      mr: 1,
                    },
                    '& .Mui-selected': {
                      background: 'linear-gradient(135deg, rgba(255,95,155,0.92), rgba(255,143,171,0.92))',
                      color: '#fff !important',
                    },
                  }}
                >
                  {tabLabels.map((label) => (
                    <Tab key={label} label={label} />
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {tabValue === 0 && (
              <>
                {createdCharacters.length === 0 ? (
                  renderEmptyState(
                    '아직 만든 캐릭터가 없습니다',
                    '첫 캐릭터를 만들면 프로필에서 조회수와 태그, 운영 상태를 한눈에 볼 수 있습니다.',
                    '캐릭터 만들기',
                    '/characters/create'
                  )
                ) : (
                  <Grid container spacing={2}>
                    {createdCharacters.map((character) => (
                      <Grid item xs={12} sm={6} md={4} key={character._id}>
                        <Card
                          onClick={() => navigateTo(`/characters/${character._id}`)}
                          sx={{
                            ...panelSx,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, border-color 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              borderColor: 'rgba(255, 143, 171, 0.4)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" justifyContent="space-between" spacing={1} mb={1.5}>
                              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>
                                {character.name}
                              </Typography>
                              <Chip
                                label={character.visibility === 'private' ? '비공개' : '운영중'}
                                size="small"
                                sx={{
                                  borderRadius: '12px',
                                  bgcolor: 'rgba(255,255,255,0.06)',
                                  color: 'rgba(255,255,255,0.7)',
                                }}
                              />
                            </Stack>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255,255,255,0.64)',
                                mb: 2,
                                lineHeight: 1.7,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {character.description || '설명 정보가 없습니다.'}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {(character.tags?.slice(0, 3) || []).map((tag: string) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    borderRadius: '12px',
                                    bgcolor: alpha('#ff8fab', 0.12),
                                    color: '#ff8fab',
                                    fontWeight: 700,
                                  }}
                                />
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}

            {tabValue === 1 && (
              <>
                {favoriteCharacters.length === 0 ? (
                  renderEmptyState(
                    '즐겨찾기한 캐릭터가 없습니다',
                    '관심 있는 캐릭터를 저장해두면 새로운 이벤트나 업데이트를 빠르게 추적할 수 있습니다.',
                    '캐릭터 둘러보기',
                    '/characters'
                  )
                ) : (
                  <Stack spacing={2}>
                    {favoriteCharacters.map((character) => (
                      <Card key={character._id} sx={panelSx}>
                        <CardContent sx={{ p: 2.25 }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Avatar sx={{ bgcolor: '#ffe4f5', color: '#c3006e', width: 52, height: 52 }}>
                                {character.name?.slice(0, 1)}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>
                                  {character.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'rgba(255,255,255,0.64)',
                                    lineHeight: 1.7,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {character.description || '설명이 없습니다.'}
                                </Typography>
                              </Box>
                            </Stack>
                            <Chip
                              icon={<FavoriteIcon sx={{ color: '#ff8fab !important' }} />}
                              label="즐겨찾기"
                              sx={{
                                borderRadius: '12px',
                                bgcolor: alpha('#ff8fab', 0.12),
                                color: '#ff8fab',
                                fontWeight: 700,
                              }}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </>
            )}

            {tabValue === 2 && (
              <>
                {recentChats.length === 0 ? (
                  renderEmptyState(
                    '최근 대화가 없습니다',
                    '캐릭터와의 대화를 시작하면 마지막 활동 시간과 상대 정보를 여기서 빠르게 이어볼 수 있습니다.',
                    '대화 시작하기',
                    '/characters'
                  )
                ) : (
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
                                  마지막 대화 {formatDateLabel(chat.lastActivity)}
                                </Typography>
                              </Box>
                            </Stack>
                            <Button
                              variant="outlined"
                              startIcon={<ChatBubbleOutlineIcon />}
                              onClick={() => navigateTo(`/chat/${chat._id}`)}
                              sx={{
                                borderRadius: '12px',
                                borderColor: 'rgba(255,255,255,0.12)',
                                color: '#fff',
                                fontWeight: 700,
                              }}
                            >
                              이어보기
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </>
            )}

            {tabValue === 3 && (
              <>
                {paymentHistory.length === 0 ? (
                  renderEmptyState(
                    '결제 기록이 없습니다',
                    '토큰 구매와 구독 내역이 쌓이면 이곳에서 결제 상태와 일자를 빠르게 확인할 수 있습니다.',
                    '토큰 보러가기',
                    '/tokens'
                  )
                ) : (
                  <Grid container spacing={2}>
                    {paymentHistory.map((payment) => (
                      <Grid item xs={12} md={6} key={payment._id}>
                        <Card sx={panelSx}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" justifyContent="space-between" spacing={1} mb={1.5}>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>
                                  {payment.paymentId}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.46)' }}>
                                  {formatDateLabel(payment.createdAt)}
                                </Typography>
                              </Box>
                              <Chip
                                label={payment.status}
                                size="small"
                                sx={{
                                  borderRadius: '12px',
                                  bgcolor: payment.status === 'completed' ? 'rgba(125, 220, 134, 0.16)' : 'rgba(255,255,255,0.06)',
                                  color: payment.status === 'completed' ? '#99efab' : 'rgba(255,255,255,0.68)',
                                  fontWeight: 700,
                                }}
                              />
                            </Stack>
                            <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
                              {payment.tokens?.toLocaleString() || 0} 토큰
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)', mt: 0.5 }}>
                              결제 금액 {payment.amount?.toLocaleString() || 0}원
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </>
        )}

        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            }
          }}
        >
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
            <Button
              onClick={handleCloseEditDialog}
              sx={{ color: 'text.secondary' }}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveProfile}
              variant="contained"
              disabled={saving}
              sx={{
                bgcolor: '#ff5f9b',
                '&:hover': { bgcolor: '#e54d87' },
                borderRadius: 2,
                px: 3,
              }}
            >
              {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '저장'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 성인인증 다이얼로그 */}
        <Dialog
          open={verifyDialogOpen}
          onClose={() => !verifying && setVerifyDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, textAlign: 'center', pb: 1 }}>
            <ShieldIcon sx={{ fontSize: 40, color: '#ff5f9b', mb: 1, display: 'block', mx: 'auto' }} />
            19세 이상 인증
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
              성인 콘텐츠 이용을 위해 휴대폰 본인인증이 필요합니다.
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(255, 95, 155, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(255, 95, 155, 0.2)',
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                인증 절차 안내
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                1. 아래 인증하기 버튼을 클릭합니다.<br />
                2. 본인인증 팝업이 열립니다.<br />
                3. 휴대폰 번호를 입력하고 본인인증을 진행합니다.<br />
                4. 인증이 완료되면 자동으로 반영됩니다.
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              본인인증 정보는 연령 확인 목적으로만 사용됩니다.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
            <Button
              onClick={() => setVerifyDialogOpen(false)}
              disabled={verifying}
              sx={{ color: 'text.secondary', mr: 1 }}
            >
              취소
            </Button>
            <Button
              onClick={handleVerifyAdult}
              variant="contained"
              disabled={verifying}
              sx={{
                bgcolor: '#ff5f9b',
                '&:hover': { bgcolor: '#e54d87' },
                borderRadius: 2,
                px: 4,
                minWidth: 120,
              }}
            >
              {verifying ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '본인인증하기'}
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
      </Container>
    </PageLayout>
  );
}
