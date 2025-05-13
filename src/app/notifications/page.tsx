'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  IconButton
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageLayout from '@/components/PageLayout';
import TopHeader from '@/components/TopHeader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 더미 데이터
const dummyNotifications = [
  {
    id: '1',
    type: 'like',
    message: '비비님이 회원님의 캐릭터를 좋아합니다.',
    createdAt: new Date(2023, 5, 15, 14, 30),
    read: false,
    avatar: '/images/characters/bibi.jpg'
  },
  {
    id: '2',
    type: 'comment',
    message: '일진 윤아님이 회원님의 캐릭터에 댓글을 남겼습니다.',
    createdAt: new Date(2023, 5, 14, 18, 45),
    read: true,
    avatar: '/images/characters/yoona.jpg'
  },
  {
    id: '3',
    type: 'system',
    message: '새로운 업데이트가 있습니다. 앱을 최신 버전으로 업데이트하세요.',
    createdAt: new Date(2023, 5, 13, 21, 10),
    read: false,
    avatar: '/images/logo.png'
  }
];

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제 구현에서는 API 호출로 대체
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        // 백엔드 구현 시 아래 주석 해제
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        //   headers: {
        //     Authorization: `Bearer ${session?.accessToken}`,
        //   },
        // });
        // setNotifications(response.data);
        
        // 더미 데이터 사용 (백엔드 구현 전)
        setTimeout(() => {
          setNotifications(dummyNotifications);
          setIsLoading(false);
        }, 800); // 로딩 효과를 위한 지연
      } catch (error) {
        console.error('알림을 불러오는데 실패했습니다:', error);
        setIsLoading(false);
      }
    };

    if (session) {
      fetchNotifications();
    } else {
      router.push('/login');
    }
  }, [session, router]);

  const handleDeleteNotification = (id) => {
    // 실제 구현에서는 API 호출로 대체
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleReadAll = () => {
    // 실제 구현에서는 API 호출로 대체
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'a h:mm', { locale: ko });
    } else if (diffDays < 7) {
      return format(date, 'E요일', { locale: ko });
    } else {
      return format(date, 'yyyy.MM.dd', { locale: ko });
    }
  };

  return (
    <PageLayout>
      <TopHeader title="알림" />
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="start" 
              onClick={() => router.back()}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="h1" fontWeight="bold">
              알림
            </Typography>
          </Box>
          
          {notifications.length > 0 && (
            <Button 
              variant="text" 
              color="primary" 
              onClick={handleReadAll}
              sx={{ fontSize: '0.875rem' }}
            >
              모두 읽음 표시
            </Button>
          )}
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : notifications.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: 'background.default'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              알림이 없습니다.
            </Typography>
          </Paper>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ 
                    px: 2, 
                    py: 1.5,
                    bgcolor: notification.read ? 'transparent' : 'rgba(255, 94, 98, 0.05)',
                    position: 'relative'
                  }}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={notification.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        component="span"
                        fontWeight={notification.read ? 'normal' : 'medium'}
                      >
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="span"
                      >
                        {formatTime(notification.createdAt)}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </PageLayout>
  );
} 