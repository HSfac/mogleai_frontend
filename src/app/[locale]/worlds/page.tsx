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
  CircularProgress,
  Tab,
  Tabs,
  CardMedia,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PublicIcon from '@mui/icons-material/Public';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { worldService } from '@/services/worldService';
import { World } from '@/types/world';

const defaultTags = ['판타지', '현대', '로맨스', 'SF', '역사', '학원'];

export default function WorldsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [popularWorlds, setPopularWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState<'all' | 'popular' | 'my'>('all');

  useEffect(() => {
    loadWorlds();
    loadPopularWorlds();
  }, []);

  const loadWorlds = async () => {
    setLoading(true);
    try {
      const data = await worldService.getWorlds();
      setWorlds(data.worlds || data);
    } catch (error) {
      console.error('세계관 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularWorlds = async () => {
    try {
      const data = await worldService.getPopularWorlds(10);
      setPopularWorlds(data);
    } catch (error) {
      console.error('인기 세계관을 불러오는데 실패했습니다:', error);
    }
  };

  const loadMyWorlds = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/worlds');
      return;
    }
    setLoading(true);
    try {
      const data = await worldService.getMyWorlds();
      setWorlds(data);
    } catch (error) {
      console.error('내 세계관을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await worldService.getWorlds({
        search: searchQuery,
        tags: selectedTags,
      });
      setWorlds(data.worlds || data);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'all' | 'popular' | 'my') => {
    setTabValue(newValue);
    if (newValue === 'all') {
      loadWorlds();
    } else if (newValue === 'popular') {
      setWorlds(popularWorlds);
    } else if (newValue === 'my') {
      loadMyWorlds();
    }
  };

  const handleLike = async (worldId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login?redirect=/worlds');
      return;
    }
    try {
      await worldService.likeWorld(worldId);
      // 좋아요 수 업데이트
      setWorlds((prev) =>
        prev.map((w) => (w._id === worldId ? { ...w, likes: w.likes + 1 } : w))
      );
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const displayedWorlds = tabValue === 'popular' ? popularWorlds : worlds;

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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: '#fff',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              세계관 탐색
            </Typography>
            {isAuthenticated && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/worlds/create')}
                sx={{
                  bgcolor: '#ff3366',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#e62958' },
                }}
              >
                세계관 만들기
              </Button>
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: '#999',
              mb: 5,
              maxWidth: 600,
              fontWeight: 400,
            }}
          >
            다양한 세계관을 탐색하고 캐릭터에 적용해보세요
          </Typography>

          {/* Search Bar */}
          <Box
            sx={{
              maxWidth: 800,
              mx: 'auto',
              bgcolor: '#1a1a1a',
              borderRadius: 3,
              p: 2,
              border: '1px solid #333',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="세계관 이름이나 설명으로 검색하세요..."
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
              onChange={handleTabChange}
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
              <Tab label="전체" value="all" />
              <Tab label="인기" value="popular" />
              {isAuthenticated && <Tab label="내 세계관" value="my" />}
            </Tabs>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: '#ff3366' }} />
            </Box>
          ) : displayedWorlds.length === 0 ? (
            <Box textAlign="center" py={8}>
              <PublicIcon sx={{ fontSize: 64, color: '#333', mb: 2 }} />
              <Typography variant="h6" color="#666">
                {tabValue === 'my' ? '아직 만든 세계관이 없습니다.' : '세계관이 없습니다.'}
              </Typography>
              {tabValue === 'my' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/worlds/create')}
                  sx={{
                    mt: 2,
                    bgcolor: '#ff3366',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#e62958' },
                  }}
                >
                  첫 세계관 만들기
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {displayedWorlds.map((world) => (
                <Grid item xs={12} sm={6} md={4} key={world._id}>
                  <Card
                    onClick={() => router.push(`/worlds/${world._id}`)}
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
                    {world.coverImage && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={world.coverImage}
                        alt={world.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" fontWeight={700} color="#fff">
                          {world.name}
                        </Typography>
                        {world.isAdultContent && (
                          <Chip
                            label="19+"
                            size="small"
                            sx={{
                              bgcolor: '#ff3366',
                              color: '#fff',
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        )}
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
                        {world.description}
                      </Typography>

                      {world.setting && (
                        <Typography
                          variant="caption"
                          color="#666"
                          sx={{
                            display: 'block',
                            mb: 2,
                            fontStyle: 'italic',
                          }}
                        >
                          {world.setting}
                        </Typography>
                      )}

                      <Stack direction="row" spacing={1} flexWrap="wrap" mb={2} sx={{ gap: 0.5 }}>
                        {world.tags?.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: '#2a2a2a',
                              color: '#ff3366',
                              fontWeight: 600,
                              border: 'none',
                              fontSize: '0.7rem',
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
                          by {world.creator?.username || '크리에이터'}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            onClick={(e) => handleLike(world._id, e)}
                            sx={{ cursor: 'pointer', '&:hover': { color: '#ff3366' } }}
                          >
                            <FavoriteIcon sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" fontWeight={700} color="#999">
                              {world.likes}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <GroupIcon sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" fontWeight={700} color="#999">
                              {world.characterCount}
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
