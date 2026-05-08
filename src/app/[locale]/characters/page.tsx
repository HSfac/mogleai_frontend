'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  InputAdornment,
  IconButton,
  Tab,
  Tabs,
  Skeleton,
  Fab,
  Zoom,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { characterService } from '@/services/character.service';
import { api } from '@/lib/api';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

interface Character {
  _id: string;
  name: string;
  description?: string;
  creator?: {
    username?: string;
  };
  likes: number;
  usageCount: number;
  tags?: string[];
  isVerified?: boolean;
  isAdultContent?: boolean;
}

const defaultTags = ['감성 상담', '판타지', '섭외형', '토론 파트너', '롤플레이'];

// 캐릭터 아바타 그라데이션 색상
const avatarGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
];

const getAvatarGradient = (name: string) => {
  const index = name.charCodeAt(0) % avatarGradients.length;
  return avatarGradients[index];
};

// 캐릭터 아바타 컴포넌트
const CharacterAvatar = ({ name, size = 40 }: { name: string; size?: number }) => (
  <Box
    sx={{
      width: size,
      height: size,
      minWidth: size,
      borderRadius: '50%',
      background: getAvatarGradient(name),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 800,
      color: '#fff',
      textTransform: 'uppercase',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}
  >
    {name.charAt(0)}
  </Box>
);

// 스켈레톤 카드 컴포넌트
const SkeletonCard = ({ isMobile }: { isMobile: boolean }) => (
  <Card
    sx={{
      height: '100%',
      bgcolor: '#1a1a1a',
      borderRadius: { xs: 2, md: 3 },
      border: '1px solid #2a2a2a',
      overflow: 'hidden',
    }}
  >
    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={{ xs: 1.5, md: 2 }}>
        <Skeleton
          variant="circular"
          width={isMobile ? 36 : 44}
          height={isMobile ? 36 : 44}
          sx={{ bgcolor: '#2a2a2a' }}
        />
        <Box flex={1}>
          <Skeleton variant="text" width="70%" height={isMobile ? 18 : 24} sx={{ bgcolor: '#2a2a2a' }} />
          <Skeleton variant="text" width="40%" height={isMobile ? 14 : 16} sx={{ bgcolor: '#2a2a2a' }} />
        </Box>
      </Box>
      <Skeleton variant="text" width="100%" height={isMobile ? 14 : 16} sx={{ bgcolor: '#2a2a2a', mb: 0.5 }} />
      <Skeleton variant="text" width="80%" height={isMobile ? 14 : 16} sx={{ bgcolor: '#2a2a2a', mb: 1.5 }} />
      <Stack direction="row" spacing={0.5} mb={1.5}>
        <Skeleton variant="rounded" width={50} height={isMobile ? 20 : 24} sx={{ bgcolor: '#2a2a2a', borderRadius: 3 }} />
        <Skeleton variant="rounded" width={40} height={isMobile ? 20 : 24} sx={{ bgcolor: '#2a2a2a', borderRadius: 3 }} />
      </Stack>
      <Box sx={{ pt: 1.5, borderTop: '1px solid #2a2a2a' }}>
        <Skeleton variant="text" width="60%" height={14} sx={{ bgcolor: '#2a2a2a' }} />
      </Box>
    </CardContent>
  </Card>
);

// 빈 상태 컴포넌트
const EmptyState = ({ searchQuery }: { searchQuery: string }) => (
  <Box
    sx={{
      py: { xs: 6, md: 10 },
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: { xs: 80, md: 120 },
        height: { xs: 80, md: 120 },
        mx: 'auto',
        mb: 3,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SearchOffIcon sx={{ fontSize: { xs: 40, md: 60 }, color: '#444' }} />
    </Box>
    <Typography
      variant="h6"
      sx={{
        color: '#fff',
        fontWeight: 700,
        mb: 1,
        fontSize: { xs: '1rem', md: '1.25rem' },
      }}
    >
      {searchQuery ? '검색 결과가 없습니다' : '캐릭터가 없습니다'}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: '#666',
        maxWidth: 300,
        mx: 'auto',
        fontSize: { xs: '0.8rem', md: '0.875rem' },
      }}
    >
      {searchQuery
        ? `"${searchQuery}"에 대한 결과를 찾을 수 없어요. 다른 키워드로 검색해보세요.`
        : '새로운 캐릭터를 만들어보세요!'}
    </Typography>
  </Box>
);

export default function CharactersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { getLocalePath } = useLocaleNavigation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [characters, setCharacters] = useState<Character[]>([]);
  const [popularCharacters, setPopularCharacters] = useState<Character[]>([]);
  const [adultFilter, setAdultFilter] = useState<'all' | 'safe' | 'adult'>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState<'recommend' | 'popular'>('recommend');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadCharacters();
    loadPopularCharacters();
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const data = await characterService.getCharacters();
      setCharacters(data);
    } catch (error) {
      console.error('캐릭터 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularCharacters = async () => {
    try {
      const response = await api.get('/characters/popular');
      setPopularCharacters(response.data || []);
    } catch (error) {
      console.error('인기 캐릭터 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await api.get('/users/me/favorites');
      setFavorites(response.data?.map((item: any) => (item._id ? item._id : item)));
    } catch (error) {
      console.error('즐겨찾기 불러오기 실패:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('query', searchQuery);
      }
      if (selectedTags.length) {
        params.append('tags', selectedTags.join(','));
      }
      const response = await api.get(`/characters?${params.toString()}`);
      setCharacters(response.data);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleFavoriteToggle = async (characterId: string) => {
    if (!isAuthenticated) {
      window.location.href = `${getLocalePath('/login')}?redirect=${encodeURIComponent(getLocalePath('/characters'))}`;
      return;
    }

    try {
      if (favorites.includes(characterId)) {
        await api.delete(`/users/me/favorites/${characterId}`);
        setFavorites(favorites.filter((id) => id !== characterId));
      } else {
        await api.put(`/users/me/favorites/${characterId}`);
        setFavorites([...favorites, characterId]);
      }
    } catch (error) {
      console.error('즐겨찾기 실패:', error);
    }
  };

  const baseCharacters = tabValue === 'recommend' ? characters : popularCharacters;
  const displayedCharacters = baseCharacters.filter((c) => {
    if (adultFilter === 'safe' && c.isAdultContent) return false;
    if (adultFilter === 'adult' && !c.isAdultContent) return false;
    return true;
  });

  return (
    <PageLayout>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
          pt: { xs: 3, sm: 5, md: 8 },
          pb: { xs: 3, sm: 5, md: 8 },
          borderBottom: '1px solid #1a1a1a',
          position: 'relative',
          overflow: 'hidden',
          // 배경 글로우 효과
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at center, rgba(255,51,102,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 1, md: 2 },
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
            }}
          >
            캐릭터 탐색
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: '#888',
              mb: { xs: 3, md: 5 },
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
            }}
          >
            다양한 AI 캐릭터와 대화해보세요
          </Typography>

          {/* Search Bar - 글래스모피즘 스타일 */}
          <Box
            sx={{
              maxWidth: 800,
              mx: 'auto',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              borderRadius: { xs: 2.5, md: 3.5 },
              p: { xs: 1.5, md: 2 },
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
              <TextField
                fullWidth
                placeholder={isMobile ? '검색...' : '캐릭터 이름, 태그로 검색...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') handleSearch();
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#666', fontSize: { xs: 20, md: 24 } }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        sx={{ color: '#666' }}
                      >
                        <CloseIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(0,0,0,0.4)',
                    borderRadius: { xs: 2, md: 2.5 },
                    color: '#fff',
                    height: { xs: 46, md: 56 },
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,51,102,0.5)' },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff3366',
                      borderWidth: 2,
                      boxShadow: '0 0 20px rgba(255,51,102,0.2)',
                    },
                  },
                  '& input': {
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '&::placeholder': { color: '#666' },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  minWidth: { xs: 46, sm: 90, md: 110 },
                  height: { xs: 46, md: 56 },
                  px: { xs: 1.5, sm: 3, md: 4 },
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #ff3366 0%, #ff6b8a 100%)',
                  fontWeight: 700,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 2.5 },
                  boxShadow: '0 4px 20px rgba(255,51,102,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e62958 0%, #ff5577 100%)',
                    boxShadow: '0 6px 24px rgba(255,51,102,0.5)',
                  },
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>검색</Box>
                <SearchIcon sx={{ display: { xs: 'block', sm: 'none' }, fontSize: 22 }} />
              </Button>
            </Stack>
          </Box>

          {/* Tags - 가로 스크롤 */}
          <Box
            sx={{
              mt: { xs: 2.5, md: 4 },
              mx: { xs: -2, sm: 0 },
              px: { xs: 2, sm: 0 },
              overflowX: { xs: 'auto', sm: 'visible' },
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: { xs: 'flex-start', sm: 'center' },
                minWidth: { xs: 'max-content', sm: 'auto' },
                pb: { xs: 1, sm: 0 },
              }}
            >
              {defaultTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Chip
                    key={tag}
                    label={isSelected ? `#${tag}` : tag}
                    onClick={() => handleTagClick(tag)}
                    sx={{
                      bgcolor: isSelected ? '#ff3366' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#fff' : '#aaa',
                      border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', md: '0.85rem' },
                      height: { xs: 32, md: 36 },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isSelected ? '#e62958' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  />
                );
              })}
              {/* 필터 토글 버튼 */}
              <Chip
                icon={<FilterAltIcon sx={{ fontSize: 14 }} />}
                label="필터"
                onClick={() => setShowFilterPanel((v) => !v)}
                sx={{
                  bgcolor: showFilterPanel ? '#ff3366' : 'rgba(255,255,255,0.05)',
                  color: showFilterPanel ? '#fff' : '#aaa',
                  border: showFilterPanel ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', md: '0.85rem' },
                  height: { xs: 32, md: 36 },
                }}
              />
            </Stack>
          </Box>

          {/* 고급 필터 패널 */}
          <Collapse in={showFilterPanel}>
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 1 }}>
                연령 제한
              </Typography>
              <Stack direction="row" spacing={1}>
                {[
                  { value: 'all', label: '전체' },
                  { value: 'safe', label: '전체이용가' },
                  { value: 'adult', label: '성인 전용' },
                ].map(({ value, label }) => (
                  <Chip
                    key={value}
                    label={label}
                    onClick={() => setAdultFilter(value as any)}
                    size="small"
                    sx={{
                      bgcolor: adultFilter === value ? '#ff3366' : 'rgba(255,255,255,0.06)',
                      color: adultFilter === value ? '#fff' : 'rgba(255,255,255,0.6)',
                      border: adultFilter === value ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Collapse>
        </Container>
      </Box>

      {/* 메인 콘텐츠 영역 */}
      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', py: { xs: 2, md: 5 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 } }}>
          {/* Tabs - 세련된 스타일 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: { xs: 2, md: 4 },
              px: { xs: 0.5, md: 0 },
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, value) => setTabValue(value)}
              sx={{
                minHeight: { xs: 40, md: 48 },
                '& .MuiTab-root': {
                  fontSize: { xs: '0.85rem', md: '1rem' },
                  fontWeight: 700,
                  textTransform: 'none',
                  minWidth: { xs: 70, md: 100 },
                  minHeight: { xs: 40, md: 48 },
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 1.5, md: 2.5 },
                  color: '#666',
                  transition: 'color 0.2s',
                },
                '& .Mui-selected': { color: '#fff' },
                '& .MuiTabs-indicator': {
                  bgcolor: '#ff3366',
                  height: 3,
                  borderRadius: 1.5,
                },
              }}
            >
              <Tab label="추천" value="recommend" />
              <Tab label="인기" value="popular" />
            </Tabs>

            {/* 필터 버튼 (모바일) */}
            {isMobile && (
              <IconButton
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <TuneIcon sx={{ fontSize: 20, color: '#888' }} />
              </IconButton>
            )}
          </Box>

          {/* 캐릭터 그리드 */}
          {loading ? (
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={6} sm={6} md={4} key={index}>
                  <SkeletonCard isMobile={isMobile} />
                </Grid>
              ))}
            </Grid>
          ) : displayedCharacters.length === 0 ? (
            <EmptyState searchQuery={searchQuery} />
          ) : (
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {displayedCharacters.map((character, index) => (
                <Grid item xs={6} sm={6} md={4} key={character._id}>
                  <Card
                    onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(145deg, #1a1a1a 0%, #151515 100%)',
                      borderRadius: { xs: 2.5, md: 3.5 },
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      WebkitTapHighlightColor: 'transparent',
                      overflow: 'hidden',
                      position: 'relative',
                      // 상단 그라데이션 악센트
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: getAvatarGradient(character.name),
                        opacity: 0,
                        transition: 'opacity 0.3s',
                      },
                      '&:hover': {
                        transform: { xs: 'none', md: 'translateY(-6px) scale(1.02)' },
                        borderColor: 'rgba(255,51,102,0.3)',
                        boxShadow: { xs: 'none', md: '0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(255,51,102,0.1)' },
                        '&::before': { opacity: 1 },
                      },
                      '&:active': {
                        transform: { xs: 'scale(0.98)', md: 'translateY(-6px) scale(1.02)' },
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                      {/* 헤더: 아바타 + 이름 + 즐겨찾기 */}
                      <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }} mb={{ xs: 1.5, md: 2 }}>
                        <CharacterAvatar name={character.name} size={isMobile ? 36 : 44} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              color="#fff"
                              sx={{
                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {character.name}
                            </Typography>
                            {character.isAdultContent && (
                              <Chip
                                label="19+"
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, rgba(244,67,54,0.3) 0%, rgba(244,67,54,0.15) 100%)',
                                  color: '#ff6b6b',
                                  fontWeight: 700,
                                  fontSize: { xs: '0.55rem', md: '0.6rem' },
                                  height: { xs: 16, md: 18 },
                                  border: '1px solid rgba(244,67,54,0.3)',
                                  '& .MuiChip-label': { px: { xs: 0.5, md: 0.75 } },
                                }}
                              />
                            )}
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#666',
                              fontSize: { xs: '0.65rem', md: '0.7rem' },
                            }}
                          >
                            by {character.creator?.username || '크리에이터'}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(character._id);
                          }}
                          sx={{
                            p: { xs: 0.5, md: 0.75 },
                            bgcolor: favorites.includes(character._id) ? 'rgba(255,51,102,0.15)' : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(255,51,102,0.2)',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <FavoriteIcon
                            sx={{
                              fontSize: { xs: 18, md: 20 },
                              color: favorites.includes(character._id) ? '#ff3366' : '#555',
                              transition: 'color 0.2s',
                            }}
                          />
                        </IconButton>
                      </Box>

                      {/* 설명 */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#888',
                          mb: { xs: 1.5, md: 2 },
                          height: { xs: 36, md: 44 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontSize: { xs: '0.75rem', md: '0.85rem' },
                          lineHeight: 1.5,
                        }}
                      >
                        {character.description || '이 캐릭터와 대화해보세요!'}
                      </Typography>

                      {/* 태그 */}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        mb={{ xs: 1.5, md: 2 }}
                        sx={{ overflow: 'hidden' }}
                      >
                        {character.tags?.slice(0, isMobile ? 2 : 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,51,102,0.1)',
                              color: '#ff6b8a',
                              fontWeight: 600,
                              border: 'none',
                              fontSize: { xs: '0.6rem', md: '0.7rem' },
                              height: { xs: 20, md: 24 },
                              '& .MuiChip-label': { px: { xs: 0.75, md: 1 } },
                            }}
                          />
                        ))}
                      </Stack>

                      {/* 푸터: 통계 */}
                      <Box
                        sx={{
                          pt: { xs: 1, md: 1.5 },
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: { xs: 1.5, md: 2 },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <FavoriteIcon sx={{ fontSize: { xs: 12, md: 14 }, color: '#555' }} />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              color: '#777',
                              fontSize: { xs: '0.65rem', md: '0.75rem' },
                            }}
                          >
                            {character.likes >= 1000 ? `${(character.likes / 1000).toFixed(1)}k` : character.likes}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <ChatBubbleOutlineIcon sx={{ fontSize: { xs: 12, md: 14 }, color: '#555' }} />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              color: '#777',
                              fontSize: { xs: '0.65rem', md: '0.75rem' },
                            }}
                          >
                            {character.usageCount >= 1000 ? `${(character.usageCount / 1000).toFixed(1)}k` : character.usageCount}
                          </Typography>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* 플로팅 액션 버튼 - 캐릭터 만들기 */}
      <Zoom in={!loading}>
        <Fab
          color="primary"
          aria-label="캐릭터 만들기"
          onClick={() => router.push(getLocalePath('/characters/create'))}
          sx={{
            position: 'fixed',
            bottom: { xs: 24, md: 32 },
            right: { xs: 16, md: 32 },
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            background: 'linear-gradient(135deg, #ff3366 0%, #ff6b8a 100%)',
            boxShadow: '0 8px 32px rgba(255,51,102,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #e62958 0%, #ff5577 100%)',
              boxShadow: '0 12px 40px rgba(255,51,102,0.5)',
              transform: 'scale(1.05)',
            },
          }}
        >
          <AddIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
        </Fab>
      </Zoom>
    </PageLayout>
  );
}
