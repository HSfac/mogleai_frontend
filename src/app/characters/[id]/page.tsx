'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Paper,
  CircularProgress,
  TextField,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageLayout from '@/components/PageLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import PersonIcon from '@mui/icons-material/Person';
import Image from 'next/image';

// 더미 데이터
const dummyCharacter = {
  _id: '1',
  name: '비비',
  description: '[베이비챗의 CS 담당자] 예상치 못한 사건으로 대부분의 녀석들보다 사고하는 폭이 넓은 비비는 모두의 대화 상대가 되어줍니다.',
  longDescription: '베이비챗의 CS 담당자로 일하고 있는 비비는 다양한 고객들의 문의를 처리하면서 많은 경험을 쌓았습니다. 그녀는 항상 친절하고 이해심이 많으며, 어떤 상황에서도 최선의 해결책을 찾아내려고 노력합니다. 비비는 자신의 일을 사랑하며, 고객들이 만족할 때 가장 큰 보람을 느낍니다. 그녀와 대화하면서 일상의 고민이나 궁금한 점을 물어보세요. 비비는 항상 당신의 이야기를 경청하고 도움이 되는 조언을 해줄 것입니다.',
  imageUrl: '/images/characters/bibi.jpg',
  creator: { 
    username: '베이비챗', 
    profileImage: '/images/profiles/babechat.png',
    description: '공식 베이비챗 계정입니다. 다양한 AI 캐릭터를 만들고 있습니다.'
  },
  conversationCount: 17,
  likes: 443,
  isLiked: false,
  createdAt: new Date(2023, 2, 15),
  tags: ['직장', '신입여사원', '비비', '베이비챗', '고객', '고객센터'],
  personality: '친절하고 이해심이 많으며, 문제 해결 능력이 뛰어납니다.',
  examples: [
    '안녕하세요! 오늘 기분이 어떠세요?',
    '업무 중에 어려운 점이 있으신가요?',
    '고객 응대 방법에 대해 조언이 필요하신가요?'
  ]
};

// 더미 리뷰 데이터
const dummyReviews = [
  {
    id: '1',
    user: {
      username: '사용자123',
      profileImage: '/images/profiles/user1.jpg'
    },
    rating: 5,
    content: '비비와의 대화가 정말 즐거웠어요! 마치 실제 사람과 대화하는 것 같았습니다.',
    createdAt: new Date(2023, 4, 20)
  },
  {
    id: '2',
    user: {
      username: '채팅러버',
      profileImage: '/images/profiles/user2.jpg'
    },
    rating: 4,
    content: '친절하고 상냥한 응대가 좋았습니다. 가끔 대화가 반복되는 느낌이 있지만 전반적으로 만족스러워요.',
    createdAt: new Date(2023, 4, 18)
  },
  {
    id: '3',
    user: {
      username: 'AI팬',
      profileImage: '/images/profiles/user3.jpg'
    },
    rating: 5,
    content: '정말 자연스러운 대화가 가능해요! 비비의 성격이 너무 좋아요.',
    createdAt: new Date(2023, 4, 15)
  }
];

