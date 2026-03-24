'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Chip,
  Card,
  CardContent,
  IconButton,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TokenIcon from '@mui/icons-material/Token';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ShieldIcon from '@mui/icons-material/Shield';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

type NotificationCategory = 'token_purchase' | 'subscription' | 'character' | 'system';
type TypeFilter = 'all' | NotificationCategory;

interface DecoratedNotification extends Notification {
  category: NotificationCategory;
}

const panelSx = {
  borderRadius: 4,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'linear-gradient(180deg, rgba(21, 23, 35, 0.92), rgba(14, 16, 27, 0.88))',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 24px 60px rgba(8, 10, 18, 0.28)',
} as const;

const categoryMeta: Record<
  NotificationCategory,
  {
    label: string;
    accent: string;
    helper: string;
    icon: ReactNode;
  }
> = {
  token_purchase: {
    label: '토큰',
    accent: '#ffb347',
    helper: '충전, 보너스, 잔액 관리',
    icon: <TokenIcon sx={{ color: '#ffb347' }} />,
  },
  subscription: {
    label: '구독',
    accent: '#7ddc86',
    helper: '플랜, 결제, 월간 혜택',
    icon: <StarIcon sx={{ color: '#7ddc86' }} />,
  },
  character: {
    label: '캐릭터',
    accent: '#58a6ff',
    helper: '인기 상승, 창작 성과, 추천',
    icon: <TrendingUpIcon sx={{ color: '#58a6ff' }} />,
  },
  system: {
    label: '시스템',
    accent: '#f38bff',
    helper: '운영 알림, 정책, 중요 안내',
    icon: <ShieldIcon sx={{ color: '#f38bff' }} />,
  },
};

const directTypeCategoryMap: Record<string, NotificationCategory> = {
  token_purchase: 'token_purchase',
  low_tokens: 'token_purchase',
  subscription: 'subscription',
  monthly_bonus: 'subscription',
  character_popular: 'character',
  creator_level_up: 'character',
  creator_update: 'character',
  info: 'system',
  success: 'system',
  warning: 'system',
  error: 'system',
};

const inferNotificationCategory = (notification: Notification): NotificationCategory => {
  const directMatch = directTypeCategoryMap[notification.type];
  if (directMatch) {
    return directMatch;
  }

  const haystack = `${notification.type} ${notification.title} ${notification.message}`.toLowerCase();

  if (/(token|토큰|충전|잔액|bonus|보너스|payment)/.test(haystack)) {
    return 'token_purchase';
  }

  if (/(subscription|구독|billing|정기|멤버십|plan|플랜)/.test(haystack)) {
    return 'subscription';
  }

  if (/(character|캐릭터|creator|크리에이터|랭킹|인기|추천|level|좋아요)/.test(haystack)) {
    return 'character';
  }

  return 'system';
};

