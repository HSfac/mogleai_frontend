'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationSystem() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    unreadCount,
    newNotification,
    markAsRead: socketMarkAsRead,
    markAllAsRead: socketMarkAllAsRead,
    isConnected,
    clearNewNotification,
  } = useNotificationSocket();

  useEffect(() => {
    if (!newNotification) return;
    setNotifications((prev) => [newNotification, ...prev]);
    clearNewNotification();
  }, [clearNewNotification, newNotification]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications();
      const notificationList = Array.isArray(data) ? data : (data?.notifications || []);
      setNotifications(notificationList);
    } catch (error) {
      console.error('알림을 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    await fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        if (isConnected) {
          socketMarkAsRead(notification._id);
        } else {
          await notificationService.markAsRead(notification._id);
        }

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item,
          ),
        );
      }

      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      console.error('알림 처리에 실패했습니다:', error);
    } finally {
      handleClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (isConnected) {
        socketMarkAllAsRead();
      } else {
        await notificationService.markAllAsRead();
      }

      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error('전체 읽음 처리에 실패했습니다:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton aria-label="알림" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 360, maxWidth: 'calc(100vw - 32px)', p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              알림
            </Typography>
            <Button size="small" onClick={handleMarkAllAsRead}>
              모두 읽음
            </Button>
          </Stack>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              새로운 알림이 없습니다.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {notifications.slice(0, 8).map((notification) => (
                <Box
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: notification.isRead ? '#fafafa' : 'rgba(255,95,155,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    '&:hover': {
                      bgcolor: notification.isRead ? '#f5f5f5' : 'rgba(255,95,155,0.14)',
                    },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Popover>
    </>
  );
}
