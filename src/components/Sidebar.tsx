'use client';

import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Divider, Badge, Typography, Stack, IconButton, Popover, Button, CircularProgress } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TokenIcon from '@mui/icons-material/Token';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { notificationService } from '@/services/notificationService';

interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

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

export default function Sidebar({ onWidthChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const t = useTranslations();

  const {
    unreadCount,
    newNotification,
    markAsRead: socketMarkAsRead,
    markAllAsRead: socketMarkAllAsRead,
    isConnected,
    clearNewNotification,
  } = useNotificationSocket();

  useEffect(() => {
    onWidthChange?.(isCollapsed ? 70 : 240);
  }, [isCollapsed, onWidthChange]);

  // 새 알림 수신 시 목록에 추가
  useEffect(() => {
    if (newNotification) {
      setNotifications((prev) => [newNotification, ...prev]);
      clearNewNotification();
    }
  }, [newNotification, clearNewNotification]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setIsLoadingNotifications(true);
    try {
      const data = await notificationService.getNotifications();
      // API 응답이 배열이면 그대로, 아니면 notifications 속성 추출
      const notificationList = Array.isArray(data) ? data : (data?.notifications || []);
      setNotifications(notificationList);
    } catch (error) {
      console.error('알림을 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleNotificationItemClick = async (notification: Notification) => {
    if (!notification.isRead) {
      if (isConnected) {
        socketMarkAsRead(notification._id);
      } else {
        await notificationService.markAsRead(notification._id);
      }
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
      );
    }
    if (notification.link) {
      router.push(notification.link);
      handleNotificationClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isConnected) {
      socketMarkAllAsRead();
    } else {
      await notificationService.markAllAsRead();
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#2196f3';
    }
  };

  const notificationOpen = Boolean(notificationAnchor);

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'ko';
  const getLocalePath = (path: string) => `/${locale}${path}`;

  const menuItems = [
    { icon: <HomeIcon />, label: t('nav.home'), path: '/' },
    { icon: <SearchIcon />, label: t('nav.new_ranking'), path: '/characters', badge: 'N' },
    { icon: <TrendingUpIcon />, label: t('nav.popular_ranking'), path: '/characters/popular' },
    { icon: <ChatIcon />, label: t('nav.chat_list'), path: '/chats' },
    { icon: <TokenIcon />, label: t('nav.tokens'), path: '/tokens' },
  ];

  return (
    <Box
      sx={{
        width: isCollapsed ? 70 : 240,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bgcolor: '#1a1a1a',
        borderRight: '1px solid #2a2a2a',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        zIndex: 1000,
        transition: 'width 0.3s ease',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          borderBottom: '1px solid #2a2a2a',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
          onClick={() => router.push(getLocalePath('/'))}
        >
          <Box
            component="img"
            src="/icon.png"
            alt="몽글챗 로고"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
            }}
          />
          {!isCollapsed && (
            <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
              {t('common.appName')}
            </Typography>
          )}
        </Box>
        {!isCollapsed && (
          <IconButton
            onClick={() => setIsCollapsed(true)}
            sx={{ color: '#999', '&:hover': { color: '#fff' } }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {isCollapsed && (
          <ListItem disablePadding sx={{ mb: 2 }}>
            <ListItemButton
              onClick={() => setIsCollapsed(false)}
              sx={{
                borderRadius: 2,
                py: 1.2,
                justifyContent: 'center',
                color: '#999',
                '&:hover': {
                  bgcolor: '#2a2a2a',
                  color: '#fff',
                },
              }}
            >
              <MenuIcon />
            </ListItemButton>
          </ListItem>
        )}

        {menuItems.map((item) => {
          const itemPath = getLocalePath(item.path);
          const isActive = pathname === itemPath;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => router.push(itemPath)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: isCollapsed ? 1 : 2,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  bgcolor: isActive ? '#ff3366' : 'transparent',
                  color: isActive ? '#fff' : '#999',
                  '&:hover': {
                    bgcolor: isActive ? '#ff3366' : '#2a2a2a',
                    color: '#fff',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: isCollapsed ? 0 : 36 }}>
                  {item.badge ? (
                    <Badge
                      badgeContent={item.badge}
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: '#ff3366',
                          color: '#fff',
                        },
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.95rem',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}

        <Divider sx={{ borderColor: '#2a2a2a', my: 2 }} />

        {/* Create Button */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => router.push(getLocalePath('/characters/create'))}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: isCollapsed ? 1 : 2,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              bgcolor: '#ff3366',
              color: '#fff',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#ff5588',
              },
              transition: 'all 0.2s',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: isCollapsed ? 0 : 36 }}>
              <AddCircleIcon />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary={t('nav.create_character')}
                primaryTypographyProps={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        {/* Notification Button - 로그인 시에만 표시 */}
        {isAuthenticated && (
          <>
            <Divider sx={{ borderColor: '#2a2a2a', my: 2 }} />
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleNotificationClick}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: isCollapsed ? 1 : 2,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  color: '#999',
                  '&:hover': {
                    bgcolor: '#2a2a2a',
                    color: '#fff',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: isCollapsed ? 0 : 36 }}>
                  {unreadCount > 0 ? (
                    <Badge
                      badgeContent={unreadCount}
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: '#ff3366',
                          color: '#fff',
                        },
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  ) : (
                    <NotificationsIcon />
                  )}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={t('nav.notifications') || '알림'}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      {/* User Profile */}
      <Box sx={{ p: 2, borderTop: '1px solid #2a2a2a' }}>
        {isAuthenticated ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: isCollapsed ? 1 : 1.5,
              borderRadius: 2,
              bgcolor: '#2a2a2a',
              cursor: 'pointer',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              '&:hover': {
                bgcolor: '#333',
              },
              transition: 'all 0.2s',
            }}
            onClick={() => router.push(getLocalePath('/profile'))}
          >
            <Avatar
              src={user?.profileImage}
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#ff3366',
                border: '2px solid #ff3366',
              }}
            >
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            {!isCollapsed && (
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ color: '#fff' }}>
                  {user?.username || t('common.username')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  {t('common.profile')}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Stack spacing={1}>
            <ListItemButton
              onClick={() => router.push(getLocalePath('/login'))}
              sx={{
                borderRadius: 2,
                bgcolor: '#ff3366',
                color: '#fff',
                fontWeight: 700,
                justifyContent: 'center',
                py: 1.2,
                '&:hover': {
                  bgcolor: '#ff5588',
                },
              }}
            >
              {!isCollapsed && t('common.login')}
              {isCollapsed && 'L'}
            </ListItemButton>
            {!isCollapsed && (
              <ListItemButton
                onClick={() => router.push(getLocalePath('/register'))}
                sx={{
                  borderRadius: 2,
                  bgcolor: 'transparent',
                  border: '1px solid #ff3366',
                  color: '#ff3366',
                  fontWeight: 700,
                  justifyContent: 'center',
                  py: 1.2,
                  '&:hover': {
                    bgcolor: '#2a2a2a',
                  },
                }}
              >
                {t('common.register')}
              </ListItemButton>
            )}
          </Stack>
        )}
      </Box>

      {/* Notification Popover */}
      <Popover
        open={notificationOpen}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            bgcolor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: 2,
            width: 360,
            maxHeight: 500,
            ml: 1,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #2a2a2a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>
            {t('nav.notifications') || '알림'}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{
                color: '#ff3366',
                fontSize: '0.75rem',
                '&:hover': { bgcolor: 'rgba(255, 51, 102, 0.1)' },
              }}
            >
              모두 읽음
            </Button>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
          {isLoadingNotifications ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} sx={{ color: '#ff3366' }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                새로운 알림이 없습니다.
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <Box
                key={notification._id}
                onClick={() => handleNotificationItemClick(notification)}
                sx={{
                  p: 2,
                  borderBottom: '1px solid #2a2a2a',
                  cursor: 'pointer',
                  bgcolor: notification.isRead ? 'transparent' : 'rgba(255, 51, 102, 0.05)',
                  '&:hover': {
                    bgcolor: '#2a2a2a',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: getTypeColor(notification.type),
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {new Date(notification.createdAt).toLocaleString('ko-KR')}
                  </Typography>
                  {!notification.isRead && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#ff3366',
                        ml: 'auto',
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#fff', mb: 0.5 }}>
                  {notification.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#999',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {notification.message}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 1.5, borderTop: '1px solid #2a2a2a' }}>
          <Button
            fullWidth
            size="small"
            onClick={() => {
              router.push(getLocalePath('/notifications'));
              handleNotificationClose();
            }}
            sx={{
              color: '#ff3366',
              '&:hover': { bgcolor: 'rgba(255, 51, 102, 0.1)' },
            }}
          >
            모든 알림 보기
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
