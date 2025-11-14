'use client';

import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PageLayout from '@/components/PageLayout';
import { useEffect, useMemo, useState } from 'react';

const dummyCharacters = [
  {
    _id: '1',
    name: '비비',
    description: '베이비챗 고객 상담을 담당하는 친절한 캐릭터입니다.',
    profileImage: '/images/characters/bibi.jpg',
    creator: { username: '베이비챗' },
    tags: ['고객', '친절', '상담'],
    likes: 443,
    usageCount: 1200,
  },
  {
    _id: '2',
    name: '일진 윤아',
    description: '고등학교 학생과 패셔니스타로 알려진 윤아입니다.',
    profileImage: '/images/characters/yoona.jpg',
    creator: { username: '베이비챗' },
    tags: ['일진', '학교', '카리스마'],
    likes: 829,
    usageCount: 1870,
  },
  {
    _id: '3',
    name: '헬스 트레이너 현우',
    description: '운동과 식단에 강점이 있는 헬스 트레이너 캐릭터입니다.',
    profileImage: '/images/characters/hyunwoo.jpg',
    creator: { username: '베이비챗' },
    tags: ['헬스', '운동', '식단'],
    likes: 215,
    usageCount: 900,
  },
];

const popularSearches = ['연애', '직장', '상담', '판타지', '게임', '학교'];
const categories = ['일상', '판타지', '코칭', '게임', '상담', '직장'];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState(dummyCharacters);
  const [tabValue, setTabValue] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return results;
    return results.filter((character) =>
      [character.name, character.description, ...(character.tags || [])]
        .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [searchQuery, results]);

  const handleSearch = () => {
    const term = searchQuery.trim();
    if (!term) return;
    if (!recentSearches.includes(term)) {
      const next = [term, ...recentSearches].slice(0, 4);
      setRecentSearches(next);
      localStorage.setItem('recentSearches', JSON.stringify(next));
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setTabValue(value);
  };

  const displayResults = useMemo(() => {
    if (tabValue === 1) return filtered.filter((character) => character.likes >= 400);
    if (tabValue === 2) return filtered.filter((character) => character.tags?.includes('판타지'));
    return filtered;
  }, [tabValue, filtered]);

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card
          sx={{
            borderRadius: 28,
            px: { xs: 3, md: 4 },
            py: { xs: 3, md: 4 },
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,95,155,0.95), rgba(255,214,227,0.95))',
            color: '#fff',
            boxShadow: '0 25px 55px rgba(255, 95, 155, 0.25)',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            캐릭터 검색
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
            마음에 드는 캐릭터를 태그나 키워드로 찾아보세요. 최근 검색어는 자동 저장됩니다.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="예: 직장인, 고민 상담, RPG 캐릭터"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#ff5f9b' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchQuery('')}>
                      <CloseIcon sx={{ color: '#ff5f9b' }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 999, background: '#fff' },
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: 999, px: 6 }}
              onClick={handleSearch}
            >
              검색하기
            </Button>
          </Stack>
          <Box mt={3}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              최근 검색
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {recentSearches.map((term) => (
                <Chip
                  key={term}
                  label={term}
                  variant="outlined"
                  sx={{ borderColor: '#ffc0db', color: '#c3006e' }}
                  onClick={() => setSearchQuery(term)}
                />
              ))}
            </Stack>
          </Box>
        </Card>

        <Stack spacing={2} mb={3}>
          <Typography variant="subtitle1" fontWeight={600}>
            인기 검색어
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {popularSearches.map((term) => (
              <Chip
                key={term}
                label={term}
                variant="outlined"
                onClick={() => setSearchQuery(term)}
                sx={{ borderColor: '#ffc0db', color: '#c3006e' }}
              />
            ))}
          </Stack>
        </Stack>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ mb: 2 }}
        >
          <Tab label="전체" />
          <Tab label="인기" />
          <Tab label="판타지" />
        </Tabs>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: '#ff5f9b' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {displayResults.map((character) => (
              <Grid item xs={12} sm={6} md={4} key={character._id}>
                <Card
                  sx={{
                    borderRadius: 22,
                    border: '1px solid rgba(255, 95, 155, 0.25)',
                    boxShadow: '0 12px 35px rgba(15,23,42,0.08)',
                  }}
                  onClick={() => router.push(`/characters/${character._id}`)}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={character.profileImage} sx={{ bgcolor: '#ffe4f5', color: '#c3006e' }}>
                        {character.name.slice(0, 1)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {character.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                          {character.description}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
                      {(character.tags || []).slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" mt={2}>
                      <Chip label={`${character.likes} 좋아요`} size="small" sx={{ borderColor: '#ffc0db', color: '#c3006e' }} />
                      <Chip label={`${character.usageCount} 대화`} size="small" />
                      <IconButton size="small">
                        <ArrowForwardIosIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {displayResults.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ textAlign: 'center', p: 4, borderRadius: 20 }}>
                  <Typography variant="body2" color="text.secondary">
                    검색 결과가 없습니다. 다른 키워드로 시도해보세요.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </PageLayout>
  );
}