export default function CharacterDetailPage({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showAllDescription, setShowAllDescription] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setIsLoading(true);
        // 백엔드 구현 시 아래 주석 해제
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/characters/${params.id}`);
        // setCharacter(response.data);
        // setIsLiked(response.data.isLiked);
        
        // 더미 데이터 사용 (백엔드 구현 전)
        setTimeout(() => {
          setCharacter(dummyCharacter);
          setIsLiked(dummyCharacter.isLiked);
          setReviews(dummyReviews);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('캐릭터 정보를 불러오는데 실패했습니다:', error);
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCharacter();
    }
  }, [params.id]);

  const handleLike = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      // 백엔드 구현 시 아래 주석 해제
      // await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/characters/${params.id}/like`, {}, {
      //   headers: {
      //     Authorization: `Bearer ${session.accessToken}`,
      //   },
      // });
      
      // 임시 처리 (백엔드 구현 전)
      setIsLiked(!isLiked);
      setCharacter(prev => ({
        ...prev,
        likes: isLiked ? prev.likes - 1 : prev.likes + 1
      }));
    } catch (error) {
      console.error('좋아요 처리 중 오류가 발생했습니다:', error);
    }
  };

  const handleStartChat = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    router.push(`/chat/${params.id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: character?.name,
        text: character?.description,
        url: window.location.href,
      })
      .catch((error) => console.error('공유하기 실패:', error));
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('링크가 클립보드에 복사되었습니다.'))
        .catch((error) => console.error('클립보드 복사 실패:', error));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={40} />
        </Box>
      </PageLayout>
    );
  }

  if (!character) {
    return (
      <PageLayout>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            캐릭터를 찾을 수 없습니다.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/characters')}
            sx={{ mt: 2 }}
          >
            캐릭터 목록으로 돌아가기
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box sx={{ pb: 4 }}>
        {/* 캐릭터 이미지 및 기본 정보 */}
        <Box sx={{ position: 'relative' }}>
          <Box 
            sx={{ 
              position: 'relative',
              height: '250px',
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src={character.imageUrl}
              alt={character.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.85)'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
              }}
            >
              <Typography variant="h5" component="h1" fontWeight="bold" color="white">
                {character.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar 
                  src={character.creator.profileImage} 
                  alt={character.creator.username}
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
                <Typography variant="body2" color="white">
                  {character.creator.username}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* 액션 버튼 */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              p: 2,
              bgcolor: 'white',
              borderRadius: '0 0 16px 16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton onClick={handleLike} color={isLiked ? 'error' : 'default'}>
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                {character.likes}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton>
                <ChatBubbleOutlineIcon />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                {character.conversationCount}만
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                공유
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* 캐릭터 설명 */}
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {showAllDescription 
              ? character.longDescription 
              : character.description}
          </Typography>
          
          {character.longDescription && character.longDescription.length > character.description.length && (
            <Button 
              variant="text" 
              onClick={() => setShowAllDescription(!showAllDescription)}
              sx={{ mt: 1, p: 0, textTransform: 'none' }}
            >
              {showAllDescription ? '간략히 보기' : '더 보기'}
            </Button>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {character.tags.map((tag, index) => (
              <Chip 
                key={index} 
                label={`#${tag}`} 
                size="small" 
                sx={{ 
                  bgcolor: '#f0f0f0', 
                  fontSize: '0.8rem'
                }} 
              />
            ))}
          </Box>
        </Box>
        
        <Divider sx={{ mx: 3 }} />
        
        {/* 대화 시작 버튼 */}
        <Box sx={{ p: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleStartChat}
            sx={{ 
              py: 1.5,
              bgcolor: '#ff5e62',
              '&:hover': {
                bgcolor: '#ff4b50'
              }
            }}
          >
            대화 시작하기
          </Button>
        </Box>
        
        <Divider sx={{ mx: 3 }} />
        
        {/* 대화 예시 */}
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            대화 예시
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {character.examples.map((example, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#f5f5f5',
                  cursor: 'pointer'
                }}
                onClick={handleStartChat}
              >
                <Typography variant="body2">{example}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
        
        <Divider sx={{ mx: 3 }} />
        
        {/* 크리에이터 정보 */}
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            크리에이터
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={character.creator.profileImage} 
              alt={character.creator.username}
              sx={{ width: 48, height: 48, mr: 2 }}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {character.creator.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {character.creator.description}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ mx: 3 }} />
        
        {/* 리뷰 섹션 */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              리뷰 ({reviews.length})
            </Typography>
            <Button 
              variant="text" 
              sx={{ textTransform: 'none' }}
              onClick={() => router.push(`/characters/${params.id}/reviews`)}
            >
              모두 보기
            </Button>
          </Box>
          
          {reviews.length > 0 ? (
            <List sx={{ p: 0 }}>
              {reviews.slice(0, 3).map((review) => (
                <ListItem 
                  key={review.id} 
                  alignItems="flex-start"
                  sx={{ px: 0, py: 1.5 }}
                >
                  <ListItemAvatar>
                    <Avatar src={review.user.profileImage} alt={review.user.username} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {review.user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(review.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', my: 0.5 }}>
                          {[...Array(5)].map((_, i) => (
                            <FavoriteIcon 
                              key={i} 
                              sx={{ 
                                fontSize: 16, 
                                color: i < review.rating ? '#ff5e62' : '#e0e0e0',
                                mr: 0.5
                              }} 
                            />
                          ))}
                        </Box>
                        <Typography variant="body2" color="text.primary" component="span">
                          {review.content}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                아직 리뷰가 없습니다.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </PageLayout>
  );
} 