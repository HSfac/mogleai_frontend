'use client';

import {
  Box,
  Container,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import axios from 'axios';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

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

  const getRankColor = (index) => {
    if (index === 0) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    if (index === 1) return 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)';
    if (index === 2) return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  return (
    <PageLayout>
      <Box sx={{
        background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        minHeight: '100vh',
        py: { xs: 4, md: 8 }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <EmojiEventsIcon sx={{ fontSize: 48, color: '#FFD700' }} />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                인기 캐릭터 랭킹
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              가장 사랑받는 캐릭터들을 만나보세요
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {characters.map((character, index) => (
                <Box
                  key={character._id}
                  onClick={() => router.push(`/characters/${character._id}`)}
                  sx={{
                    background: '#fff',
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: index < 3
                      ? '0 8px 24px rgba(102, 126, 234, 0.15)'
                      : '0 4px 12px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(102, 126, 234, 0.25)',
                    },
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    position: 'relative',
                    border: index < 3 ? '2px solid' : '1px solid',
                    borderColor: index < 3 ? 'rgba(102, 126, 234, 0.3)' : 'rgba(0, 0, 0, 0.08)'
                  }}
                >
                  {/* 랭킹 뱃지 */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      background: getRankColor(index),
                      color: '#fff',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.5rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      zIndex: 1,
                      border: '3px solid #fff'
                    }}
                  >
                    {index + 1}
                  </Box>

                  {/* 캐릭터 이미지 */}
                  <Box
                    sx={{
                      width: { xs: '100%', sm: 280 },
                      height: { xs: 280, sm: 240 },
                      flexShrink: 0,
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
                    }}
                  >
                    <Box
                      component="img"
                      src={character.imageUrl || '/images/default-character.png'}
                      alt={character.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>

                  {/* 캐릭터 정보 */}
                  <Box sx={{
                    flex: 1,
                    p: { xs: 3, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        fontSize: { xs: '1.5rem', md: '2rem' }
                      }}
                    >
                      {character.name}
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        lineHeight: 1.7,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {character.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                      <Chip
                        icon={<ChatBubbleOutlineIcon />}
                        label={`${(character.conversationCount || 0).toLocaleString()}회 대화`}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          fontWeight: 600,
                          px: 1,
                          '& .MuiChip-icon': { color: '#fff' }
                        }}
                      />

                      {character.creator && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="img"
                            src={character.creator.profileImage || '/images/default-avatar.png'}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              border: '2px solid #eee'
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {character.creator.username}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </PageLayout>
  );
} 