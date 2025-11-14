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
  ListItemAvatar,
  Alert,
  Snackbar
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchCharacterById } from '@/services/characterService';
import { api } from '@/lib/api';

export default function CharacterDetailPage({ params }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllDescription, setShowAllDescription] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const characterData = await fetchCharacterById(params.id);
        setCharacter(characterData);

        // Check if user has liked this character
        if (isAuthenticated && user?.favorites?.includes(params.id)) {
          setIsLiked(true);
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error('캐릭터 정보를 불러오는데 실패했습니다:', error);
        setError('캐릭터 정보를 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, isAuthenticated, user]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      await api.post(`/characters/${params.id}/like`);

      setIsLiked(!isLiked);
      setCharacter((prev: any) => ({
        ...prev,
        likes: isLiked ? prev.likes - 1 : prev.likes + 1
      }));

      setSuccessMessage(isLiked ? '좋아요를 취소했습니다.' : '좋아요를 추가했습니다.');
    } catch (error: any) {
      console.error('좋아요 처리 중 오류가 발생했습니다:', error);
      setError('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleStartChat = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    router.push(`/chat/${params.id}`);
  };

  const handleEdit = () => {
    router.push(`/characters/${params.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/characters/${params.id}`);
      setSuccessMessage('캐릭터가 삭제되었습니다.');
      setTimeout(() => {
        router.push('/creator/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('캐릭터 삭제 중 오류가 발생했습니다:', error);
      setError('캐릭터 삭제 중 오류가 발생했습니다.');
    }
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
      navigator.clipboard.writeText(window.location.href)
        .then(() => setSuccessMessage('링크가 클립보드에 복사되었습니다.'))
        .catch((error) => console.error('클립보드 복사 실패:', error));
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwner = character?.creator?._id === user?._id;

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
        {/* Snackbar for messages */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={3000}
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>

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
              src={character?.profileImage || '/images/default-character.png'}
              alt={character?.name}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" component="h1" fontWeight="bold" color="white">
                      {character?.name}
                    </Typography>
                    {character?.isVerified && (
                      <VerifiedIcon sx={{ color: '#1DA1F2', fontSize: 20 }} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Avatar
                      src={character?.creator?.profileImage}
                      alt={character?.creator?.username}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    <Typography variant="body2" color="white">
                      {character?.creator?.username || '알 수 없음'}
                    </Typography>
                  </Box>
                </Box>

                {/* Owner actions */}
                {isOwner && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={handleEdit}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      <EditIcon sx={{ color: 'white' }} />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteDialogOpen(true)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      <DeleteIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </Box>
                )}
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
                {character?.usageCount || 0}
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
            {character?.description}
          </Typography>

          {/* AI Model Badge */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`AI: ${character?.defaultAIModel?.toUpperCase() || 'GPT-4'}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            {character?.isPublic ? (
              <Chip label="공개" size="small" color="success" variant="outlined" />
            ) : (
              <Chip label="비공개" size="small" color="default" variant="outlined" />
            )}
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

        {/* 캐릭터 성격 & 말투 */}
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            캐릭터 특징
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                성격
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {character?.personality || '설정되지 않음'}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                말투
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {character?.speakingStyle || '설정되지 않음'}
              </Typography>
            </Paper>
          </Box>
        </Box>

        <Divider sx={{ mx: 3 }} />

        {/* 크리에이터 정보 */}
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            크리에이터
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={character?.creator?.profileImage}
                alt={character?.creator?.username}
                sx={{ width: 48, height: 48, mr: 2 }}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {character?.creator?.username || '알 수 없음'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  생성일: {character?.createdAt ? formatDate(character.createdAt) : '-'}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push(`/profile/${character?.creator?._id}`)}
            >
              프로필 보기
            </Button>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
} 