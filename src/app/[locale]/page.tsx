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
  CardMedia,
  alpha,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BarChartIcon from '@mui/icons-material/BarChart';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageLayout from '@/components/PageLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const featureHighlights = [
  {
    title: 'AI 모델 선택',
    description: 'GPT-4, Claude 3, Mistral을 하나의 인터페이스에서 자유롭게 전환합니다.',
    icon: <BoltIcon />,
  },
  {
    title: '크리에이터 리워드',
    description: '인기 캐릭터 제작자는 토큰 수익을 자동 분배받으며 레벨업 혜택을 확보합니다.',
    icon: <AutoAwesomeIcon />,
  },
  {
    title: '실시간 분석',
    description: '대화량, 좋아요, 수익 통계를 리더보드에서 한눈에 확인하세요.',
    icon: <BarChartIcon />,
  },
  {
    title: '토큰 기반 결제',
    description: '토스 페이먼츠와 자동 구독으로 충전 흐름을 매끄럽게 유지합니다.',
    icon: <RocketLaunchIcon />,
  },
];

const trendingTags = [
  '감성 상담',
  '서스펜스 추리',
  '가상 연애',
  '코딩 멘토',
  '여행 가이드',
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [popularCharacters, setPopularCharacters] = useState<any[]>([]);
  const [latestCharacters, setLatestCharacters] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
              {['홈', '신작 랭킹', '랭킹', '카테고리', '태그', '베이비즈'].map((tab, index) => (
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

          {/* Tab 2+: Other tabs placeholder */}
          {activeTab >= 2 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" sx={{ color: '#999', mb: 2 }}>
                준비 중입니다
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                해당 탭의 콘텐츠를 곧 추가할 예정입니다
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </PageLayout>
  );
}
