'use client';

import {
  Box,
  Button,
  IconButton,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton
} from '@chakra-ui/popover';
import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const router = useRouter();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('알림을 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!isAuthenticated) return;
    
    try {
      await notificationService.markAsRead(id);
      
      // 로컬 상태 업데이트
      setNotifications(
        notifications.map((n) => 
          n._id === id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('알림 상태 변경에 실패했습니다:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated) return;
    
    try {
      await notificationService.markAllAsRead();
      
      // 로컬 상태 업데이트
      setNotifications(
        notifications.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: '모든 알림을 읽음으로 표시했습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('알림 상태 변경에 실패했습니다:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // 읽음 표시
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // 링크가 있으면 해당 페이지로 이동
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            aria-label="알림"
            icon={<FaBell />}
            variant="ghost"
            size="md"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minW="1.5em"
              textAlign="center"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        w="350px"
        maxH="500px"
        overflowY="auto"
        bg={bgColor}
        borderColor={borderColor}
      >
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold" borderBottomWidth="1px">
          <HStack justify="space-between">
            <Text>알림</Text>
            {unreadCount > 0 && (
              <Button size="xs" onClick={markAllAsRead}>
                모두 읽음 표시
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverBody p={0}>
          {notifications.length === 0 ? (
            <Box p={4} textAlign="center">
              <Text color="gray.500">새로운 알림이 없습니다.</Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((notification) => (
                <Box
                  key={notification._id}
                  p={3}
                  cursor="pointer"
                  onClick={() => handleNotificationClick(notification)}
                  bg={notification.isRead ? 'transparent' : useColorModeValue('gray.50', 'gray.700')}
                  _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                  borderBottomWidth="1px"
                  borderColor={borderColor}
                >
                  <HStack mb={1}>
                    <Badge colorScheme={getNotificationBadgeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Text>
                  </HStack>
                  <Text fontWeight="bold">{notification.title}</Text>
                  <Text fontSize="sm" noOfLines={2}>
                    {notification.message}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </PopoverBody>
        <PopoverFooter borderTopWidth="1px">
          <Button
            size="sm"
            variant="link"
            colorScheme="brand"
            w="full"
            onClick={() => router.push('/notifications')}
          >
            모든 알림 보기
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
} 
