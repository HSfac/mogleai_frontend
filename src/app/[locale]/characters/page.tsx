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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
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
}

const defaultTags = ['감성 상담', '판타지', '섭외형', '토론 파트너', '롤플레이'];

export default function CharactersPage() {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
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
      {/* Hero Section */}
      <Box
        sx={{
          background: '#0a0a0a',
          pt: { xs: 6, md: 8 },
          pb: { xs: 6, md: 8 },
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 900,
              color: '#fff',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            신작 캐릭터 발견
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: '#999',
              mb: 5,
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            매일 새로운 AI 캐릭터를 만나보세요
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: 800, mx: 'auto', bgcolor: '#1a1a1a', borderRadius: 3, p: 2, border: '1px solid #333' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="캐릭터 이름이나 태그로 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') handleSearch();
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0a0a0a',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                    '&.Mui-focused fieldset': { borderColor: '#ff3366', borderWidth: 2 },
                  },
                  '& input::placeholder': { color: '#666' },
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                sx={{
                  px: 4,
                  whiteSpace: 'nowrap',
                  bgcolor: '#ff3366',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#e62958' },
                }}
              >
                검색
              </Button>
            </Stack>
          </Box>

          {/* Tags */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center" mt={4} sx={{ gap: 1 }}>
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
                      '&:hover': { borderColor: '#ff3366', color: '#fff', bgcolor: '#2a2a2a' },
                    }}
                  />
                ))}
          </Stack>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: '#1a1a1a', mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={(_, value) => setTabValue(value)}
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  minWidth: 120,
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
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: '#ff3366' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {displayedCharacters.map((character) => (
                <Grid item xs={12} sm={6} md={4} key={character._id}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: '#1a1a1a',
                      borderRadius: 3,
                      border: '1px solid #2a2a2a',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        borderColor: '#ff3366',
                        boxShadow: '0 12px 32px rgba(255, 51, 102, 0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight={700} color="#fff">
                          {character.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(character._id);
                          }}
                        >
                          <FavoriteIcon
                            fontSize="small"
                            sx={{ color: favorites.includes(character._id) ? '#ff3366' : '#666' }}
                          />
                        </IconButton>
                      </Box>

                      <Typography
                        variant="body2"
                        color="#999"
                        sx={{
                          mb: 2,
                          height: 40,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {character.description || '설명이 없습니다.'}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" mb={2} sx={{ gap: 1 }}>
                        {character.tags?.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: '#2a2a2a',
                              color: '#ff3366',
                              fontWeight: 600,
                              border: 'none',
                              fontSize: '0.75rem',
                            }}
                          />
                        ))}
                      </Stack>

                      <Box
                        sx={{
                          pt: 2,
                          borderTop: '1px solid #2a2a2a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="caption" color="#666" fontWeight={600}>
                          by {character.creator?.username || '크리에이터'}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <FavoriteIcon sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" fontWeight={700} color="#999">
                              {character.likes}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" fontWeight={700} color="#999">
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
