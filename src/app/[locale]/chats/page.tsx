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
import { chatService } from '@/services/chatService';
import { characterService } from '@/services/character.service';

interface ChatListItem {
  id: string;
  characterId: string;
  characterName: string;
  characterImage?: string;
  lastMessage: string;
  lastMessageTime: Date | null;
  unreadCount: number;
}

export default function ChatsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const chatResponse = await chatService.getChats();

        const uniqueCharacterIds = Array.from(
          new Set(
            (chatResponse || [])
              .map((chat: any) => chat.character?.toString?.())
              .filter(Boolean),
          ),
        );

        const characterMap = new Map<string, any>();
        await Promise.all(
          uniqueCharacterIds.map(async (id) => {
            try {
              const data = await characterService.getCharacter(id);
              characterMap.set(id, data);
            } catch {
              // 개별 캐릭터 로드 실패는 무시
            }
          }),
        );

        const normalized = (chatResponse || []).map((chat: any) => {
          const lastMessage = (chat.messages || [])[chat.messages.length - 1];
          const character = characterMap.get(chat.character?.toString?.() || '');
          return {
            id: chat._id,
            characterId: chat.character?.toString?.() || '',
            characterName: character?.name || '알 수 없는 캐릭터',
            characterImage: character?.imageUrl,
            lastMessage: lastMessage?.content || '대화 내역이 없습니다.',
            lastMessageTime: lastMessage?.timestamp ? new Date(lastMessage.timestamp) : chat.lastActivity ? new Date(chat.lastActivity) : null,
            unreadCount: 0,
          };
        });

        setChats(normalized);
        setFilteredChats(normalized);
        setIsLoading(false);
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

  const handleDeleteChat = async (chatId) => {
    try {
      await chatService.deleteChat(chatId);
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      setFilteredChats(updatedChats.filter(chat => 
        chat.characterName.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } catch (deleteError) {
      console.error('채팅 삭제에 실패했습니다:', deleteError);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
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
                  onClick={() => router.push(`/chat/${chat.id}`)}
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
