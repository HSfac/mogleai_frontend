'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SendIcon from '@mui/icons-material/Send';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';
import { characterService } from '@/services/character.service';

interface Character {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  defaultAIModel?: string;
}

interface RecentChat {
  _id: string;
  character?: string;
  characterInfo?: Character;
  lastActivity?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const heroSummary = useMemo(() => {
    return {
      activeChats: recentChats.length,
      featuredCharacters: characters.length,
    };
  }, [recentChats.length, characters.length]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/chat');
      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const [chatResponse, charactersResponse] = await Promise.all([
          chatService.getChats().catch(() => []),
          api.get('/characters').catch(() => ({ data: [] })),
        ]);

        const uniqueCharacterIds = Array.from(
          new Set(
            chatResponse
              .map((chat: any) => chat.character?.toString())
              .filter(Boolean),
          ),
        );

        const characterMap = new Map<string, Character>();
        await Promise.all(
          uniqueCharacterIds.map(async (id) => {
            try {
              const data = await characterService.getCharacter(id);
              characterMap.set(id, data);
            } catch {
              // ignore missing characters
            }
          }),
        );

        const enrichedChats = chatResponse.map((chat: any) => ({
          ...chat,
          characterInfo: characterMap.get(chat.character?.toString() || ''),
        }));

        setRecentChats(enrichedChats);
        setCharacters(charactersResponse.data?.slice(0, 6) || []);

        const favoriteResponse = await userService.getFavorites();
        const normalizedFavorites = (favoriteResponse || []).map((item: any) =>
          typeof item === 'string' ? item : item._id ?? '',
        );
        setFavorites(normalizedFavorites.filter(Boolean));
      } catch (error) {
        console.error('채팅 데이터를 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [isAuthenticated, router]);

  const handleFavorite = async (characterId: string) => {
    try {
      if (favorites.includes(characterId)) {
        await userService.removeFavorite(characterId);
        setFavorites((prev) => prev.filter((id) => id !== characterId));
      } else {
        await userService.addFavorite(characterId);
        setFavorites((prev) => [...prev, characterId]);
      }
    } catch (error) {
      console.error('즐겨찾기 업데이트 실패:', error);
    }
  };

  const handleStartChat = async (character: Character) => {
    try {
      const chat = await chatService.createChat({
        characterId: character._id,
        aiModel: character.defaultAIModel || 'gpt4',
      });
      router.push(`/chat/${chat._id}`);
    } catch (startError) {
      console.error('채팅을 시작하지 못했습니다:', startError);
    }
  };

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            borderRadius: 28,
            p: { xs: 3, md: 4 },
            mb: 4,
            background: 'linear-gradient(135deg, #ff5f9b, #ffc7dd)',
            color: '#fff',
            boxShadow: '0 30px 60px rgba(255, 95, 155, 0.3)',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            당신만의 AI 캐릭터와 대화하기
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
            최근 대화, 인기 캐릭터, 즐겨찾기를 한 화면에서 조합해 즉시 대화를 시작하세요.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SendIcon />}
              size="large"
              sx={{ borderRadius: 999 }}
              onClick={() => router.push('/characters')}
            >
              새로운 챗 시작
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.6)',
                borderRadius: 999,
              }}
              onClick={() => router.push('/characters')}
            >
              캐릭터 둘러보기
            </Button>
            <Chip label={`활성 대화 ${heroSummary.activeChats}`} size="small" />
            <Chip label={`추천 캐릭터 ${heroSummary.featuredCharacters}`} size="small" />
          </Stack>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            최근 대화
          </Typography>
          <Stack spacing={2}>
            {recentChats.length === 0 ? (
              <Paper
                sx={{
                  borderRadius: 20,
                  p: 3,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  아직 대화 내역이 없습니다. 새로운 캐릭터와 대화를 시작해보세요.
                </Typography>
              </Paper>
            ) : (
              recentChats.map((chat) => (
                <Paper
                  key={chat._id}
                  elevation={3}
                  sx={{
                    borderRadius: 20,
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 2,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => router.push(`/chat/${chat._id}`)}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={chat.characterInfo?.imageUrl}
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: '#ffe4f0',
                        color: '#ff5f9b',
                      }}
                    >
                      {chat.characterInfo?.name?.slice(0, 1)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {chat.characterInfo?.name || '알 수 없는 캐릭터'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        마지막 활동: {chat.lastActivity ? new Date(chat.lastActivity).toLocaleString() : '정보 없음'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip label="계속하기" color="secondary" sx={{ fontWeight: 600 }} />
                </Paper>
              ))
            )}
          </Stack>
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            인기 캐릭터 추천
          </Typography>
          <Grid container spacing={3}>
            {characters.map((character) => (
              <Grid item xs={12} sm={6} md={4} key={character._id}>
                <Card
                  sx={{
                    borderRadius: 20,
                    border: '1px solid rgba(255, 95, 155, 0.25)',
                    boxShadow: '0 12px 30px rgba(255, 95, 155, 0.15)',
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      p: 3,
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={600}>
                        {character.name}
                      </Typography>
                      <IconButton
                        onClick={() => handleFavorite(character._id)}
                        sx={{
                          bgcolor: '#fff',
                          color: favorites.includes(character._id) ? '#ff5f9b' : '#a1a1aa',
                          boxShadow: '0 4px 10px rgba(255, 95, 155, 0.15)',
                        }}
                      >
                        <FavoriteIcon />
                      </IconButton>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 42 }}>
                      {character.description || '캐릭터 설명이 준비중입니다.'}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {character.tags?.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: '#fff0f7',
                            borderColor: '#ffcdd2',
                            color: '#c3006e',
                          }}
                        />
                      ))}
                    </Stack>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<SendIcon />}
                      sx={{ mt: 1, borderRadius: 999 }}
                      onClick={() => handleStartChat(character)}
                    >
                      대화하기
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </PageLayout>
  );
}
