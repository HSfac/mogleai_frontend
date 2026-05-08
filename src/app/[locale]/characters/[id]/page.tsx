'use client';

import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { characterService } from '@/services/character.service';
import { chatService } from '@/services/chatService';
import PresetManager from '@/components/preset/PresetManager';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const { getLocalePath } = useLocaleNavigation();
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllDescription, setShowAllDescription] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const charactersPath = getLocalePath('/characters');
  const creatorDashboardPath = getLocalePath('/creator/dashboard');
  const creatorProfilePath = character?.creator?._id
    ? getLocalePath(`/creators/${character.creator._id}`)
    : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const characterData = await characterService.getCharacter(id);
        setCharacter(characterData);
        if (isAuthenticated && user?.favoriteCharacters?.includes(id)) {
          setIsLiked(true);
        }
        setIsLoading(false);
      } catch (error: any) {
        console.error('캐릭터 정보를 불러오는데 실패했습니다:', error);
        setError('캐릭터 정보를 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, isAuthenticated, user]);

  const handleLike = () => {
    requireAuth(async () => {
      try {
        await characterService.likeCharacter(id);
        setIsLiked(!isLiked);
        setCharacter((prev: any) => ({
          ...prev,
          likes: isLiked ? prev.likes - 1 : prev.likes + 1
        }));
        setSuccessMessage(isLiked ? '좋아요를 취소했습니다.' : '좋아요를 추가했습니다.');
      } catch (error: any) {
        setError('좋아요 처리 중 오류가 발생했습니다.');
      }
    }, '좋아요를 누르려면 로그인이 필요해요');
  };

  const handleStartChat = () => {
    requireAuth(async () => {
      try {
        const aiModel = character?.defaultAIModel || 'gpt4';
        const newChat = await chatService.createChat({
          characterId: id,
          aiModel,
          presetId: selectedPresetId,
        });
        router.push(getLocalePath(`/chat/${newChat._id}`));
      } catch (startError) {
        setError('채팅을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    }, '대화를 시작하려면 로그인이 필요해요');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: character?.name, text: character?.description, url: window.location.href })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => setSuccessMessage('링크가 복사되었습니다.'))
        .catch(() => {});
    }
  };

  const handleDelete = async () => {
    try {
      await characterService.deleteCharacter(id);
      setDeleteDialogOpen(false);
      setSuccessMessage('캐릭터가 삭제되었습니다.');
      setTimeout(() => router.push(creatorDashboardPath), 1500);
    } catch (error: any) {
      setError('캐릭터 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const isOwner = character?.creator?._id === user?._id;

  const descriptionLimit = 120;
  const isLongDescription = (character?.description?.length || 0) > descriptionLimit;
  const displayedDescription = isLongDescription && !showAllDescription
    ? character.description.slice(0, descriptionLimit) + '...'
    : character?.description;

  if (isLoading) {
    return (
      <PageLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={36} sx={{ color: '#ff5e62' }} />
        </Box>
      </PageLayout>
    );
  }

  if (!character) {
    return (
      <PageLayout>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            캐릭터를 찾을 수 없습니다.
          </Typography>
          <Button variant="contained" onClick={() => router.push(charactersPath)} sx={{ bgcolor: '#ff5e62', '&:hover': { bgcolor: '#ff4b50' } }}>
            목록으로 돌아가기
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* 전체 컨테이너 - 너비 제한 */}
      <Box sx={{ maxWidth: 680, mx: 'auto', position: 'relative' }}>

      {/* 토스트 */}
      <Snackbar open={!!successMessage} autoHideDuration={2500} onClose={() => setSuccessMessage('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ borderRadius: 2 }}>{successMessage}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={2500} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>{error}</Alert>
      </Snackbar>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>캐릭터 삭제</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <b>{character?.name}</b>을 삭제할까요? 이 작업은 되돌릴 수 없어요.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>취소</Button>
          <Button color="error" variant="contained" onClick={handleDelete} sx={{ borderRadius: 2, flex: 1 }}>삭제</Button>
        </DialogActions>
      </Dialog>

      {/* 본문 - sticky 버튼 공간 확보 */}
      <Box sx={{ pb: '80px' }}>

        {/* 이미지 풀스크린 미리보기 */}
        <Dialog
          open={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { bgcolor: '#000', borderRadius: 3, overflow: 'hidden', m: 2 } }}
        >
          <Box
            component="img"
            src={character?.profileImage || '/images/default-character.png'}
            alt={character?.name}
            onClick={() => setImagePreviewOpen(false)}
            sx={{ width: '100%', height: 'auto', maxHeight: '90vh', objectFit: 'contain', display: 'block', cursor: 'zoom-out' }}
          />
        </Dialog>

        {/* 히어로 이미지 */}
        <Box
          onClick={() => setImagePreviewOpen(true)}
          sx={{ position: 'relative', height: { xs: '380px', sm: '460px' }, overflow: 'hidden', cursor: 'zoom-in',
            '&:hover .img-zoom-hint': { opacity: 1 },
          }}
        >
          <Box
            component="img"
            src={character?.profileImage || '/images/default-character.png'}
            alt={character?.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.03)' } }}
          />
          {/* 호버시 줌 힌트 */}
          <Box
            className="img-zoom-hint"
            sx={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.25)', opacity: 0, transition: 'opacity 0.2s',
              pointerEvents: 'none',
            }}
          >
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.55)', borderRadius: '50%', p: 1.5, backdropFilter: 'blur(4px)' }}>
              <FullscreenIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
          </Box>
          {/* 그라데이션 오버레이 */}
          <Box sx={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)'
          }} />

          {/* 상단 버튼 바 */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', p: 1.5 }}>
            <IconButton onClick={() => router.push(charactersPath)} sx={{ bgcolor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
              <ArrowBackIcon sx={{ color: 'white', fontSize: 20 }} />
            </IconButton>
            {isOwner && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => router.push(getLocalePath(`/characters/${id}/edit`))} sx={{ bgcolor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
                  <EditIcon sx={{ color: 'white', fontSize: 20 }} />
                </IconButton>
                <IconButton onClick={() => setDeleteDialogOpen(true)} sx={{ bgcolor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
                  <DeleteIcon sx={{ color: 'white', fontSize: 20 }} />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* 하단 이름/크리에이터 */}
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <Typography variant="h5" fontWeight="bold" color="white" sx={{ lineHeight: 1.2 }}>
                {character?.name}
              </Typography>
              {character?.isVerified && <VerifiedIcon sx={{ color: '#1DA1F2', fontSize: 20 }} />}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Avatar src={character?.creator?.profileImage} sx={{ width: 20, height: 20 }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                {character?.creator?.username || '알 수 없음'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>·</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                {character?.createdAt ? formatDate(character.createdAt) : ''}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 통계 & 액션 바 */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 1,
          bgcolor: 'white',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {/* 통계 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteIcon sx={{ fontSize: 14, color: '#ff5e62' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {character.likes ?? 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: '#999' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {character?.usageCount ?? 0}회 대화
              </Typography>
            </Box>
          </Box>

          {/* 액션 */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={handleLike} sx={{ color: isLiked ? '#ff5e62' : '#666' }}>
              {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
            <IconButton size="small" onClick={handleShare} sx={{ color: '#666' }}>
              <ShareIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* 설명 + 뱃지 */}
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label={character?.defaultAIModel?.toUpperCase() || 'GPT-4'}
              size="small"
              sx={{ bgcolor: '#fff0f0', color: '#ff5e62', fontWeight: 600, fontSize: 11, height: 22 }}
            />
            {character?.isPublic ? (
              <Chip label="공개" size="small" sx={{ bgcolor: '#f0fff4', color: '#2e7d32', fontWeight: 500, fontSize: 11, height: 22 }} />
            ) : (
              <Chip label="비공개" size="small" sx={{ bgcolor: '#f5f5f5', color: '#777', fontWeight: 500, fontSize: 11, height: 22 }} />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {displayedDescription}
          </Typography>

          {isLongDescription && (
            <Button
              size="small"
              onClick={() => setShowAllDescription(!showAllDescription)}
              endIcon={showAllDescription ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ mt: 0.5, color: '#ff5e62', fontWeight: 500, p: 0, minWidth: 0, fontSize: 12 }}
            >
              {showAllDescription ? '접기' : '더보기'}
            </Button>
          )}
        </Box>

        {/* 캐릭터 특징 */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 1.25 }}>
            캐릭터 특징
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #f0f0f0' }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                성격
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontSize: 13 }}>
                {character?.personality || '설정되지 않음'}
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #f0f0f0' }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                말투
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontSize: 13 }}>
                {character?.speakingStyle || '설정되지 않음'}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* 프리셋 */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <PresetManager
            characterId={id}
            isOwner={isOwner}
            onSelectPreset={(presetId) => setSelectedPresetId(presetId)}
          />
        </Box>

        {/* 크리에이터 */}
        <Box sx={{ px: 2, py: 1.5, mx: 2, mb: 1, bgcolor: '#fafafa', borderRadius: 3, border: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar src={character?.creator?.profileImage} sx={{ width: 40, height: 40 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: 14 }}>
                  {character?.creator?.username || '알 수 없음'}
                </Typography>
                <Typography variant="caption" color="text.secondary">크리에이터</Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => creatorProfilePath && router.push(creatorProfilePath)}
              disabled={!creatorProfilePath}
              sx={{ borderRadius: 2, fontSize: 12, px: 1.5, py: 0.5, borderColor: '#e0e0e0', color: 'text.secondary', '&:hover': { borderColor: '#ff5e62', color: '#ff5e62' } }}
            >
              {isOwner ? '내 페이지' : '페이지 보기'}
            </Button>
          </Box>
        </Box>

      </Box>

      {/* 하단 플로팅 대화 버튼 */}
      <Box sx={{
        position: 'fixed',
        bottom: 24,
        left: { xs: '50%', md: 'calc(var(--sidebar-width, 0px) + (100vw - var(--sidebar-width, 0px)) / 2)' },
        transform: 'translateX(-50%)',
        width: { xs: 'calc(100% - 48px)', md: `calc(min(400px, 100vw - var(--sidebar-width, 0px) - 48px))` },
        zIndex: 100,
      }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleStartChat}
          startIcon={<PlayArrowIcon sx={{ fontSize: '18px !important' }} />}
          sx={{
            py: 1.6,
            borderRadius: '50px',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.5px',
            bgcolor: '#ff5e62',
            boxShadow: '0 8px 24px rgba(255,94,98,0.45)',
            '&:hover': {
              bgcolor: '#f04e52',
              boxShadow: '0 12px 28px rgba(255,94,98,0.55)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 4px 12px rgba(255,94,98,0.4)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {character?.name}와 대화하기
        </Button>
      </Box>

      </Box> {/* maxWidth 컨테이너 닫기 */}
    </PageLayout>
  );
}
