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
import { fetchCharacters } from '@/services/characterService';
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
      const data = await fetchCharacters();
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
          background: '#fff',
          pt: { xs: 6, md: 8 },
          pb: { xs: 6, md: 8 },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            완벽한 AI 캐릭터 찾기
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: 'text.secondary',
              mb: 5,
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
            }}
          >
            수천 개의 캐릭터 중에서 나에게 꼭 맞는 친구를 만나보세요
          </Typography>

          {/* Search Bar */}
          <Box
            sx={{
              maxWidth: 800,
              mx: 'auto',
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
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
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'text.secondary',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                sx={{
                  px: 4,
                  whiteSpace: 'nowrap',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                검색
              </Button>
            </Stack>
          </Box>

          {/* Tags */}
          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            justifyContent="center"
            mt={4}
            sx={{ gap: 1 }}
          >
            {selectedTags.length > 0
              ? selectedTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    onClick={() => handleTagClick(tag)}
                    sx={{
                      bgcolor: 'primary.main',
                      color: '#fff',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  />
                ))
              : defaultTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagClick(tag)}
                    variant="outlined"
                    sx={{
                      borderColor: 'divider',
                      color: 'text.secondary',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: 'text.secondary',
                        bgcolor: '#f8f9fa',
                      },
                    }}
                  />
                ))}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={(_, value) => setTabValue(value)}
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 120,
              },
            }}
          >
            <Tab label="추천 순" value="recommend" />
            <Tab label="인기 순" value="popular" />
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {displayedCharacters.map((character) => (
              <Grid item xs={12} sm={6} md={4} key={character._id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 1,
                    border: 'none',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      mb={2}
                    >
                      <Typography variant="h6" fontWeight={700}>
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
                          sx={{
                            color: favorites.includes(character._id)
                              ? '#f5576c'
                              : '#e0e0e0',
                          }}
                        />
                      </IconButton>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
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

                    <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                      {character.tags?.slice(0, 3).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontWeight: 500,
                            border: 'none',
                          }}
                        />
                      ))}
                    </Stack>

                    <Box
                      sx={{
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        by {character.creator?.username || '크리에이터'}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <FavoriteIcon sx={{ fontSize: 16, color: '#f5576c' }} />
                          <Typography variant="body2" fontWeight={600}>
                            {character.likes}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight={600}>
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
    </PageLayout>
  );
}
