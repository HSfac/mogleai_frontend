'use client';

import {
  Box,
  Container,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Grid
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import axios from 'axios';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function PopularCharactersPage() {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchPopularCharacters = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/characters/popular`);
        const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
        setCharacters(data);
      } catch (error) {
        console.error('인기 캐릭터를 불러오는데 실패했습니다:', error);
        setCharacters([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularCharacters();
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) return { emoji: '🥇', color: '#FFD700', label: '1위' };
    if (index === 1) return { emoji: '🥈', color: '#C0C0C0', label: '2위' };
    if (index === 2) return { emoji: '🥉', color: '#CD7F32', label: '3위' };
    return { emoji: '🔥', color: '#ff3366', label: `${index + 1}위` };
  };

  const topCharacters = characters.slice(0, 3);
  const otherCharacters = characters.slice(3);

  return (
    <PageLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <WhatshotIcon sx={{ fontSize: 40, color: '#ff3366' }} />
              <Typography variant="h3" fontWeight={900} color="#fff">
                인기 랭킹 TOP
              </Typography>
            </Stack>
            <Typography variant="body1" color="#999">
              지금 가장 핫한 캐릭터들과 대화를 시작해보세요
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
              <CircularProgress sx={{ color: '#ff3366' }} />
            </Box>
          ) : (
            <>
              {/* Top 3 Grid */}
              <Grid container spacing={3} mb={4}>
                {topCharacters.map((character, index) => {
                  const rankInfo = getRankBadge(index);
                  return (
                    <Grid item xs={12} md={4} key={character._id}>
                      <Card
                        onClick={() => router.push(`/characters/${character._id}`)}
                        sx={{
                          bgcolor: '#1a1a1a',
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: rankInfo.color,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          position: 'relative',
                          overflow: 'visible',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: `0 12px 32px ${rankInfo.color}40`,
                          },
                        }}
                      >
                        {/* Rank Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -16,
                            right: 16,
                            bgcolor: rankInfo.color,
                            color: '#fff',
                            px: 2,
                            py: 0.5,
                            borderRadius: 20,
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            boxShadow: `0 4px 12px ${rankInfo.color}60`,
                            zIndex: 1,
                          }}
                        >
                          {rankInfo.emoji} {rankInfo.label}
                        </Box>

                        <CardMedia
                          component="img"
                          height="280"
                          image={character.imageUrl || '/images/default-character.png'}
                          alt={character.name}
                          sx={{ bgcolor: '#2a2a2a' }}
                        />

                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h5" fontWeight={700} color="#fff" mb={1} noWrap>
                            {character.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="#999"
                            mb={2}
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: 40,
                            }}
                          >
                            {character.description}
                          </Typography>

                          <Stack direction="row" spacing={2} mb={2}>
                            <Chip
                              icon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                              label={(character.conversationCount || 0).toLocaleString()}
                              size="small"
                              sx={{
                                bgcolor: '#2a2a2a',
                                color: '#ff3366',
                                fontWeight: 700,
                                '& .MuiChip-icon': { color: '#ff3366' },
                              }}
                            />
                            <Chip
                              icon={<FavoriteIcon sx={{ fontSize: 16 }} />}
                              label={(character.likes || 0).toLocaleString()}
                              size="small"
                              sx={{
                                bgcolor: '#2a2a2a',
                                color: '#ff6699',
                                fontWeight: 700,
                                '& .MuiChip-icon': { color: '#ff6699' },
                              }}
                            />
                          </Stack>

                          {character.creator && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Avatar
                                src={character.creator.profileImage}
                                sx={{ width: 24, height: 24, border: '2px solid #333' }}
                              />
                              <Typography variant="caption" color="#666" fontWeight={600}>
                                {character.creator.username}
                              </Typography>
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Others List */}
              {otherCharacters.length > 0 && (
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#fff" mb={3}>
                    4위 - {characters.length}위
                  </Typography>
                  <Grid container spacing={2}>
                    {otherCharacters.map((character, index) => {
                      const actualIndex = index + 3;
                      const rankInfo = getRankBadge(actualIndex);
                      return (
                        <Grid item xs={12} sm={6} key={character._id}>
                          <Card
                            onClick={() => router.push(`/characters/${character._id}`)}
                            sx={{
                              bgcolor: '#1a1a1a',
                              borderRadius: 2,
                              border: '1px solid #2a2a2a',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              display: 'flex',
                              '&:hover': {
                                borderColor: '#ff3366',
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <CardMedia
                              component="img"
                              sx={{ width: 120, flexShrink: 0, bgcolor: '#2a2a2a' }}
                              image={character.imageUrl || '/images/default-character.png'}
                              alt={character.name}
                            />
                            <CardContent sx={{ flex: 1, p: 2 }}>
                              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: rankInfo.color }}>
                                  {actualIndex + 1}
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="#fff" noWrap>
                                  {character.name}
                                </Typography>
                              </Stack>

                              <Typography
                                variant="body2"
                                color="#999"
                                mb={1.5}
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {character.description}
                              </Typography>

                              <Stack direction="row" spacing={2}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: '#666' }} />
                                  <Typography variant="caption" color="#999" fontWeight={600}>
                                    {(character.conversationCount || 0).toLocaleString()}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <FavoriteIcon sx={{ fontSize: 14, color: '#666' }} />
                                  <Typography variant="caption" color="#999" fontWeight={600}>
                                    {(character.likes || 0).toLocaleString()}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </PageLayout>
  );
} 