'use client';

import {
  Box,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type ChangeEvent } from 'react';
import PageLayout from '@/components/PageLayout';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { characterService } from '@/services/character.service';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

interface ChatListItem {
  id: string;
  characterId: string;
  characterName: string;
  characterImage?: string;
  lastMessage: string;
  lastMessageTime: Date | null;
  unreadCount: number;
}

const ACCENT = '#ff5f9b';

export default function ChatsPage() {
  const router = useRouter();
  const { getLocalePath } = useLocaleNavigation();
  const { isAuthenticated, loading: authLoading, openLoginModal } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      openLoginModal('채팅 목록을 보려면 로그인이 필요해요', getLocalePath('/chats'));
      setIsLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const chatResponse = await chatService.getChats();

        const uniqueCharacterIds: string[] = Array.from(
          new Set(
            (chatResponse || [])
              .map((chat: any) => chat.character?.toString?.())
              .filter((id: string | undefined): id is string => Boolean(id)),
          ),
        );

        const characterMap = new Map<string, any>();
        await Promise.all(
          uniqueCharacterIds.map(async (id: string) => {
            try {
              const data = await characterService.getCharacter(id);
              characterMap.set(id, data);
            } catch {
              // ignore individual character load failures
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
            characterImage: character?.profileImage || character?.imageUrl,
            lastMessage: lastMessage?.content || '대화 내역이 없습니다.',
            lastMessageTime: lastMessage?.timestamp
              ? new Date(lastMessage.timestamp)
              : chat.lastActivity
              ? new Date(chat.lastActivity)
              : null,
            unreadCount: 0,
          };
        });

        setChats(normalized);
        setFilteredChats(normalized);
      } catch (error) {
        console.error('채팅 목록을 불러오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [authLoading, isAuthenticated, router, openLoginModal, getLocalePath]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredChats(chats.filter(chat => chat.characterName.toLowerCase().includes(q)));
    }
  }, [searchQuery, chats]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const handleDeleteChat = async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      const updated = chats.filter(c => c.id !== chatId);
      setChats(updated);
      setFilteredChats(
        updated.filter(c => c.characterName.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    } catch {
      console.error('채팅 삭제에 실패했습니다.');
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return format(date, 'a h:mm', { locale: ko });
    if (diffDays < 7) return format(date, 'EEEE', { locale: ko });
    return format(date, 'yyyy.MM.dd', { locale: ko });
  };

  if (!isAuthenticated && !authLoading) {
    return (
      <PageLayout>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            px: 3,
          }}
        >
          <ChatBubbleOutlineIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.15)', mb: 3 }} />
          <Typography variant="h5" fontWeight={700} color="white" gutterBottom>
            로그인이 필요합니다
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mb: 4 }}>
            채팅 목록을 보려면 로그인해주세요.
          </Typography>
          <Button
            variant="contained"
            onClick={() => openLoginModal('채팅 목록을 보려면 로그인이 필요해요', '/chats')}
            sx={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #c85b8a 100%)`,
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: `0 8px 24px ${ACCENT}40`,
            }}
          >
            로그인하기
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Sticky header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(9,11,18,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          px: 2,
          pt: 2,
          pb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            edge="start"
            onClick={() => router.back()}
            sx={{ mr: 1, color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} color="white">
            채팅
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)' }}>
            {chats.length}개
          </Typography>
        </Box>

        {/* Search field */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: '14px',
            border: `1px solid ${searchFocused ? 'rgba(255,95,155,0.45)' : 'rgba(255,255,255,0.1)'}`,
            background: 'rgba(255,255,255,0.05)',
            transition: 'border-color 0.2s',
          }}
        >
          <SearchIcon sx={{ color: searchFocused ? ACCENT : 'rgba(255,255,255,0.35)', fontSize: 20, transition: 'color 0.2s' }} />
          <TextField
            fullWidth
            placeholder="대화 검색..."
            variant="standard"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            InputProps={{ disableUnderline: true }}
            sx={{
              '& input': {
                color: 'white',
                fontSize: '0.9rem',
                '&::placeholder': { color: 'rgba(255,255,255,0.3)' },
              },
            }}
          />
          {searchQuery && (
            <IconButton
              size="small"
              onClick={() => setSearchQuery('')}
              sx={{ color: 'rgba(255,255,255,0.4)', p: 0.25 }}
            >
              ×
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ pb: 10 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: ACCENT }} size={36} />
          </Box>
        ) : filteredChats.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,95,155,0.08)',
                border: '1px solid rgba(255,95,155,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 36, color: 'rgba(255,95,155,0.5)' }} />
            </Box>
            <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
              {searchQuery ? '검색 결과가 없어요' : '아직 대화가 없어요'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 4, maxWidth: 260 }}>
              {searchQuery
                ? `"${searchQuery}"와 일치하는 대화를 찾지 못했어요.`
                : '마음에 드는 캐릭터와 첫 대화를 시작해보세요!'}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push(getLocalePath('/characters'))}
                sx={{
                  background: `linear-gradient(135deg, ${ACCENT} 0%, #c85b8a 100%)`,
                  borderRadius: '12px',
                  px: 3,
                  py: 1.25,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: `0 8px 24px ${ACCENT}40`,
                }}
              >
                캐릭터 탐색하기
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ pt: 1 }}>
            {filteredChats.map((chat) => (
              <Box
                key={chat.id}
                onClick={() => router.push(getLocalePath(`/chat/${chat.id}`))}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.15s',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.04)',
                    '& .delete-btn': { opacity: 1 },
                  },
                }}
              >
                {/* Avatar */}
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    src={chat.characterImage}
                    alt={chat.characterName}
                    sx={{
                      width: 52,
                      height: 52,
                      border: '2px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,95,155,0.15)',
                    }}
                  >
                    {chat.characterName[0]}
                  </Avatar>
                  {chat.unreadCount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        minWidth: 18,
                        height: 18,
                        bgcolor: ACCENT,
                        color: 'white',
                        borderRadius: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        px: 0.5,
                        border: '2px solid #090b12',
                      }}
                    >
                      {chat.unreadCount}
                    </Box>
                  )}
                </Box>

                {/* Text content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.4 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.2 }}
                    >
                      {chat.characterName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, ml: 1 }}
                    >
                      {formatTime(chat.lastMessageTime)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      pr: 3,
                    }}
                  >
                    {chat.lastMessage}
                  </Typography>
                </Box>

                {/* Delete button */}
                <IconButton
                  className="delete-btn"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                  sx={{
                    opacity: 0,
                    transition: 'opacity 0.15s',
                    color: 'rgba(255,255,255,0.35)',
                    flexShrink: 0,
                    '&:hover': { color: '#ff5f5f', background: 'rgba(255,80,80,0.1)' },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Floating CTA */}
      {!isLoading && filteredChats.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push(getLocalePath('/characters'))}
            sx={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #c85b8a 100%)`,
              borderRadius: '24px',
              px: 3,
              py: 1.25,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: `0 8px 32px ${ACCENT}50`,
              whiteSpace: 'nowrap',
            }}
          >
            새로운 대화
          </Button>
        </Box>
      )}
    </PageLayout>
  );
}
