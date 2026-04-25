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
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import TuneIcon from '@mui/icons-material/Tune';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PageLayout from '@/components/PageLayout';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { characterService } from '@/services/character.service';
import { Character } from '@/types/character';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

const popularSearches = ['연애', '직장', '상담', '판타지', '게임', '학교'];

const CARD_SX = {
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(18,22,34,0.78)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
} as const;

export default function SearchPage() {
  const router = useRouter();
  const { getLocalePath } = useLocaleNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setIsLoading(true);
      const data = await characterService.getCharacters();
      setCharacters(data);
    } catch (error) {
      console.error('캐릭터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return characters;
    return characters.filter((character) =>
      [character.name, character.description, ...(character.tags || [])]
        .some((value) => (value || '').toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [searchQuery, characters]);

  const handleSearch = async () => {
    const term = searchQuery.trim();
    if (!term) {
      loadCharacters();
      return;
    }

    if (!recentSearches.includes(term)) {
      const next = [term, ...recentSearches].slice(0, 5);
      setRecentSearches(next);
      localStorage.setItem('recentSearches', JSON.stringify(next));
    }

    try {
      setIsLoading(true);
      const data = await characterService.getCharacters(term);
      setCharacters(data);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = async (_: React.SyntheticEvent, value: number) => {
    setTabValue(value);
    try {
      setIsLoading(true);
      if (value === 1) {
        const data = await characterService.getPopularCharacters();
        setCharacters(data);
      } else {
        const data = await characterService.getCharacters();
        setCharacters(data);
      }
    } catch (error) {
      console.error('탭 변경 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = recentSearches.filter((s) => s !== term);
    setRecentSearches(next);
    localStorage.setItem('recentSearches', JSON.stringify(next));
  };

  return (
    <PageLayout>
      {/* Hero search area */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 5, md: 7 },
          pb: { xs: 4, md: 6 },
          px: 3,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,95,155,0.12) 0%, transparent 70%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.8rem' },
                color: '#f6f7fb',
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              캐릭터 검색
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(240,242,250,0.5)', lineHeight: 1.8 }}>
              수천 개의 캐릭터 중에서 마음에 드는 캐릭터를 찾아보세요
            </Typography>
          </Box>

          {/* Search input */}
          <Box
            sx={{
              borderRadius: '18px',
              border: `1.5px solid ${isFocused ? 'rgba(255,95,155,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: 'rgba(18,22,34,0.88)',
              backdropFilter: 'blur(20px)',
              boxShadow: isFocused
                ? '0 0 0 4px rgba(255,95,155,0.1), 0 16px 40px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.28)',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0}>
              <Box sx={{ pl: 2.5, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <SearchIcon sx={{ color: isFocused ? '#ff5f9b' : 'rgba(240,242,250,0.4)', fontSize: 24, transition: 'color 0.2s' }} />
              </Box>
              <TextField
                placeholder="캐릭터 이름, 태그, 설명으로 검색..."
                fullWidth
                variant="standard"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                sx={{
                  '& .MuiInput-root': {
                    color: '#f6f7fb',
                    fontSize: '1.05rem',
                    fontWeight: 500,
                    px: 2,
                    py: 2,
                    '&:before': { display: 'none' },
                    '&:after': { display: 'none' },
                  },
                  '& .MuiInput-input::placeholder': {
                    color: 'rgba(240,242,250,0.35)',
                    opacity: 1,
                  },
                }}
                InputProps={{
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        sx={{ color: 'rgba(240,242,250,0.4)', mr: 1, '&:hover': { color: '#f6f7fb' } }}
                      >
                        <CloseIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  m: 1.2,
                  px: 3,
                  py: 1.4,
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  bgcolor: '#ff5f9b',
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(255,95,155,0.3)',
                  '&:hover': { bgcolor: '#e84e8a', boxShadow: '0 4px 24px rgba(255,95,155,0.45)' },
                }}
              >
                검색
              </Button>
            </Stack>
          </Box>

          {/* Recent + Popular searches */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 3 }}>
            {recentSearches.length > 0 && (
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.8} mb={1.5}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: 'rgba(240,242,250,0.36)' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.4)', fontWeight: 700, letterSpacing: 0.5 }}>
                    최근 검색
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                  {recentSearches.map((term) => (
                    <Chip
                      key={term}
                      label={term}
                      size="small"
                      onClick={() => { setSearchQuery(term); handleSearch(); }}
                      onDelete={(e) => removeRecentSearch(term, e)}
                      deleteIcon={<CloseIcon sx={{ fontSize: '12px !important' }} />}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.07)',
                        color: 'rgba(240,242,250,0.72)',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        '& .MuiChip-deleteIcon': { color: 'rgba(240,242,250,0.35)', '&:hover': { color: '#f6f7fb' } },
                        '&:hover': { bgcolor: 'rgba(255,95,155,0.12)', borderColor: 'rgba(255,95,155,0.3)', color: '#ff9ec2' },
                        transition: 'all 0.15s ease',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.8} mb={1.5}>
                <WhatshotIcon sx={{ fontSize: 14, color: '#ff5f9b' }} />
                <Typography variant="caption" sx={{ color: 'rgba(240,242,250,0.4)', fontWeight: 700, letterSpacing: 0.5 }}>
                  인기 검색어
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {popularSearches.map((term, index) => (
                  <Chip
                    key={term}
                    label={`${index + 1}. ${term}`}
                    size="small"
                    onClick={() => { setSearchQuery(term); handleSearch(); }}
                    sx={{
                      bgcolor: alpha('#ff5f9b', 0.08),
                      color: 'rgba(240,242,250,0.65)',
                      fontWeight: 600,
                      border: '1px solid rgba(255,95,155,0.15)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha('#ff5f9b', 0.18), color: '#ff9ec2', borderColor: 'rgba(255,95,155,0.35)' },
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        {/* Tabs */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box
            sx={{
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(18,22,34,0.78)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
              display: 'inline-flex',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                minHeight: 44,
                px: 0.5,
                py: 0.5,
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: 'rgba(240,242,250,0.5)',
                  minHeight: 36,
                  px: 2.5,
                  borderRadius: '10px',
                  transition: 'all 0.18s ease',
                  '&.Mui-selected': {
                    color: '#f6f7fb',
                    bgcolor: 'rgba(255,95,155,0.18)',
                  },
                },
              }}
            >
              <Tab label="전체 캐릭터" />
              <Tab label="인기 캐릭터" />
            </Tabs>
          </Box>

          {!isLoading && characters.length > 0 && (
            <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.4)', fontWeight: 600 }}>
              {filtered.length.toLocaleString()}개
            </Typography>
          )}
        </Stack>

        {/* Results */}
        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={12}>
            <CircularProgress size={44} thickness={3} sx={{ color: '#ff5f9b' }} />
            <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.4)', mt: 2.5 }}>
              캐릭터를 불러오는 중...
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              px: 4,
              borderRadius: '20px',
              border: '1px dashed rgba(255,255,255,0.1)',
              background: 'rgba(18,22,34,0.5)',
            }}
          >
            <Typography variant="h2" sx={{ mb: 2, lineHeight: 1 }}>😕</Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#f6f7fb', mb: 1 }}>
              검색 결과가 없습니다
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(240,242,250,0.45)' }}>
              다른 키워드로 다시 시도해보세요
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map((character) => (
              <Grid item xs={12} sm={6} md={4} key={character._id}>
                <Card
                  onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                  sx={{
                    ...CARD_SX,
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: 'rgba(255,95,155,0.35)',
                      boxShadow: '0 16px 48px rgba(255,95,155,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Character header */}
                    <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
                      <Avatar
                        src={character.profileImage}
                        sx={{
                          width: 56,
                          height: 56,
                          border: '2px solid rgba(255,255,255,0.1)',
                          flexShrink: 0,
                          fontSize: '1.3rem',
                          bgcolor: 'rgba(255,95,155,0.2)',
                          color: '#ff5f9b',
                        }}
                      >
                        {character.name.charAt(0)}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Stack direction="row" alignItems="center" spacing={0.8} mb={0.4}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{
                              color: '#f6f7fb',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              lineHeight: 1.3,
                            }}
                          >
                            {character.name}
                          </Typography>
                          {character.isAdultContent && (
                            <Chip
                              label="19+"
                              size="small"
                              sx={{
                                bgcolor: 'rgba(244,67,54,0.12)',
                                color: '#ef5350',
                                fontWeight: 800,
                                fontSize: '0.62rem',
                                height: 18,
                                border: '1px solid rgba(244,67,54,0.2)',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(240,242,250,0.4)',
                            fontWeight: 500,
                            cursor: character.creator?._id ? 'pointer' : 'default',
                            '&:hover': character.creator?._id ? { color: '#ff9ec2' } : undefined,
                            transition: 'color 0.15s',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (character.creator?._id) {
                              router.push(getLocalePath(`/creators/${character.creator._id}`));
                            }
                          }}
                        >
                          @{character.creator?.username || '알 수 없음'}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(240,242,250,0.55)',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.65,
                        flex: 1,
                      }}
                    >
                      {character.description}
                    </Typography>

                    {/* Tags */}
                    {character.tags && character.tags.length > 0 && (
                      <Stack direction="row" spacing={0.6} flexWrap="wrap" mb={2} useFlexGap>
                        {character.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.06)',
                              color: 'rgba(240,242,250,0.58)',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 22,
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          />
                        ))}
                        {character.tags.length > 3 && (
                          <Chip
                            label={`+${character.tags.length - 3}`}
                            size="small"
                            sx={{
                              bgcolor: 'transparent',
                              color: 'rgba(240,242,250,0.36)',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        )}
                      </Stack>
                    )}

                    {/* Stats */}
                    <Stack
                      direction="row"
                      spacing={2.5}
                      alignItems="center"
                      sx={{
                        pt: 2,
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <FavoriteIcon sx={{ fontSize: 15, color: '#ff5f9b' }} />
                        <Typography variant="caption" fontWeight={700} sx={{ color: 'rgba(240,242,250,0.6)' }}>
                          {(character.likes || 0).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <ChatBubbleIcon sx={{ fontSize: 15, color: '#7cc7ff' }} />
                        <Typography variant="caption" fontWeight={700} sx={{ color: 'rgba(240,242,250,0.6)' }}>
                          {(character.usageCount || 0).toLocaleString()}
                        </Typography>
                      </Stack>
                    </Stack>
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
