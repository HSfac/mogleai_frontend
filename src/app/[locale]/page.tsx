'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Avatar,
  alpha,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageLayout from '@/components/PageLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [popularCharacters, setPopularCharacters] = useState<any[]>([]);
  const [latestCharacters, setLatestCharacters] = useState<any[]>([]);
  const [followingFeed, setFollowingFeed] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingFeedLoading, setFollowingFeedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'ko';
  const getLocalePath = (path: string) => `/${locale}${path}`;

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const [popularResponse, latestResponse, bannersResponse] = await Promise.all([
          api.get('/characters/popular'),
          api.get('/characters'),
          api.get('/banners/active'),
        ]);

        setPopularCharacters(popularResponse.data || []);
        setLatestCharacters(latestResponse.data?.slice(0, 6) || []);
        setBanners(bannersResponse.data || []);
      } catch (error) {
        console.error('캐릭터 데이터를 불러오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  useEffect(() => {
    const fetchFollowingFeed = async () => {
      if (!isAuthenticated) {
        setFollowingFeed([]);
        return;
      }

      if (!user?.followingCreators?.length) {
        setFollowingFeed([]);
        return;
      }

      setFollowingFeedLoading(true);
      try {
        const response = await api.get('/characters/feed/following', {
          params: { limit: 6 },
        });
        setFollowingFeed(response.data || []);
      } catch (error) {
        console.error('팔로우 피드를 불러오는데 실패했습니다:', error);
        setFollowingFeed([]);
      } finally {
        setFollowingFeedLoading(false);
      }
    };

    fetchFollowingFeed();
  }, [isAuthenticated, user?.followingCreators?.length]);

  return (
    <PageLayout>
      <Box sx={{ width: '100%', bgcolor: '#1a1a1a', minHeight: '100vh' }}>
        {/* Hero Banner */}
        {banners.length > 0 ? (
          <Box
            sx={{
              background: 'linear-gradient(135deg, #ff3366 0%, #ff6699 100%)',
              borderRadius: { xs: 0, md: 1 },
              mx: { xs: 0, md: 3 },
              mt: { xs: 0, md: 3 },
              p: { xs: 3, md: 6 },
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(255, 51, 102, 0.3)',
              minHeight: { xs: 180, md: 220 },
              cursor: banners[0].linkUrl ? 'pointer' : 'default',
            }}
            onClick={() => banners[0].linkUrl && window.open(banners[0].linkUrl, '_blank')}
          >
            {banners[0].imageUrl && (
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: { xs: '50%', md: '40%' },
                  height: '100%',
                  backgroundImage: `url(${banners[0].imageUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                  opacity: 0.3,
                }}
              />
            )}
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: '55%', md: '60%' } }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: '#fff',
                  mb: 1,
                  fontSize: { xs: '1.3rem', md: '2.5rem' },
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  lineHeight: 1.3,
                }}
              >
                {banners[0].title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: { xs: '0.85rem', md: '1rem' },
                }}
              >
                {banners[0].description}
              </Typography>
            </Box>
            {banners.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.75rem' }}>
                  1 / {banners.length}
                </Typography>
              </Box>
            )}
          </Box>
        ) : null}

        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
          {/* Tab Navigation */}
          <Box
            sx={{
              borderBottom: '2px solid #333',
              mb: { xs: 2, md: 4 },
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 2, md: 3 }}
              sx={{ minWidth: 'max-content', px: { xs: 0, md: 0 } }}
            >
              {['홈', '신작 랭킹', '랭킹', '카테고리', '태그', '몽글즈'].map((tab, index) => (
                <Box
                  key={tab}
                  onClick={() => setActiveTab(index)}
                  sx={{
                    pb: 1.5,
                    borderBottom: index === activeTab ? '3px solid #ff3366' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      color: '#ff3366',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={index === activeTab ? 700 : 500}
                    sx={{
                      color: index === activeTab ? '#ff3366' : '#999',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    {tab}
                    {tab === '신작 랭킹' && (
                      <Box
                        component="span"
                        sx={{
                          ml: 0.5,
                          px: 0.6,
                          py: 0.2,
                          bgcolor: '#ff3366',
                          color: '#fff',
                          borderRadius: 1,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                        }}
                      >
                        N
                      </Box>
                    )}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Content based on active tab */}
          {activeTab === 0 && (
            <>
              {isAuthenticated && (
                <Box sx={{ mb: { xs: 3, md: 4 } }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background:
                        'radial-gradient(circle at top right, rgba(124, 199, 255, 0.16), transparent 28%), linear-gradient(160deg, rgba(22, 26, 38, 0.96), rgba(13, 16, 26, 0.96))',
                      boxShadow: '0 24px 60px rgba(8, 10, 18, 0.2)',
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={2}
                        sx={{ mb: 2.5 }}
                      >
                        <Box>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                            <Chip
                              label={`팔로우 ${user?.followingCreators?.length || 0}명`}
                              sx={{
                                borderRadius: '12px',
                                bgcolor: alpha('#7cc7ff', 0.14),
                                color: '#7cc7ff',
                                fontWeight: 700,
                              }}
                            />
                            <Chip
                              label="맞춤 신작 피드"
                              sx={{
                                borderRadius: '12px',
                                bgcolor: 'rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.72)',
                                fontWeight: 700,
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="h6"
                            fontWeight={800}
                            sx={{ color: '#fff', fontSize: { xs: '1.05rem', md: '1.35rem' } }}
                          >
                            팔로우한 크리에이터의 최신 공개 캐릭터
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'rgba(255,255,255,0.62)', mt: 0.8, maxWidth: 640 }}
                          >
                            방금 공개된 신작을 한 번에 확인하고, 바로 대화로 이어질 수 있게 묶었습니다.
                          </Typography>
                        </Box>

                        <Button
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => router.push(getLocalePath('/leaderboard'))}
                          sx={{
                            color: '#7cc7ff',
                            fontWeight: 700,
                            px: 0,
                            minWidth: 'auto',
                          }}
                        >
                          더 많은 크리에이터 보기
                        </Button>
                      </Stack>

                      {followingFeedLoading ? (
                        <Box display="flex" justifyContent="center" py={5}>
                          <CircularProgress size={28} sx={{ color: '#7cc7ff' }} />
                        </Box>
                      ) : followingFeed.length > 0 ? (
                        <Grid container spacing={{ xs: 1.5, md: 2 }}>
                          {followingFeed.map((character) => (
                            <Grid item xs={6} sm={4} md={3} lg={2.4} key={`following-${character._id}`}>
                              <Card
                                sx={{
                                  bgcolor: '#20242f',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  border: '1px solid rgba(124,199,255,0.16)',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(124, 199, 255, 0.18)',
                                    borderColor: '#7cc7ff',
                                  },
                                }}
                                onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    bgcolor: '#7cc7ff',
                                    color: '#07111d',
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: 1,
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    zIndex: 2,
                                  }}
                                >
                                  FOLLOWING
                                </Box>
                                <Box
                                  sx={{
                                    aspectRatio: '3/4',
                                    background: 'linear-gradient(135deg, #2a3142 0%, #171b24 100%)',
                                  }}
                                >
                                  {character.profileImage ? (
                                    <Box
                                      component="img"
                                      src={character.profileImage}
                                      alt={character.name}
                                      sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '3rem',
                                        color: '#8aa0bd',
                                      }}
                                    >
                                      {character.name[0]}
                                    </Box>
                                  )}
                                </Box>

                                <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    noWrap
                                    sx={{
                                      color: '#fff',
                                      mb: 0.5,
                                      fontSize: { xs: '0.85rem', md: '0.95rem' },
                                    }}
                                  >
                                    {character.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#9fb7d8',
                                      display: 'block',
                                      mb: 0.5,
                                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                                      cursor: character.creator?._id ? 'pointer' : 'default',
                                      '&:hover': character.creator?._id ? { color: '#d0e8ff' } : undefined,
                                    }}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (character.creator?._id) {
                                        router.push(getLocalePath(`/creators/${character.creator._id}`));
                                      }
                                    }}
                                    noWrap
                                  >
                                    @{character.creator?.username || '크리에이터'}
                                  </Typography>
                                  <Stack direction="row" spacing={1.5} sx={{ fontSize: '0.7rem' }}>
                                    <Stack direction="row" alignItems="center" spacing={0.3}>
                                      <FavoriteIcon sx={{ fontSize: { xs: 12, md: 14 }, color: '#7cc7ff' }} />
                                      <Typography variant="caption" sx={{ color: '#9fb7d8', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                                        {character.likes}
                                      </Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.3}>
                                      <ChatBubbleOutlineIcon sx={{ fontSize: { xs: 12, md: 14 }, color: '#9fb7d8' }} />
                                      <Typography variant="caption" sx={{ color: '#9fb7d8', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                                        {character.usageCount}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box
                          sx={{
                            borderRadius: 3,
                            border: '1px dashed rgba(255,255,255,0.14)',
                            bgcolor: 'rgba(255,255,255,0.03)',
                            p: { xs: 2.5, md: 3 },
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff', mb: 0.6 }}>
                            {user?.followingCreators?.length
                              ? '팔로우한 크리에이터의 새 공개 캐릭터가 아직 없습니다'
                              : '아직 팔로우한 크리에이터가 없습니다'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)', mb: 2 }}>
                            {user?.followingCreators?.length
                              ? '인기 크리에이터를 더 둘러보거나, 이미 팔로우한 크리에이터의 다음 공개를 기다려보세요.'
                              : '좋아하는 크리에이터를 팔로우하면 신작이 여기 먼저 도착합니다.'}
                          </Typography>
                          <Button
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => router.push(getLocalePath('/leaderboard'))}
                            sx={{
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #7cc7ff, #9ee6ff)',
                              color: '#06111f',
                              fontWeight: 800,
                            }}
                          >
                            크리에이터 둘러보기
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Section Title */}
              <Box display="flex" alignItems="center" mb={{ xs: 2, md: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: '#fff',
                    fontSize: { xs: '1.1rem', md: '1.5rem' },
                  }}
                >
                  {t('home.section_new')}
                </Typography>
              </Box>

              {/* Character Grid */}
              {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress sx={{ color: '#ff3366' }} />
                </Box>
              ) : (
                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                  {latestCharacters.map((character) => (
                <Grid item xs={6} sm={4} md={3} lg={2.4} key={character._id}>
                  <Card
                    sx={{
                      bgcolor: '#242424',
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(255, 51, 102, 0.3), 0 0 20px rgba(255, 51, 102, 0.2)',
                        borderColor: '#ff3366',
                        '& .character-image': {
                          transform: 'scale(1.1)',
                        },
                        '& .character-overlay': {
                          opacity: 0.8,
                        },
                      },
                    }}
                    onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                  >
                    {/* B.ONLY Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: '#ff3366',
                        color: '#fff',
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        zIndex: 2,
                      }}
                    >
                      B.ONLY
                    </Box>

                    {/* NEW Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: '#ff3366',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#fff',
                        zIndex: 2,
                      }}
                    >
                      N
                    </Box>

                    {/* Character Image */}
                    <Box
                      sx={{
                        aspectRatio: '3/4',
                        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Shimmer Overlay on Hover */}
                      <Box
                        className="character-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 51, 102, 0.3) 50%, transparent 70%)',
                          backgroundSize: '200% 200%',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                          zIndex: 1,
                          pointerEvents: 'none',
                        }}
                      />

                      {character.profileImage ? (
                        <Box
                          component="img"
                          src={character.profileImage}
                          alt={character.name}
                          className="character-image"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      ) : (
                        <Box
                          className="character-image"
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            color: '#666',
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {character.name[0]}
                        </Box>
                      )}

                      {/* Age Icon */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: 1,
                          px: 0.8,
                          py: 0.3,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.7rem' }}>
                          🔞
                        </Typography>
                      </Box>
                    </Box>

                    {/* Character Info */}
                    <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{
                          color: '#fff',
                          mb: 0.5,
                          fontSize: { xs: '0.85rem', md: '0.95rem' },
                        }}
                      >
                        {character.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#999',
                          display: 'block',
                          mb: 0.5,
                          fontSize: { xs: '0.7rem', md: '0.75rem' },
                          cursor: character.creator?._id ? 'pointer' : 'default',
                          '&:hover': character.creator?._id ? { color: '#ff8fab' } : undefined,
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (character.creator?._id) {
                            router.push(getLocalePath(`/creators/${character.creator._id}`));
                          }
                        }}
                        noWrap
                      >
                        @{character.creator?.username || '크리에이터'}
                      </Typography>
                      <Stack direction="row" spacing={1.5} sx={{ fontSize: '0.7rem' }}>
                        <Stack direction="row" alignItems="center" spacing={0.3}>
                          <FavoriteIcon sx={{ fontSize: { xs: 12, md: 14 }, color: '#ff3366' }} />
                          <Typography variant="caption" sx={{ color: '#999', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                            {character.likes}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.3}>
                          <ChatBubbleOutlineIcon sx={{ fontSize: { xs: 12, md: 14 }, color: '#999' }} />
                          <Typography variant="caption" sx={{ color: '#999', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                            {character.usageCount}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
                </Grid>
              )}

              {/* Popular Characters Section */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={{ xs: 2, md: 3 }}
                mt={{ xs: 4, md: 6 }}
              >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                color: '#fff',
                fontSize: { xs: '1.1rem', md: '1.5rem' },
              }}
            >
              🚀 따끈따끈한 신예 캐릭터 TOP 10
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push(getLocalePath('/characters/popular'))}
              sx={{
                color: '#ff3366',
                fontWeight: 600,
                fontSize: { xs: '0.8rem', md: '0.9rem' },
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              더 보기
            </Button>
          </Box>

          <Grid container spacing={{ xs: 1.5, md: 2 }}>
            {popularCharacters.slice(0, 10).map((character, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={character._id}>
                <Card
                  sx={{
                    bgcolor: '#242424',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid #333',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(255, 51, 102, 0.2)',
                      borderColor: '#ff3366',
                    },
                  }}
                  onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                >
                  <Box
                    sx={{
                      aspectRatio: '3/4',
                      background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                      position: 'relative',
                    }}
                  >
                    {character.profileImage ? (
                      <Box
                        component="img"
                        src={character.profileImage}
                        alt={character.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          color: '#666',
                        }}
                      >
                        {character.name[0]}
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      sx={{
                        color: '#fff',
                        mb: 0.5,
                        fontSize: { xs: '0.85rem', md: '0.95rem' },
                      }}
                    >
                      {character.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#999',
                        display: 'block',
                        mb: 0.5,
                        fontSize: { xs: '0.7rem', md: '0.75rem' },
                        cursor: character.creator?._id ? 'pointer' : 'default',
                        '&:hover': character.creator?._id ? { color: '#ff8fab' } : undefined,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (character.creator?._id) {
                          router.push(getLocalePath(`/creators/${character.creator._id}`));
                        }
                      }}
                      noWrap
                    >
                      @{character.creator?.username || '크리에이터'}
                    </Typography>
                    <Stack direction="row" spacing={1.5} sx={{ fontSize: '0.7rem' }}>
                      <Stack direction="row" alignItems="center" spacing={0.3}>
                        <FavoriteIcon sx={{ fontSize: { xs: 12, md: 14 }, color: '#ff3366' }} />
                        <Typography variant="caption" sx={{ color: '#999', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                          {character.likes}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.3}>
                        <ChatBubbleOutlineIcon sx={{ fontSize: { xs: 12, md: 14 }, color: '#999' }} />
                        <Typography variant="caption" sx={{ color: '#999', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                          {character.usageCount}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
              </Grid>
            </>
          )}

          {/* Tab 1: 신작 랭킹 (New Ranking) */}
          {activeTab === 1 && (
            <>
              <Box mb={{ xs: 3, md: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: '#fff',
                    fontSize: { xs: '1.1rem', md: '1.5rem' },
                    mb: 1,
                  }}
                >
                  ✨ 신작 랭킹
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  최근 7일 이내 등록된 캐릭터 인기 순위
                </Typography>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress sx={{ color: '#ff3366' }} />
                </Box>
              ) : (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {latestCharacters.slice(0, 20).map((character, index) => (
                    <Grid item xs={12} sm={6} md={4} key={character._id}>
                      <Card
                        sx={{
                          bgcolor: '#242424',
                          borderRadius: 1,
                          border: index < 3 ? '2px solid #ff3366' : '1px solid #333',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px rgba(255, 51, 102, 0.2)',
                            borderColor: '#ff3366',
                          },
                        }}
                        onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                      >
                        <Box sx={{ position: 'relative' }}>
                          {/* Ranking Badge */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              background: index < 3
                                ? 'linear-gradient(135deg, #ff3366 0%, #ff6699 100%)'
                                : 'rgba(0,0,0,0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#fff',
                              zIndex: 2,
                              backdropFilter: 'blur(8px)',
                            }}
                          >
                            {index + 1}
                          </Box>

                          {/* Character Image */}
                          <Box
                            sx={{
                              height: 200,
                              background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            {character.profileImage ? (
                              <Box
                                component="img"
                                src={character.profileImage}
                                alt={character.name}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '4rem',
                                  color: '#666',
                                }}
                              >
                                {character.name[0]}
                              </Box>
                            )}
                          </Box>
                        </Box>

                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 0.5 }}>
                            {character.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#999',
                              display: 'block',
                              mb: 1.5,
                              cursor: character.creator?._id ? 'pointer' : 'default',
                              '&:hover': character.creator?._id ? { color: '#ff8fab' } : undefined,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (character.creator?._id) {
                                router.push(getLocalePath(`/creators/${character.creator._id}`));
                              }
                            }}
                          >
                            @{character.creator?.username || '크리에이터'}
                          </Typography>

                          <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <FavoriteIcon sx={{ fontSize: 16, color: '#ff3366' }} />
                              <Typography variant="caption" sx={{ color: '#999' }}>
                                {character.likes || 0}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: '#999' }} />
                              <Typography variant="caption" sx={{ color: '#999' }}>
                                {character.usageCount || 0}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                              <Typography variant="caption" sx={{ color: '#4caf50' }}>
                                NEW
                              </Typography>
                            </Stack>
                          </Stack>

                          <Typography
                            variant="body2"
                            sx={{
                              color: '#999',
                              fontSize: '0.85rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {character.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* Tab 2: 랭킹 */}
          {activeTab === 2 && (
            <>
              <Box mb={{ xs: 3, md: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: '#fff', fontSize: { xs: '1.1rem', md: '1.5rem' }, mb: 1 }}
                >
                  🏆 전체 랭킹
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  가장 사랑받는 캐릭터 TOP 20
                </Typography>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress sx={{ color: '#ff3366' }} />
                </Box>
              ) : (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {popularCharacters.slice(0, 20).map((character, index) => (
                    <Grid item xs={12} sm={6} md={4} key={character._id}>
                      <Card
                        sx={{
                          bgcolor: '#242424',
                          borderRadius: 1,
                          border: index < 3 ? '2px solid #ff3366' : '1px solid #333',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': { transform: 'translateY(-4px)', borderColor: '#ff3366' },
                        }}
                        onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              background: index < 3 ? 'linear-gradient(135deg, #ff3366, #ff6699)' : 'rgba(0,0,0,0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              fontWeight: 800,
                              color: '#fff',
                              zIndex: 2,
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Box sx={{ height: 180, background: '#2a2a2a', overflow: 'hidden' }}>
                            {character.profileImage ? (
                              <Box component="img" src={character.profileImage} alt={character.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#666' }}>
                                {character.name[0]}
                              </Box>
                            )}
                          </Box>
                        </Box>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 0.5 }}>{character.name}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#999',
                              display: 'block',
                              mb: 1,
                              cursor: character.creator?._id ? 'pointer' : 'default',
                              '&:hover': character.creator?._id ? { color: '#ff8fab' } : undefined,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (character.creator?._id) {
                                router.push(getLocalePath(`/creators/${character.creator._id}`));
                              }
                            }}
                          >
                            @{character.creator?.username || '크리에이터'}
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <FavoriteIcon sx={{ fontSize: 16, color: '#ff3366' }} />
                              <Typography variant="caption" sx={{ color: '#999' }}>{character.likes || 0}</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: '#999' }} />
                              <Typography variant="caption" sx={{ color: '#999' }}>{character.usageCount || 0}</Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              <Box display="flex" justifyContent="center" mt={4}>
                <Button
                  variant="outlined"
                  onClick={() => router.push(getLocalePath('/leaderboard'))}
                  sx={{ borderColor: '#ff3366', color: '#ff3366', borderRadius: '12px', px: 4, '&:hover': { borderColor: '#ff3366', bgcolor: 'rgba(255, 51, 102, 0.1)' } }}
                >
                  전체 랭킹 보기
                </Button>
              </Box>
            </>
          )}

          {/* Tab 3: 카테고리 */}
          {activeTab === 3 && (
            <>
              <Box mb={{ xs: 3, md: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontSize: { xs: '1.1rem', md: '1.5rem' }, mb: 1 }}>
                  📂 카테고리
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>원하는 카테고리의 캐릭터를 찾아보세요</Typography>
              </Box>

              <Grid container spacing={2}>
                {[
                  { name: '연애/로맨스', icon: '💕', color: '#ff6b9d' },
                  { name: '판타지', icon: '🧙‍♂️', color: '#9b59b6' },
                  { name: '일상/힐링', icon: '☀️', color: '#f39c12' },
                  { name: '액션/어드벤처', icon: '⚔️', color: '#e74c3c' },
                  { name: 'SF/미래', icon: '🚀', color: '#3498db' },
                  { name: '공포/미스터리', icon: '👻', color: '#2c3e50' },
                  { name: '코미디', icon: '😂', color: '#1abc9c' },
                  { name: '역사/시대극', icon: '🏛️', color: '#8b4513' },
                  { name: '학원물', icon: '🎓', color: '#ff9ff3' },
                  { name: '직장/사회', icon: '💼', color: '#576574' },
                  { name: '가상 친구', icon: '🤖', color: '#00d2d3' },
                  { name: '멘토/상담', icon: '💡', color: '#ffeaa7' },
                ].map((category) => (
                  <Grid item xs={6} sm={4} md={3} key={category.name}>
                    <Card
                      sx={{
                        bgcolor: '#242424',
                        borderRadius: 2,
                        border: '1px solid #333',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-4px)', borderColor: category.color, boxShadow: `0 8px 24px ${category.color}40` },
                      }}
                      onClick={() => router.push(getLocalePath(`/search?category=${encodeURIComponent(category.name)}`))}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h3" sx={{ mb: 1 }}>{category.icon}</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ color: '#fff' }}>{category.name}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Tab 4: 태그 */}
          {activeTab === 4 && (
            <>
              <Box mb={{ xs: 3, md: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontSize: { xs: '1.1rem', md: '1.5rem' }, mb: 1 }}>
                  🏷️ 인기 태그
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>태그를 클릭하여 관련 캐릭터를 찾아보세요</Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 4 }}>
                {['연애', '판타지', '로맨스', '학원', '힐링', '코미디', 'SF', '공포', '미스터리', '액션', '일상', '상담', '멘토', '친구', '이세계', '마법', '귀여움', '츤데레', '얀데레', '순수', '쿨한', '다정한', '장난꾸러기', '진지한', '밝은'].map((tag, index) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    onClick={() => router.push(getLocalePath(`/search?tag=${encodeURIComponent(tag)}`))}
                    sx={{
                      bgcolor: index < 5 ? '#ff3366' : '#333',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: index < 5 ? '0.95rem' : '0.85rem',
                      py: index < 5 ? 2.5 : 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#ff3366', transform: 'scale(1.05)' },
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Stack>

              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 2 }}>🔥 태그별 인기 캐릭터</Typography>

              <Grid container spacing={2}>
                {latestCharacters.slice(0, 8).map((character) => (
                  <Grid item xs={6} sm={4} md={3} key={character._id}>
                    <Card
                      sx={{ bgcolor: '#242424', borderRadius: 1, border: '1px solid #333', cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', borderColor: '#ff3366' } }}
                      onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                    >
                      <Box sx={{ aspectRatio: '1/1', background: '#2a2a2a' }}>
                        {character.profileImage ? (
                          <Box component="img" src={character.profileImage} alt={character.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#666' }}>{character.name[0]}</Box>
                        )}
                      </Box>
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#fff' }}>{character.name}</Typography>
                        <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                          {character.tags?.slice(0, 2).map((tag: string) => (
                            <Chip key={tag} label={tag} size="small" sx={{ bgcolor: '#333', color: '#ff3366', fontSize: '0.65rem', height: 20 }} />
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Tab 5: 몽글즈 */}
          {activeTab === 5 && (
            <>
              <Box mb={{ xs: 3, md: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontSize: { xs: '1.1rem', md: '1.5rem' }, mb: 1 }}>
                  🍼 몽글즈
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>신규 크리에이터들의 첫 캐릭터를 만나보세요</Typography>
              </Box>

              <Box sx={{ bgcolor: '#1a1a1a', borderRadius: 2, border: '1px solid #333', p: 3, mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: '#ff3366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎉</Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>신규 크리에이터 응원 이벤트</Typography>
                    <Typography variant="body2" sx={{ color: '#999' }}>첫 캐릭터와 대화하면 보너스 토큰 10개 지급!</Typography>
                  </Box>
                </Stack>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress sx={{ color: '#ff3366' }} />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {latestCharacters.map((character) => (
                    <Grid item xs={6} sm={4} md={3} lg={2.4} key={character._id}>
                      <Card
                        sx={{ bgcolor: '#242424', borderRadius: 1, border: '1px solid #333', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', '&:hover': { transform: 'translateY(-4px)', borderColor: '#ff3366' } }}
                        onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                      >
                        <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: '#4caf50', color: '#fff', px: 1, py: 0.3, borderRadius: 1, fontSize: '0.7rem', fontWeight: 700, zIndex: 2 }}>NEW CREATOR</Box>
                        <Box sx={{ aspectRatio: '3/4', background: '#2a2a2a' }}>
                          {character.profileImage ? (
                            <Box component="img" src={character.profileImage} alt={character.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#666' }}>{character.name[0]}</Box>
                          )}
                        </Box>
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#fff' }}>{character.name}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#999',
                              cursor: character.creator?._id ? 'pointer' : 'default',
                              '&:hover': character.creator?._id ? { color: '#ff8fab' } : undefined,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (character.creator?._id) {
                                router.push(getLocalePath(`/creators/${character.creator._id}`));
                              }
                            }}
                          >
                            @{character.creator?.username || '크리에이터'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Container>
      </Box>
    </PageLayout>
  );
}