const formatRelativeDate = (value: string) =>
  new Date(value).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function NotificationsPage() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal('알림을 확인하려면 로그인이 필요해요', '/notifications');
      setLoading(false);
      return;
    }

    fetchNotifications();
  }, [isAuthenticated, openLoginModal]);

  const fetchNotifications = async (page: number = 1) => {
    setLoading(true);
    try {
      const [data, unread] = await Promise.all([
        notificationService.getNotifications(page, 50),
        notificationService.getUnreadCount(),
      ]);

      if (data.notifications) {
        setNotifications(data.notifications);
      } else {
        setNotifications(data || []);
      }

      setUnreadCount(unread);
    } catch (error) {
      setToast({ severity: 'error', message: '알림을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const decoratedNotifications = useMemo<DecoratedNotification[]>(
    () =>
      notifications.map((notification) => ({
        ...notification,
        category: inferNotificationCategory(notification),
      })),
    [notifications]
  );

  const filterCounts = useMemo(
    () => ({
      all: decoratedNotifications.length,
      token_purchase: decoratedNotifications.filter((notification) => notification.category === 'token_purchase').length,
      subscription: decoratedNotifications.filter((notification) => notification.category === 'subscription').length,
      character: decoratedNotifications.filter((notification) => notification.category === 'character').length,
      system: decoratedNotifications.filter((notification) => notification.category === 'system').length,
    }),
    [decoratedNotifications]
  );

  const filteredByType = useMemo(() => {
    if (typeFilter === 'all') {
      return decoratedNotifications;
    }

    return decoratedNotifications.filter((notification) => notification.category === typeFilter);
  }, [decoratedNotifications, typeFilter]);

  const filteredNotifications = useMemo(() => {
    if (tabValue === 1) {
      return filteredByType.filter((notification) => !notification.isRead);
    }

    if (tabValue === 2) {
      return filteredByType.filter((notification) => notification.isRead);
    }

    return filteredByType;
  }, [filteredByType, tabValue]);

  const heroStats = useMemo(
    () => [
      {
        label: '전체 알림',
        value: notifications.length,
        helper: '최근 50개 기준',
      },
      {
        label: '즉시 확인',
        value: unreadCount,
        helper: '읽지 않은 항목',
      },
      {
        label: '시스템 안내',
        value: filterCounts.system,
        helper: '운영/정책 알림',
      },
    ],
    [notifications.length, unreadCount, filterCounts.system]
  );

  const activeCategoryMeta = typeFilter === 'all' ? null : categoryMeta[typeFilter];

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch {
      setToast({ severity: 'error', message: '읽음 처리에 실패했습니다.' });
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setToast({ severity: 'success', message: '모든 알림을 읽음 처리했습니다.' });
      fetchNotifications();
    } catch {
      setToast({ severity: 'error', message: '모든 알림 읽음 처리에 실패했습니다.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setToast({ severity: 'success', message: '알림을 삭제했습니다.' });
      fetchNotifications();
    } catch {
      setToast({ severity: 'error', message: '알림 삭제에 실패했습니다.' });
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('모든 알림을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await notificationService.deleteAllNotifications();
      setToast({ severity: 'success', message: '모든 알림을 삭제했습니다.' });
      fetchNotifications();
    } catch {
      setToast({ severity: 'error', message: '전체 삭제에 실패했습니다.' });
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '28px',
              bgcolor: 'rgba(255, 95, 155, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <NotificationsIcon sx={{ fontSize: 44, color: '#ff5f9b' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            로그인이 필요합니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            토큰 충전, 구독 변경, 운영 공지까지 모두 이곳에서 정리됩니다.
          </Typography>
          <Button
            variant="contained"
            onClick={() => openLoginModal('알림을 확인하려면 로그인이 필요해요', '/notifications')}
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.4,
              background: 'linear-gradient(135deg, #ff5f9b 0%, #ff8fab 100%)',
              fontWeight: 700,
            }}
          >
            로그인하기
          </Button>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Card
            sx={{
              ...panelSx,
              overflow: 'hidden',
              background:
                'radial-gradient(circle at top right, rgba(255, 95, 155, 0.28), transparent 34%), linear-gradient(160deg, rgba(34, 24, 44, 0.96), rgba(15, 16, 28, 0.96))',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} md={7}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        icon={<AutoAwesomeIcon sx={{ color: '#fff !important' }} />}
                        label="Notification Hub"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.12)',
                          color: '#fff',
                          fontWeight: 700,
                          '& .MuiChip-icon': { color: '#fff' },
                        }}
                      />
                      <Chip
                        label={`${unreadCount}개 미확인`}
                        size="small"
                        sx={{
                          bgcolor: unreadCount > 0 ? 'rgba(255, 163, 91, 0.18)' : 'rgba(125, 220, 134, 0.18)',
                          color: unreadCount > 0 ? '#ffcf82' : '#99efab',
                          fontWeight: 700,
                        }}
                      />
                    </Stack>

                    <Box>
                      <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 1 }}>
                        중요한 흐름만 빠르게 확인
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 560, lineHeight: 1.7 }}>
                        토큰, 구독, 캐릭터 성과, 운영 공지를 하나의 대시보드처럼 읽기 쉽게 정리했습니다.
                        먼저 확인해야 할 알림부터 우선순위가 보이도록 구성했습니다.
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {Object.entries(categoryMeta).map(([category, meta]) => (
                        <Chip
                          key={category}
                          label={`${meta.label} ${filterCounts[category as NotificationCategory]}`}
                          sx={{
                            borderRadius: '12px',
                            bgcolor: alpha(meta.accent, 0.14),
                            color: meta.accent,
                            fontWeight: 700,
                          }}
                        />
                      ))}
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button
                        variant="contained"
                        startIcon={<DoneAllIcon />}
                        onClick={handleMarkAll}
                        disabled={unreadCount === 0}
                        sx={{
                          borderRadius: '12px',
                          px: 3,
                          py: 1.2,
                          background: 'linear-gradient(135deg, #ff5f9b, #ff8fab)',
                          fontWeight: 700,
                        }}
                      >
                        모두 읽음
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteAll}
                        disabled={notifications.length === 0}
                        sx={{
                          borderRadius: '12px',
                          px: 3,
                          py: 1.2,
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                        }}
                      >
                        전체 삭제
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Grid container spacing={1.5}>
                    {heroStats.map((stat) => (
                      <Grid item xs={12} sm={4} md={12} key={stat.label}>
                        <Box
                          sx={{
                            height: '100%',
                            borderRadius: 3,
                            px: 2.25,
                            py: 2,
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.64)', letterSpacing: 0.3 }}>
                            {stat.label}
                          </Typography>
                          <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', mt: 0.5 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)' }}>
                            {stat.helper}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={panelSx}>
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack spacing={2}>
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
                  <Tab label={`전체 ${notifications.length}`} />
                  <Tab label={`안읽음 ${decoratedNotifications.filter((notification) => !notification.isRead).length}`} />
                  <Tab label={`읽음 ${decoratedNotifications.filter((notification) => notification.isRead).length}`} />
                </Tabs>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {[
                    { label: '전체', value: 'all' },
                    { label: '토큰', value: 'token_purchase' },
                    { label: '구독', value: 'subscription' },
                    { label: '캐릭터', value: 'character' },
                    { label: '시스템', value: 'system' },
                  ].map((item) => {
                    const selected = typeFilter === item.value;
                    const meta = item.value === 'all' ? null : categoryMeta[item.value as NotificationCategory];
                    const count = filterCounts[item.value as keyof typeof filterCounts];

                    return (
                      <Chip
                        key={item.value}
                        label={`${item.label} ${count ?? notifications.length}`}
                        onClick={() => setTypeFilter(item.value as TypeFilter)}
                        sx={{
                          borderRadius: '12px',
                          height: 36,
                          px: 1,
                          border: selected
                            ? `1px solid ${meta?.accent ?? '#ff8fab'}`
                            : '1px solid rgba(255,255,255,0.08)',
                          bgcolor: selected ? alpha(meta?.accent ?? '#ff8fab', 0.16) : 'rgba(255,255,255,0.03)',
                          color: selected ? meta?.accent ?? '#ff8fab' : 'rgba(255,255,255,0.72)',
                          fontWeight: 700,
                        }}
                      />
                    );
                  })}
                </Stack>

                {activeCategoryMeta && (
                  <Box
                    sx={{
                      borderRadius: 3,
                      px: 2,
                      py: 1.6,
                      bgcolor: alpha(activeCategoryMeta.accent, 0.12),
                      border: `1px solid ${alpha(activeCategoryMeta.accent, 0.24)}`,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: activeCategoryMeta.accent, mb: 0.4 }}>
                      {activeCategoryMeta.label} 알림만 모아보기
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)' }}>
                      {activeCategoryMeta.helper}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: '#ff5f9b' }} />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Card sx={{ ...panelSx, textAlign: 'center' }}>
              <CardContent sx={{ py: 8 }}>
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
                  <NotificationsIcon sx={{ color: '#ff8fab', fontSize: 36 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>
                  표시할 알림이 없습니다
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)' }}>
                  현재 필터 조건에 맞는 알림이 없어서, 받은 편지함을 깔끔하게 유지하고 있습니다.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {filteredNotifications.map((notification) => {
                const meta = categoryMeta[notification.category];

                return (
                  <Card
                    key={notification._id}
                    sx={{
                      ...panelSx,
                      position: 'relative',
                      overflow: 'hidden',
                      border: notification.isRead
                        ? '1px solid rgba(255,255,255,0.08)'
                        : `1px solid ${alpha(meta.accent, 0.4)}`,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: `linear-gradient(180deg, ${meta.accent}, ${alpha(meta.accent, 0.2)})`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', md: 'flex-start' }}
                      >
                        <Stack direction="row" spacing={2} sx={{ minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 3,
                              bgcolor: alpha(meta.accent, 0.16),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {meta.icon}
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                              <Chip
                                label={meta.label}
                                size="small"
                                sx={{
                                  borderRadius: '12px',
                                  bgcolor: alpha(meta.accent, 0.12),
                                  color: meta.accent,
                                  fontWeight: 700,
                                }}
                              />
                              <Chip
                                label={notification.isRead ? '읽음 완료' : '새 알림'}
                                size="small"
                                sx={{
                                  borderRadius: '12px',
                                  bgcolor: notification.isRead
                                    ? 'rgba(255,255,255,0.06)'
                                    : 'rgba(255,95,155,0.12)',
                                  color: notification.isRead ? 'rgba(255,255,255,0.64)' : '#ff8fab',
                                  fontWeight: 700,
                                }}
                              />
                            </Stack>

                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>
                              {notification.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)', mt: 0.75, lineHeight: 1.7 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.46)', display: 'block', mt: 1.5 }}>
                              {formatRelativeDate(notification.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} justifyContent="flex-end" flexShrink={0}>
                          {!notification.isRead && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleMarkAsRead(notification._id)}
                              sx={{
                                borderRadius: '12px',
                                px: 2,
                                background: 'linear-gradient(135deg, #ff5f9b, #ff8fab)',
                                fontWeight: 700,
                              }}
                            >
                              읽음 처리
                            </Button>
                          )}
                          <IconButton
                            onClick={() => handleDelete(notification._id)}
                            sx={{
                              color: 'rgba(255,255,255,0.64)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 2.5,
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Stack>
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
