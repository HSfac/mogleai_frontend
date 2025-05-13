'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Stack,
  Tabs,
  Tab,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  MobileStepper,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ImageIcon from '@mui/icons-material/Image';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import PageLayout from '@/components/PageLayout';
import { useSession } from 'next-auth/react';
import { useSwipeable } from 'react-swipeable';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TokenIcon from '@mui/icons-material/Token';

// 배너 데이터
const banners = [
  {
    title: '타인의 지적 재산권을 침해하는 캐릭터 생성 불가',
    description: '캐릭터 생성 불가',
    imageUrl: '/images/banners/copyright.jpg',
    link: '/guidelines'
  },
  {
    title: '친구 초대하면 친구도 나도 30 프로챗!',
    description: '친구 초대 이벤트',
    imageUrl: '/images/banners/invite.jpg',
    link: '/invite'
  },
  {
    title: '새로운 AI 캐릭터와 대화해보세요',
    description: '신규 캐릭터 출시',
    imageUrl: '/images/banners/new-characters.jpg',
    link: '/characters/new'
  }
];

// TabPanel 컴포넌트 추가
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: session, status } = useSession();
  const [tabValue, setTabValue] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [popularCharacters, setPopularCharacters] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const charactersContainerRef = useRef(null);
  const maxSteps = banners.length;
  
  // 더미 캐릭터 데이터 (API 연결 전까지 사용)
  const dummyCharacters = [
    {
      _id: '1',
      name: '비비',
      description: '[베이비챗의 CS 담당자] 예상치 못한 사건으로 대학교를 중퇴하고 취업전선에 뛰어든 20대 여성',
      imageUrl: '/images/characters/bibi.jpg',
      tags: ['타로', '신년운세', '비비'],
      likes: 443
    },
    {
      _id: '2',
      name: '일진 윤아 18',
      description: '한국의 전형적인 스타일을 지닌 고등학교 \'인싸\' 그녀는 당신에게 관심이 있어요',
      imageUrl: '/images/characters/yoona.jpg',
      tags: ['일진', '인싸', '고등학생'],
      likes: 830
    },
    {
      _id: '3',
      name: '은서 22',
      description: '냉소적이고 무례한 손님들을 대하는 편의점 알바생',
      imageUrl: '/images/characters/eunseo.jpg',
      tags: ['알바', '냉소적'],
      likes: 0
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // API 연결 시 아래 코드 사용
        // const charactersRes = await axios.get('/api/characters/popular?limit=3');
        // setPopularCharacters(charactersRes.data);
        
        // 임시로 더미 데이터 사용
        setPopularCharacters(dummyCharacters);
        
        // 로그인한 경우 최근 대화 가져오기
        if (status === 'authenticated') {
          // const chatsRes = await axios.get('/api/chats/recent?limit=3');
          // setRecentChats(chatsRes.data);
          setRecentChats([]);
        }
      } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다:', error);
      }
    };
    
    fetchData();
    
    // 배너 자동 슬라이드 설정
    const timer = setInterval(() => {
      setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
    }, 5000);
    
    return () => {
      clearInterval(timer);
    };
  }, [status, maxSteps]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 배너 스텝 변경 핸들러
  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps);
  };

  // 스와이프 핸들러 설정
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handleBack(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  // 캐릭터 리스트 스크롤 함수
  const scrollCharacters = (direction) => {
    if (charactersContainerRef.current) {
      const container = charactersContainerRef.current;
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <PageLayout>
      {/* 배너 섹션 */}
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Box {...swipeHandlers} sx={{ overflow: 'hidden' }}>
          {banners.map((banner, index) => (
            <Paper
              key={index}
              sx={{
                position: 'relative',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: 0,
                overflow: 'hidden',
                height: '130px',
                display: index === activeStep ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'flex-start',
                pl: 3
              }}
            >
              <Box sx={{ zIndex: 1, maxWidth: '70%' }}>
                <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {banner.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {banner.description}
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '40%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(128, 128, 128, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h3" sx={{ color: '#fff' }}>
                    {index === 0 ? '⊘' : index === 1 ? '🎁' : '🆕'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
        
        {/* 배너 네비게이션 */}
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{ 
            backgroundColor: 'transparent', 
            position: 'absolute', 
            bottom: 0, 
            right: 0,
            width: 'auto',
            '& .MuiMobileStepper-dot': {
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
            },
            '& .MuiMobileStepper-dotActive': {
              backgroundColor: 'white',
            }
          }}
          nextButton={
            <IconButton 
              size="small" 
              onClick={handleNext}
              sx={{ color: 'white' }}
            >
              <KeyboardArrowRight />
            </IconButton>
          }
          backButton={
            <IconButton 
              size="small" 
              onClick={handleBack}
              sx={{ color: 'white' }}
            >
              <KeyboardArrowLeft />
            </IconButton>
          }
        />
      </Box>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': { 
              textTransform: 'none',
              fontWeight: 'medium',
              fontSize: '0.95rem',
              color: '#666',
              py: 1.5,
              minWidth: 'auto',
              px: { xs: 2, sm: 3 }
            },
            '& .Mui-selected': {
              color: '#ff5e62 !important',
              fontWeight: 'bold'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#ff5e62',
              height: 3
            }
          }}
        >
          <Tab label="홈" icon={<HomeIcon fontSize="small" />} iconPosition="start" />
          <Tab label="랭킹" icon={<EmojiEventsIcon fontSize="small" />} iconPosition="start" />
          <Tab label="2024 수상작" icon={<StarIcon fontSize="small" />} iconPosition="start" />
          <Tab label="카테고리" icon={<CategoryIcon fontSize="small" />} iconPosition="start" />
          <Tab label="태그" icon={<LocalOfferIcon fontSize="small" />} iconPosition="start" />
          <Tab label="베이비즈" icon={<PeopleIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      <Container sx={{ py: 3 }}>
        {/* 탭 콘텐츠 */}
        <TabPanel value={tabValue} index={0}>
          {/* 홈 탭 콘텐츠 */}
          <Box>
            {/* 추천 캐릭터 섹션 */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  추천 캐릭터
                </Typography>
                <Button 
                  variant="text" 
                  color="error"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontWeight: 'bold' }}
                >
                  더 보기
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {popularCharacters.slice(0, 3).map((character) => (
                  <Grid item xs={12} sm={4} key={character._id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'visible',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }
                      }}
                      onClick={() => router.push(`/characters/${character._id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="180"
                        image={character.imageUrl}
                        alt={character.name}
                      />
                      <CardContent>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {character.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '40px', overflow: 'hidden' }}>
                          {character.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {character.tags.slice(0, 3).map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={`#${tag}`} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#f0f0f0', 
                                fontSize: '0.7rem',
                                height: 20
                              }} 
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            {/* 인기 카테고리 섹션 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                인기 카테고리
              </Typography>
              <Grid container spacing={2}>
                {[
                  { name: '일상', icon: '🏠', color: '#FFD1DC' },
                  { name: '연애', icon: '❤️', color: '#FFADAD' },
                  { name: '판타지', icon: '🧙', color: '#BDB2FF' },
                  { name: '직장', icon: '💼', color: '#A0C4FF' },
                  { name: '학교', icon: '🏫', color: '#9BF6FF' },
                  { name: '게임', icon: '🎮', color: '#CAFFBF' }
                ].map((category, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <Card 
                      sx={{ 
                        bgcolor: category.color,
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.03)'
                        }
                      }}
                      onClick={() => router.push(`/categories/${category.name}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ mr: 2 }}>{category.icon}</Typography>
                        <Typography variant="h6" fontWeight="bold">{category.name}</Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            {/* 최근 대화 섹션 */}
            {status === 'authenticated' && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    최근 대화
                  </Typography>
                  <Button 
                    variant="text" 
                    color="error"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ fontWeight: 'bold' }}
                  >
                    더 보기
                  </Button>
                </Box>
                
                {recentChats.length > 0 ? (
                  <Grid container spacing={2}>
                    {recentChats.map((chat) => (
                      <Grid item xs={12} key={chat._id}>
                        <Card 
                          sx={{ 
                            display: 'flex',
                            borderRadius: 2,
                            cursor: 'pointer'
                          }}
                          onClick={() => router.push(`/chat/${chat._id}`)}
                        >
                          <CardMedia
                            component="img"
                            sx={{ width: 80, height: 80 }}
                            image={chat.character.imageUrl}
                            alt={chat.character.name}
                          />
                          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {chat.character.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {chat.lastMessage}
                              </Typography>
                            </CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(chat.updatedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      아직 대화 기록이 없습니다.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => router.push('/characters')}
                      sx={{ mt: 2 }}
                    >
                      캐릭터 탐색하기
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* 랭킹 탭 콘텐츠 */}
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              인기 캐릭터 랭킹
            </Typography>
            
            <List sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
              {popularCharacters.map((character, index) => (
                <React.Fragment key={character._id}>
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                    onClick={() => router.push(`/characters/${character._id}`)}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 30, 
                        height: 30, 
                        borderRadius: '50%', 
                        bgcolor: index < 3 ? '#ff5e62' : '#f0f0f0',
                        color: index < 3 ? 'white' : 'text.secondary',
                        fontWeight: 'bold',
                        mr: 2
                      }}
                    >
                      {index + 1}
                    </Box>
                    <ListItemAvatar>
                      <Avatar 
                        src={character.imageUrl} 
                        alt={character.name}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {character.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                            {character.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FavoriteIcon sx={{ fontSize: 16, color: '#ff5e62', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                              {character.likes}
                            </Typography>
                            <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {character.conversationCount || 0}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < popularCharacters.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => router.push('/characters/popular')}
              >
                전체 랭킹 보기
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* 2024 수상작 탭 콘텐츠 */}
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              2024 AI 캐릭터 어워드 수상작
            </Typography>
            
            <Box sx={{ position: 'relative', mb: 4, borderRadius: 2, overflow: 'hidden', height: 200 }}>
              <Box
                component="img"
                src="/images/banners/awards-banner.jpg"
                alt="AI 캐릭터 어워드"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.7)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  textAlign: 'center',
                  p: 2
                }}
              >
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  2024 AI 캐릭터 어워드
                </Typography>
                <Typography variant="body1">
                  사용자들이 선택한 최고의 AI 캐릭터를 만나보세요
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              {[
                { category: '대상', character: popularCharacters[0] },
                { category: '창의성상', character: popularCharacters[1] },
                { category: '인기상', character: popularCharacters[2] }
              ].map((award, index) => (
                award.character && (
                  <Grid item xs={12} key={index}>
                    <Card 
                      sx={{ 
                        display: 'flex',
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                        }
                      }}
                      onClick={() => router.push(`/characters/${award.character._id}`)}
                    >
                      <Box sx={{ position: 'relative', width: 120 }}>
                        <CardMedia
                          component="img"
                          sx={{ width: 120, height: '100%' }}
                          image={award.character.imageUrl}
                          alt={award.character.name}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bgcolor: '#ff5e62',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        >
                          {award.category}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, width: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {award.character.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {award.character.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                          <FavoriteIcon sx={{ fontSize: 16, color: '#ff5e62', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                            {award.character.likes}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {award.character.tags.slice(0, 2).map((tag, idx) => (
                              <Chip 
                                key={idx} 
                                label={`#${tag}`} 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#f0f0f0', 
                                  fontSize: '0.7rem',
                                  height: 20
                                }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* 카테고리 탭 콘텐츠 */}
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              카테고리별 탐색
            </Typography>
            
            <Grid container spacing={2}>
              {[
                { name: '일상', icon: '🏠', color: '#FFD1DC', count: 124 },
                { name: '연애', icon: '❤️', color: '#FFADAD', count: 98 },
                { name: '판타지', icon: '🧙', color: '#BDB2FF', count: 76 },
                { name: '직장', icon: '💼', color: '#A0C4FF', count: 65 },
                { name: '학교', icon: '🏫', color: '#9BF6FF', count: 53 },
                { name: '게임', icon: '🎮', color: '#CAFFBF', count: 42 },
                { name: '상담', icon: '🧠', color: '#FFC6FF', count: 38 },
                { name: '역할극', icon: '🎭', color: '#FDFFB6', count: 31 }
              ].map((category, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Card 
                    sx={{ 
                      bgcolor: category.color,
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.03)'
                      }
                    }}
                    onClick={() => router.push(`/categories/${category.name}`)}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ mb: 1 }}>{category.icon}</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">{category.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.count}개의 캐릭터
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {/* 태그 탭 콘텐츠 */}
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              인기 태그
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
              {[
                '일진', '여대생', '직장인', '고민상담', '연애', '학교', '게임', '취미', '운동', '일상',
                '판타지', '역할극', '상담', '친구', '선생님', '학생', '연예인', '가상인물', '역사인물',
                '외국인', '반려동물', '음식', '여행', '패션', '음악', '영화', '책', '예술', '과학'
              ].map((tag, index) => (
                <Chip 
                  key={index} 
                  label={`#${tag}`} 
                  onClick={() => router.push(`/tags/${tag}`)}
                  sx={{ 
                    bgcolor: '#f0f0f0', 
                    '&:hover': { bgcolor: '#e0e0e0' },
                    fontSize: '0.9rem',
                    py: 2
                  }} 
                />
              ))}
            </Box>
            
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              태그별 인기 캐릭터
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                #일상
              </Typography>
              <Grid container spacing={2}>
                {popularCharacters.slice(0, 2).map((character) => (
                  <Grid item xs={6} key={character._id}>
                    <Card 
                      sx={{ 
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
                      }}
                      onClick={() => router.push(`/characters/${character._id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={character.imageUrl}
                        alt={character.name}
                      />
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                          {character.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                #연애
              </Typography>
              <Grid container spacing={2}>
                {popularCharacters.slice(1, 3).map((character) => (
                  <Grid item xs={6} key={character._id}>
                    <Card 
                      sx={{ 
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
                      }}
                      onClick={() => router.push(`/characters/${character._id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={character.imageUrl}
                        alt={character.name}
                      />
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                          {character.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          {/* 베이비즈 탭 콘텐츠 */}
          <Box>
            <Box sx={{ position: 'relative', mb: 3, borderRadius: 2, overflow: 'hidden', height: 180 }}>
              <Box
                component="img"
                src="/images/banners/babyz-banner.jpg"
                alt="베이비즈"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.8)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  textAlign: 'center',
                  p: 2
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  베이비즈
                </Typography>
                <Typography variant="body2">
                  베이비챗의 공식 AI 캐릭터 컬렉션
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              베이비즈 캐릭터
            </Typography>
            
            <Grid container spacing={2}>
              {popularCharacters.map((character) => (
                <Grid item xs={12} sm={6} key={character._id}>
                  <Card 
                    sx={{ 
                      display: 'flex',
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
                    }}
                    onClick={() => router.push(`/characters/${character._id}`)}
                  >
                    <CardMedia
                      component="img"
                      sx={{ width: 100, height: 100 }}
                      image={character.imageUrl}
                      alt={character.name}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', p: 1.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {character.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1
                      }}>
                        {character.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                        <FavoriteIcon sx={{ fontSize: 14, color: '#ff5e62', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {character.likes}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => router.push('/characters/official')}
              >
                모든 베이비즈 캐릭터 보기
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Container>
    </PageLayout>
  );
} 