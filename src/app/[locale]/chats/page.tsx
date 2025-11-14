'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

// 더미 데이터 (백엔드 구현 전까지 사용)
const dummyChats = [
  {
    id: '1',
    characterId: '101',
    characterName: '비비',
    characterImage: '/images/characters/bibi.jpg',
    lastMessage: '안녕하세요! 오늘 기분이 어떠세요?',
    lastMessageTime: new Date(2023, 5, 15, 14, 30),
    unreadCount: 2
  },
  {
    id: '2',
    characterId: '102',
    characterName: '일진 윤아',
    characterImage: '/images/characters/yoona.jpg',
    lastMessage: '야, 너 내일 학교 오지마.',
    lastMessageTime: new Date(2023, 5, 14, 18, 45),
    unreadCount: 0
  },
  {
    id: '3',
    characterId: '103',
    characterName: '은서 22',
    characterImage: '/images/characters/eunseo.jpg',
    lastMessage: '오늘 수업 너무 힘들었어요...',
    lastMessageTime: new Date(2023, 5, 13, 21, 10),
    unreadCount: 0
  },
  {
    id: '4',
    characterId: '104',
    characterName: '철학자 소크라테스',
    characterImage: '/images/characters/socrates.jpg',
    lastMessage: '너 자신을 알라.',
    lastMessageTime: new Date(2023, 5, 12, 9, 20),
    unreadCount: 0
  },
  {
    id: '5',
    characterId: '105',
    characterName: '심리 상담사 정우',
    characterImage: '/images/characters/counselor.jpg',
    lastMessage: '그런 감정을 느끼는 것은 자연스러운 일이에요.',
    lastMessageTime: new Date(2023, 5, 10, 16, 5),
    unreadCount: 0
  }
];

export default function ChatsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제 구현에서는 API 호출로 대체
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        // 백엔드 구현 시 아래 주석 해제
        // const response = await api.get('/chat');
        // setChats(response.data);
        
        // 더미 데이터 사용 (백엔드 구현 전)
        setTimeout(() => {
          setChats(dummyChats);
          setFilteredChats(dummyChats);
          setIsLoading(false);
        }, 800); // 로딩 효과를 위한 지연
      } catch (error) {
        console.error('채팅 목록을 불러오는데 실패했습니다:', error);
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchChats();
    } else {
      router.push('/login?redirect=/chats');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat => 
        chat.characterName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteChat = (chatId) => {
    // 실제 구현에서는 API 호출로 대체
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    setFilteredChats(updatedChats.filter(chat => 
      chat.characterName.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'a h:mm', { locale: ko });
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: ko });
    } else {
      return format(date, 'yyyy.MM.dd', { locale: ko });
    }
  };

  return (
    <PageLayout>
      <Box sx={{ bgcolor: '#fff', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #eee' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              edge="start" 
              onClick={() => router.back()}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="h1" fontWeight="bold">
              채팅
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            placeholder="대화 검색..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                bgcolor: '#f5f5f5'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
      
      <Box sx={{ px: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#ff5e62' }} />
          </Box>
        ) : filteredChats.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              {searchQuery ? '검색 결과가 없습니다.' : '대화 내역이 없습니다.'}
            </Typography>
            {!searchQuery && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                캐릭터를 탐색하고 대화를 시작해보세요.
              </Typography>
            )}
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {filteredChats.map((chat, index) => (
              <Box key={chat.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    px: 2, 
                    py: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                  onClick={() => router.push(`/chats/${chat.id}`)}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar 
                        src={chat.characterImage} 
                        alt={chat.characterName}
                        sx={{ width: 50, height: 50 }}
                      />
                      {chat.unreadCount > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 18,
                            height: 18,
                            bgcolor: '#ff5e62',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {chat.unreadCount}
                        </Box>
                      )}
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {chat.characterName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(chat.lastMessageTime)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mt: 0.5
                        }}
                      >
                        {chat.lastMessage}
                      </Typography>
                    }
                    sx={{ ml: 1 }}
                  />
                </ListItem>
                {index < filteredChats.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </Box>
            ))}
          </List>
        )}
      </Box>
      
      {!isLoading && filteredChats.length === 0 && !searchQuery && (
        <Box sx={{ position: 'fixed', bottom: 80, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={3}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 5,
              bgcolor: '#ff5e62',
              color: 'white',
              maxWidth: '80%',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/characters')}
          >
            <Typography variant="body2" fontWeight="medium">
              새로운 대화 시작하기
            </Typography>
          </Paper>
        </Box>
      )}
    </PageLayout>
  );
} 
