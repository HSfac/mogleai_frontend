'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  ListItemIcon,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TokenIcon from '@mui/icons-material/Token';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
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

const iconMap = {
  token_purchase: <TokenIcon sx={{ color: '#ff9800' }} />,
  low_tokens: <TokenIcon sx={{ color: '#ff9800' }} />,
  subscription: <StarIcon sx={{ color: '#4caf50' }} />,
  character_popular: <TrendingUpIcon sx={{ color: '#2196f3' }} />,
  monthly_bonus: <MonetizationOnIcon sx={{ color: '#ff5e62' }} />,
  creator_level_up: <MonetizationOnIcon sx={{ color: '#ff5e62' }} />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [typeFilter, setTypeFilter] = useState<'all' | 'token_purchase' | 'subscription' | 'character'>('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/notifications');
      return;
    }
    fetchNotifications();
  }, [isAuthenticated, router]);

  const fetchNotifications = async (page: number = 1) => {
    setLoading(true);
    try {
      const [data, unread] = await Promise.all([
        notificationService.getNotifications(page, 50), // 페이지당 50개
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

  const [unreadCount, setUnreadCount] = useState(0);

  const filteredByType = useMemo(() => {
    if (typeFilter === 'all') return notifications;
    return notifications.filter((notification) => notification.type === typeFilter);
  }, [notifications, typeFilter]);

  const filteredNotifications = useMemo(() => {
    if (tabValue === 1) return filteredByType.filter((n) => !n.isRead);
    if (tabValue === 2) return filteredByType.filter((n) => n.isRead);
    return filteredByType;
  }, [filteredByType, tabValue]);

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
      setToast({ severity: 'error', message: '모든 알림 읽음 처리 실패' });
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
    if (!confirm('모든 알림을 삭제하시겠습니까?')) return;
    try {
      await notificationService.deleteAllNotifications();
      setToast({ severity: 'success', message: '모든 알림을 삭제했습니다.' });
      fetchNotifications();
    } catch {
      setToast({ severity: 'error', message: '전체 삭제에 실패했습니다.' });
    }
  };

  const heroStats = useMemo(() => [
    { label: '전체', value: notifications.length },
    { label: '읽지 않음', value: unreadCount },
    { label: '읽음', value: notifications.length - unreadCount },
  ], [notifications.length, unreadCount]);

  if (!isAuthenticated) return null;

  return (
    <PageLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: 28,
              background: 'linear-gradient(135deg, rgba(255,95,155,0.95), rgba(255,214,227,0.95))',
              color: '#fff',
              px: { xs: 3, md: 4 },
              py: 4,
              boxShadow: '0 30px 60px rgba(255, 95, 155, 0.3)',
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h4" fontWeight={700}>
                알림
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                중요한 소식, 토큰 충전, 구독 대화 등을 모두 여기에서 확인하세요.
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={3}>
              {heroStats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: 16,
                    px: 2,
                    py: 1,
                    minWidth: 130,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Stack direction="row" spacing={2} mt={3}>
              <Button variant="outlined" color="inherit" startIcon={<DoneAllIcon />} onClick={handleMarkAll} disabled={unreadCount === 0}>
                모두 읽음
              </Button>
              <Button variant="outlined" color="inherit" startIcon={<DeleteIcon />} onClick={handleDeleteAll} disabled={notifications.length === 0}>
                전체 삭제
              </Button>
            </Stack>
          </Card>

        <Box>
          <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} indicatorColor="secondary" textColor="secondary">
            <Tab label={`전체 (${notifications.length})`} />
            <Tab label={`안읽음 (${notifications.filter((n) => !n.isRead).length})`} />
            <Tab label={`읽음 (${notifications.filter((n) => n.isRead).length})`} />
          </Tabs>
          <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
            {[
              { label: '전체', value: 'all' },
              { label: '토큰/경고', value: 'token_purchase' },
              { label: '구독', value: 'subscription' },
              { label: '인기/캐릭터', value: 'character' },
            ].map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                variant={typeFilter === item.value ? 'filled' : 'outlined'}
                color="secondary"
                onClick={() => setTypeFilter(item.value as any)}
                sx={{ borderRadius: 8 }}
              />
            ))}
          </Stack>
            <Divider />
            <Stack spacing={2} mt={3}>
              {loading ? (
                <Box display="flex" justifyContent="center">
                  <CircularProgress sx={{ color: '#ff5f9b' }} />
                </Box>
              ) : filteredNotifications.length === 0 ? (
                <Card sx={{ borderRadius: 20, background: '#fff5fb', px: 3, py: 4 }}>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    해당 조건의 알림이 없습니다.
                  </Typography>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification._id}
                    sx={{
                      borderRadius: 20,
                      border: notification.isRead ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(255, 95, 155, 0.4)',
                      background: notification.isRead ? '#fff' : '#fff5fb',
                      position: 'relative',
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ListItemIcon sx={{ minWidth: 'auto' }}>
                            {iconMap[notification.type as keyof typeof iconMap] || (
                              <NotificationsIcon sx={{ color: '#777' }} />
                            )}
                          </ListItemIcon>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {notification.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {notification.message}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={notification.isRead ? '읽음' : '새 알림'}
                            size="small"
                            sx={{
                              borderColor: '#ff5f9b',
                              color: '#ff5f9b',
                              borderRadius: 8,
                              fontWeight: 600,
                            }}
                          />
                          <IconButton onClick={() => handleDelete(notification._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                        <Button variant="text" size="small" onClick={() => handleMarkAsRead(notification._id)}>
                          읽음 처리
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>

      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </PageLayout>
  );
}
