import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

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

export const useNotificationSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // 로그아웃 시 소켓 연결 종료
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // 이미 연결되어 있으면 재연결하지 않음
    if (socketRef.current?.connected) {
      return;
    }

    const SOCKET_URL =
      (api.defaults?.baseURL as string | undefined) ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:5001';

    const newSocket = io(`${SOCKET_URL}/notifications`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Notification WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Notification WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // 읽지 않은 알림 개수 업데이트
    newSocket.on('unreadCount', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    // 새 알림 수신
    newSocket.on('newNotification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification);
      setNewNotification(notification);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, isAuthenticated]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      if (socket && isConnected) {
        socket.emit('markAsRead', notificationId);
      }
    },
    [socket, isConnected],
  );

  const markAllAsRead = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('markAllAsRead');
    }
  }, [socket, isConnected]);

  const getNotifications = useCallback(
    (page: number = 1, limit: number = 20): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (socket && isConnected) {
          socket.emit('getNotifications', { page, limit }, (response: any) => {
            if (response.error) {
              reject(response.error);
            } else {
              resolve(response);
            }
          });
        } else {
          reject(new Error('Socket not connected'));
        }
      });
    },
    [socket, isConnected],
  );

  // 새 알림 수신 후 초기화
  const clearNewNotification = useCallback(() => {
    setNewNotification(null);
  }, []);

  return {
    socket,
    isConnected,
    unreadCount,
    newNotification,
    markAsRead,
    markAllAsRead,
    getNotifications,
    clearNewNotification,
  };
};
