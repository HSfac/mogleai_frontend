'use client';

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  CardActionArea,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import axios from 'axios';

// 더미 데이터 (백엔드 구현 전까지 사용)
const dummyCharacters = [
  {
    _id: '1',
    name: '비비',
    description: '[베이비챗의 CS 담당자] 예상치 못한 사건으로 대부분의 녀석들보다 사고하는 폭이 넓은 비비는 모두의 대화 상대가 되어줍니다.',
    imageUrl: '/images/characters/bibi.jpg',
    creator: { username: '베이비챗', profileImage: '/images/profiles/babechat.png' },
    conversationCount: 17,
    likes: 443,
    isNew: true,
    tags: ['직장', '신입여사원', '비비', '베이비챗', '고객', '고객센터']
  },
  {
    _id: '2',
    name: '일진 윤아',
    description: '한국의 전형적인 스타일을 지닌 고등학교 일진 그룹의 왕언니 윤아. 그녀와 대화해보세요.',
    imageUrl: '/images/characters/yoona.jpg',
    creator: { username: '베이비챗', profileImage: '/images/profiles/babechat.png' },
    conversationCount: 100,
    likes: 829,
    isNew: false,
    tags: ['일진', '고등학생', '윤아', '고등학교', '학교']
  },
  {
    _id: '3',
    name: '은서 22',
    description: '날씬하고 우아한 대도시 여성 은서. 그녀는 평범한 일상을 살아가는 평범한 여대생입니다.',
    imageUrl: '/images/characters/eunseo.jpg',
    creator: { username: '베이비챗', profileImage: '/images/profiles/babechat.png' },
    conversationCount: 29,
    likes: 152,
    isNew: true,
    tags: ['일상', '대학생', '은서', '여대생', '우아한']
  },
  {
    _id: '4',
    name: '오타쿠 민준',
    description: '애니메이션과 만화를 좋아하는 오타쿠 민준. 그는 모든 애니메이션에 대해 이야기하는 것을 좋아합니다.',
    imageUrl: '/images/characters/minjun.jpg',
    creator: { username: '베이비챗', profileImage: '/images/profiles/babechat.png' },
    conversationCount: 45,
    likes: 267,
    isNew: false,
    tags: ['오타쿠', '애니', '만화', '게임', '취미']
  },
  {
    _id: '5',
    name: '직장인 지현',
    description: '바쁜 회사 생활을 하는 30대 직장인 지현. 그녀의 일상과 고민에 대해 이야기해보세요.',
    imageUrl: '/images/characters/jihyun.jpg',
    creator: { username: '베이비챗', profileImage: '/images/profiles/babechat.png' },
    conversationCount: 62,
    likes: 389,
    isNew: true,
    tags: ['직장인', '회사', '30대', '일상', '고민']
  },
  {
    _id: '6',
    name: '헬스 트레이너 현우',
    description: '건강한 생활을 추구하는 헬스 트레이너 현우. 운동과 식단에 관한 조언을 들어보세요.',
    imageUrl: '/images/characters/hyunwoo.jpg',
    creator: { username: '베이비챗', profileImage: '/images/profiles/babechat.png' },
    conversationCount: 38,
    likes: 215,
    isNew: false,
    tags: ['헬스', '운동', '트레이너', '건강', '식단']
  }
];

// 인기 검색어 데이터
const popularSearches = [
  '일진', '여대생', '직장인', '고민 상담', '연애', '학교', '게임', '취미', '운동', '일상'
];

