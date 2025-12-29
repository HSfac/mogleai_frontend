'use client';

import { useEffect, useState } from 'react';
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
  CircularProgress,
  IconButton,
  Tab,
  Tabs,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
import VerifiedIcon from '@mui/icons-material/Verified';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { characterService } from '@/services/character.service';
import { api } from '@/lib/api';

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

export default function CharactersPage() {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [characters, setCharacters] = useState<Character[]>([]);
  const [popularCharacters, setPopularCharacters] = useState<Character[]>([]);
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
      window.location.href = '/login?redirect=/characters';
      return;
    }

    try {
      if (favorites.includes(characterId)) {
        await api.delete(`/users/favorites/${characterId}`);
        setFavorites(favorites.filter((id) => id !== characterId));
      } else {
        await api.post(`/users/favorites/${characterId}`);
        setFavorites([...favorites, characterId]);
      }
    } catch (error) {
      console.error('즐겨찾기 실패:', error);
    }
  };

  const displayedCharacters =
    tabValue === 'recommend' ? characters : popularCharacters;

  return (
    <PageLayout>
      {/* Hero Section - 모바일 최적화 */}
      <Box
        sx={{
          background: '#0a0a0a',
          pt: { xs: 3, sm: 5, md: 8 },
          pb: { xs: 3, sm: 5, md: 8 },
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 900,
              color: '#fff',
              mb: { xs: 1, md: 2 },
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
            }}
          >
            신작 캐릭터 발견
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: '#999',
              mb: { xs: 3, md: 5 },
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
            }}
          >
            매일 새로운 AI 캐릭터를 만나보세요
          </Typography>

          {/* Search Bar - 모바일 컴팩트 디자인 */}
          <Box
            sx={{
              maxWidth: 800,
              mx: 'auto',
              bgcolor: '#1a1a1a',
              borderRadius: { xs: 2, md: 3 },
              p: { xs: 1.5, md: 2 },
              border: '1px solid #333'
            }}
          >
            <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
              <TextField
                fullWidth
                placeholder="캐릭터 검색..."
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
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0a0a0a',
                    borderRadius: { xs: 1.5, md: 2 },
                    color: '#fff',
                    height: { xs: 44, md: 56 },
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                    '&.Mui-focused fieldset': { borderColor: '#ff3366', borderWidth: 2 },
                  },
                  '& input': {
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    '&::placeholder': { color: '#666' },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  minWidth: { xs: 44, sm: 80, md: 100 },
                  height: { xs: 44, md: 56 },
                  px: { xs: 1.5, sm: 3, md: 4 },
                  whiteSpace: 'nowrap',
                  bgcolor: '#ff3366',
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  borderRadius: { xs: 1.5, md: 2 },
                  '&:hover': { bgcolor: '#e62958' },
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>검색</Box>
                <SearchIcon sx={{ display: { xs: 'block', sm: 'none' }, fontSize: 20 }} />
              </Button>
            </Stack>
          </Box>

          {/* Tags - 모바일 가로 스크롤 */}
          <Box
            sx={{
              mt: { xs: 2, md: 4 },
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
              {selectedTags.length > 0
                ? selectedTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      onClick={() => handleTagClick(tag)}
                      sx={{
                        bgcolor: '#ff3366',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        height: { xs: 28, md: 32 },
                        '&:hover': { bgcolor: '#e62958' },
                      }}
                    />
                  ))
                : defaultTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => handleTagClick(tag)}
                      sx={{
                        bgcolor: '#1a1a1a',
                        color: '#999',
                        border: '1px solid #333',
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        height: { xs: 28, md: 32 },
                        '&:hover': { borderColor: '#ff3366', color: '#fff', bgcolor: '#2a2a2a' },
                      }}
                    />
                  ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* 메인 콘텐츠 영역 - 모바일 최적화 */}
      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', py: { xs: 3, md: 6 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Tabs - 모바일 스타일 개선 */}
          <Box sx={{ borderBottom: 1, borderColor: '#1a1a1a', mb: { xs: 2, md: 4 } }}>
            <Tabs
              value={tabValue}
              onChange={(_, value) => setTabValue(value)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: 700,
                  textTransform: 'none',
                  minWidth: { xs: 'auto', md: 120 },
                  py: { xs: 1.5, md: 2 },
                  color: '#666',
                },
                '& .Mui-selected': { color: '#fff' },
                '& .MuiTabs-indicator': { bgcolor: '#ff3366', height: 3 },
              }}
            >
              <Tab label="추천 순" value="recommend" />
              <Tab label="인기 순" value="popular" />
            </Tabs>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={{ xs: 4, md: 8 }}>
              <CircularProgress sx={{ color: '#ff3366' }} size={32} />
            </Box>
          ) : (
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {displayedCharacters.map((character) => (
                <Grid item xs={6} sm={6} md={4} key={character._id}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: '#1a1a1a',
                      borderRadius: { xs: 2, md: 3 },
                      border: '1px solid #2a2a2a',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      WebkitTapHighlightColor: 'transparent',
                      '&:hover': {
                        transform: { xs: 'none', md: 'translateY(-8px)' },
                        borderColor: '#ff3366',
                        boxShadow: { xs: 'none', md: '0 12px 32px rgba(255, 51, 102, 0.2)' },
                      },
                      '&:active': {
                        transform: { xs: 'scale(0.98)', md: 'translateY(-8px)' },
                        bgcolor: '#222',
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                      {/* 헤더: 이름 + 즐겨찾기 */}
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={{ xs: 1, md: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="#fff"
                            sx={{
                              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
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
                                bgcolor: 'rgba(244, 67, 54, 0.2)',
                                color: '#f44336',
                                fontWeight: 700,
                                fontSize: { xs: '0.55rem', md: '0.65rem' },
                                height: { xs: 16, md: 20 },
                                border: '1px solid rgba(244, 67, 54, 0.5)',
                                '& .MuiChip-label': { px: { xs: 0.5, md: 1 } },
                              }}
                            />
                          )}
                        </Stack>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(character._id);
                          }}
                          sx={{
                            p: { xs: 0.5, md: 1 },
                            ml: 0.5,
                          }}
                        >
                          <FavoriteIcon
                            sx={{
                              fontSize: { xs: 16, md: 20 },
                              color: favorites.includes(character._id) ? '#ff3366' : '#666',
                            }}
                          />
                        </IconButton>
                      </Box>

                      {/* 설명 */}
                      <Typography
                        variant="body2"
                        color="#999"
                        sx={{
                          mb: { xs: 1, md: 2 },
                          height: { xs: 32, md: 40 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          lineHeight: 1.4,
                        }}
                      >
                        {character.description || '설명이 없습니다.'}
                      </Typography>

                      {/* 태그 - 모바일에서 2개까지만 표시 */}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        mb={{ xs: 1, md: 2 }}
                        sx={{
                          overflow: 'hidden',
                        }}
                      >
                        {character.tags?.slice(0, isMobile ? 2 : 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: '#2a2a2a',
                              color: '#ff3366',
                              fontWeight: 600,
                              border: 'none',
                              fontSize: { xs: '0.65rem', md: '0.75rem' },
                              height: { xs: 20, md: 24 },
                              '& .MuiChip-label': { px: { xs: 0.75, md: 1 } },
                            }}
                          />
                        ))}
                      </Stack>

                      {/* 푸터: 크리에이터 + 통계 */}
                      <Box
                        sx={{
                          pt: { xs: 1, md: 2 },
                          borderTop: '1px solid #2a2a2a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="#666"
                          fontWeight={600}
                          sx={{
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: { xs: '45%', md: '50%' },
                          }}
                        >
                          by {character.creator?.username || '크리에이터'}
                        </Typography>
                        <Stack direction="row" spacing={{ xs: 1, md: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={0.25}>
                            <FavoriteIcon sx={{ fontSize: { xs: 12, md: 16 }, color: '#666' }} />
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="#999"
                              sx={{ fontSize: { xs: '0.65rem', md: '0.875rem' } }}
                            >
                              {character.likes}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.25}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: { xs: 12, md: 16 }, color: '#666' }} />
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="#999"
                              sx={{ fontSize: { xs: '0.65rem', md: '0.875rem' } }}
                            >
                              {character.usageCount}
                            </Typography>
                          </Stack>
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
    </PageLayout>
  );
}
