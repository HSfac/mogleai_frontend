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
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PageLayout from '@/components/PageLayout';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { characterService } from '@/services/character.service';
import { Character } from '@/types/character';

const popularSearches = ['연애', '직장', '상담', '판타지', '게임', '학교'];

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
        .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase())),
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

  const displayResults = useMemo(() => {
    return filtered;
  }, [filtered]);

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* 헤더 섹션 */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h3"
            fontWeight={800}
            gutterBottom
            sx={{
              color: 'text.primary',
              fontSize: { xs: '2rem', md: '3rem' },
              mb: 2
            }}
          >
            캐릭터 검색
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
          >
            수천 개의 캐릭터 중에서 마음에 드는 캐릭터를 찾아보세요
          </Typography>
        </Box>

        {/* 검색 박스 */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mb: 4,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 2,
            }
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="캐릭터 이름, 태그, 설명으로 검색..."
              fullWidth
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'background.default',
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { fontSize: '1.1rem', py: 1 }
              }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                height: 56,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
              onClick={handleSearch}
            >
              검색
            </Button>
          </Stack>

          {recentSearches.length > 0 && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '0.95rem'
                }}
              >
                최근 검색
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {recentSearches.map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    size="medium"
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch();
                    }}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 500,
                      bgcolor: 'action.selected',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* 인기 검색어 */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              🔥 인기 검색어
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {popularSearches.map((term, index) => (
              <Chip
                key={term}
                label={`${index + 1}. ${term}`}
                size="medium"
                variant="outlined"
                onClick={() => {
                  setSearchQuery(term);
                  handleSearch();
                }}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 500,
                  borderWidth: 2,
                  '&:hover': {
                    bgcolor: 'primary.main',
                    borderColor: 'primary.main',
                    color: 'primary.contrastText',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* 탭 */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                py: 2,
              }
            }}
          >
            <Tab label="전체 캐릭터" />
            <Tab label="인기 캐릭터" />
          </Tabs>
        </Paper>

        {/* 검색 결과 */}
        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={10}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
              캐릭터를 검색하고 있습니다...
            </Typography>
          </Box>
        ) : displayResults.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              p: 8,
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="h5" fontWeight={600} color="text.secondary" gutterBottom>
              😕 검색 결과가 없습니다
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              다른 키워드로 다시 시도해보세요
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary">
                총 <strong style={{ color: 'var(--mui-palette-text-primary)' }}>{displayResults.length}개</strong>의 캐릭터를 찾았습니다
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {displayResults.map((character) => (
                <Grid item xs={12} sm={6} md={4} key={character._id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6,
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => router.push(`/characters/${character._id}`)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
                        <Avatar
                          src={character.profileImage}
                          sx={{
                            width: 64,
                            height: 64,
                            border: '3px solid',
                            borderColor: 'background.paper',
                            boxShadow: 2,
                          }}
                        >
                          {character.name.charAt(0)}
                        </Avatar>
                        <Box flex={1} minWidth={0}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              sx={{
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
                                  bgcolor: 'rgba(244, 67, 54, 0.15)',
                                  color: 'error.main',
                                  fontWeight: 700,
                                  fontSize: '0.65rem',
                                  height: 20,
                                  border: '1px solid',
                                  borderColor: 'error.light',
                                }}
                              />
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            @{character.creator?.username || '알 수 없음'}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 40,
                          lineHeight: 1.5,
                        }}
                      >
                        {character.description}
                      </Typography>

                      {character.tags && character.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={2} useFlexGap>
                          {character.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                bgcolor: 'action.selected',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            />
                          ))}
                          {character.tags.length > 3 && (
                            <Chip
                              label={`+${character.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </Stack>
                      )}

                      <Stack
                        direction="row"
                        spacing={3}
                        alignItems="center"
                        sx={{
                          pt: 2,
                          borderTop: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <FavoriteIcon sx={{ fontSize: 18, color: 'error.main' }} />
                          <Typography variant="body2" fontWeight={600}>
                            {character.likes || 0}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <ChatBubbleIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight={600}>
                            {character.usageCount || 0}
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
      </Container>
    </PageLayout>
  );
}