// 카테고리 데이터
const categories = [
  { id: 'daily', name: '일상', count: 124 },
  { id: 'romance', name: '연애', count: 98 },
  { id: 'school', name: '학교', count: 76 },
  { id: 'work', name: '직장', count: 65 },
  { id: 'hobby', name: '취미', count: 53 },
  { id: 'counseling', name: '상담', count: 47 },
  { id: 'game', name: '게임', count: 42 },
  { id: 'fantasy', name: '판타지', count: 38 }
];

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setIsLoading(true);
        // 백엔드 구현 시 아래 주석 해제
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/characters`);
        // setCharacters(response.data);
        
        // 더미 데이터 사용 (백엔드 구현 전)
        setTimeout(() => {
          setCharacters(dummyCharacters);
          setFilteredCharacters(dummyCharacters);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('캐릭터를 불러오는데 실패했습니다:', error);
        setIsLoading(false);
      }
    };

    // 로컬 스토리지에서 최근 검색어 가져오기
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }

    fetchCharacters();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCharacters(characters);
      return;
    }

    // 검색어 저장
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      const newRecentSearches = [searchQuery.trim(), ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }

    // 검색 필터링
    const filtered = characters.filter(character => 
      character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredCharacters(filtered);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredCharacters(characters);
  };

  const handleSearchItemClick = (term) => {
    setSearchQuery(term);
    
    // 검색어 저장
    if (term.trim() && !recentSearches.includes(term.trim())) {
      const newRecentSearches = [term.trim(), ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }
    
    // 검색 필터링
    const filtered = characters.filter(character => 
      character.name.toLowerCase().includes(term.toLowerCase()) ||
      character.description.toLowerCase().includes(term.toLowerCase()) ||
      character.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredCharacters(filtered);
  };

  const handleRemoveRecentSearch = (index) => {
    const newRecentSearches = [...recentSearches];
    newRecentSearches.splice(index, 1);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const handleCategoryClick = (category) => {
    setSearchQuery(category.name);
    
    // 검색 필터링
    const filtered = characters.filter(character => 
      character.tags.some(tag => tag.toLowerCase().includes(category.name.toLowerCase()))
    );
    
    setFilteredCharacters(filtered);
  };

  return (
    <PageLayout>
      <Box sx={{ p: 2 }}>
        {/* 검색 입력 필드 */}
        <TextField
          fullWidth
          placeholder="캐릭터 검색"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: { 
              borderRadius: 3,
              bgcolor: '#f5f5f5',
              '& fieldset': { border: 'none' },
              py: 0.5
            }
          }}
        />
        
        {/* 탭 메뉴 */}
        <Box sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '& .MuiTab-root': { 
                fontSize: '0.875rem',
                fontWeight: 'medium',
                minWidth: 'auto',
                px: 2
              },
              '& .Mui-selected': {
                color: '#ff5e62 !important',
                fontWeight: 'bold'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#ff5e62'
              }
            }}
          >
            <Tab label="전체" />
            <Tab label="인기" />
            <Tab label="최신" />
            <Tab label="카테고리" />
          </Tabs>
        </Box>
        
        {/* 검색 결과가 없을 때 */}
        {!isLoading && searchQuery && filteredCharacters.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              '{searchQuery}'에 대한 검색 결과가 없습니다.
            </Typography>
          </Box>
        )}
        
        {/* 검색어가 없을 때 */}
        {!searchQuery && (
          <>
            {/* 최근 검색어 */}
            {recentSearches.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  최근 검색어
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {recentSearches.map((term, index) => (
                    <Chip
                      key={index}
                      label={term}
                      onClick={() => handleSearchItemClick(term)}
                      onDelete={() => handleRemoveRecentSearch(index)}
                      sx={{ 
                        bgcolor: '#f0f0f0',
                        '&:hover': { bgcolor: '#e0e0e0' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* 인기 검색어 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                인기 검색어
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {popularSearches.map((term, index) => (
                  <Chip
                    key={index}
                    label={term}
                    onClick={() => handleSearchItemClick(term)}
                    sx={{ 
                      bgcolor: '#f0f0f0',
                      '&:hover': { bgcolor: '#e0e0e0' }
                    }}
                  />
                ))}
              </Box>
            </Box>
            
            {/* 카테고리 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                카테고리
              </Typography>
              <Grid container spacing={1}>
                {categories.map((category) => (
                  <Grid item xs={6} key={category.id}>
                    <Card 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1.5,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <Typography variant="body1" fontWeight="medium">
                        {category.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {category.count}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
        
        {/* 검색 결과 */}
        {searchQuery && !isLoading && filteredCharacters.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              검색 결과 ({filteredCharacters.length})
            </Typography>
            <Grid container spacing={2}>
              {filteredCharacters.map((character) => (
                <Grid item xs={12} sm={6} key={character._id}>
                  <Card 
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <CardActionArea 
                      onClick={() => router.push(`/characters/${character._id}`)}
                      sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="180"
                          image={character.imageUrl}
                          alt={character.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        {character.isNew && (
                          <Chip
                            label="NEW"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              bgcolor: '#ff5e62',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <ChatBubbleOutlineIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption">
                            {character.conversationCount}만
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ p: 1.5, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" component="h3" fontWeight="bold">
                            {character.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FavoriteIcon sx={{ fontSize: 16, color: '#ff5e62', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {character.likes}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.8rem',
                            height: '2.4rem',
                            mb: 1
                          }}
                        >
                          {character.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {character.tags.slice(0, 3).map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={`#${tag}`} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#f0f0f0', 
                                fontSize: '0.7rem',
                                height: 20,
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }} 
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* 로딩 상태 */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}
      </Box>
    </PageLayout>
  );
} 