'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { worldService } from '@/services/worldService';
import { World, Visibility } from '@/types/world';

export default function WorldDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const worldId = params.id as string;

  useEffect(() => {
    if (worldId) {
      loadWorld();
    }
  }, [worldId]);

  const loadWorld = async () => {
    setLoading(true);
    try {
      const data = await worldService.getWorld(worldId);
      setWorld(data);
    } catch (error) {
      console.error('세계관을 불러오는데 실패했습니다:', error);
      router.push('/worlds');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/worlds/${worldId}`);
      return;
    }
    try {
      await worldService.likeWorld(worldId);
      setWorld((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await worldService.deleteWorld(worldId);
      router.push('/worlds');
    } catch (error) {
      console.error('삭제 실패:', error);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const isOwner = user && world?.creator?._id === user._id;

  const getVisibilityIcon = (visibility: Visibility) => {
    switch (visibility) {
      case Visibility.PUBLIC:
        return <PublicIcon sx={{ fontSize: 18 }} />;
      case Visibility.PRIVATE:
        return <LockIcon sx={{ fontSize: 18 }} />;
      default:
        return <VisibilityIcon sx={{ fontSize: 18 }} />;
    }
  };

  const getVisibilityText = (visibility: Visibility) => {
    switch (visibility) {
      case Visibility.PUBLIC:
        return '전체 공개';
      case Visibility.PRIVATE:
        return '비공개';
      case Visibility.FOLLOWERS_ONLY:
        return '팔로워 전용';
      default:
        return visibility;
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Box
          sx={{
            bgcolor: '#0a0a0a',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress sx={{ color: '#ff3366' }} />
        </Box>
      </PageLayout>
    );
  }

  if (!world) {
    return (
      <PageLayout>
        <Box
          sx={{
            bgcolor: '#0a0a0a',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="#999">세계관을 찾을 수 없습니다.</Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh' }}>
        {/* Hero Image */}
        {world.coverImage && (
          <Box
            sx={{
              width: '100%',
              height: 300,
              backgroundImage: `url(${world.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(transparent, #0a0a0a)',
              },
            }}
          />
        )}

        <Container maxWidth="lg" sx={{ py: 4, mt: world.coverImage ? -8 : 0, position: 'relative' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/worlds')}
            sx={{ color: '#999', mb: 3, '&:hover': { color: '#fff' } }}
          >
            세계관 목록
          </Button>

          <Paper
            sx={{
              bgcolor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 3,
              p: 4,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 3,
              }}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Typography variant="h4" fontWeight={900} color="#fff">
                    {world.name}
                  </Typography>
                  {world.isAdultContent && (
                    <Chip
                      label="19+"
                      size="small"
                      sx={{
                        bgcolor: '#ff3366',
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" color="#666">
                    by {world.creator?.username || '크리에이터'}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" color="#666">
                    {getVisibilityIcon(world.visibility)}
                    <Typography variant="body2">{getVisibilityText(world.visibility)}</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={handleLike}
                  sx={{
                    color: '#666',
                    '&:hover': { color: '#ff3366', bgcolor: 'rgba(255,51,102,0.1)' },
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
                {isOwner && (
                  <>
                    <IconButton
                      onClick={() => router.push(`/worlds/${worldId}/edit`)}
                      sx={{
                        color: '#666',
                        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteDialogOpen(true)}
                      sx={{
                        color: '#666',
                        '&:hover': { color: '#ff3366', bgcolor: 'rgba(255,51,102,0.1)' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </Stack>
            </Box>

            {/* Stats */}
            <Stack direction="row" spacing={4} mb={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FavoriteIcon sx={{ color: '#ff3366', fontSize: 20 }} />
                <Typography color="#ccc" fontWeight={600}>
                  {world.likes} 좋아요
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <GroupIcon sx={{ color: '#666', fontSize: 20 }} />
                <Typography color="#ccc" fontWeight={600}>
                  {world.characterCount} 캐릭터
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <VisibilityIcon sx={{ color: '#666', fontSize: 20 }} />
                <Typography color="#ccc" fontWeight={600}>
                  {world.usageCount} 사용
                </Typography>
              </Stack>
            </Stack>

            {/* Description */}
            <Box mb={4}>
              <Typography variant="h6" color="#fff" fontWeight={700} mb={2}>
                설명
              </Typography>
              <Typography color="#ccc" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {world.description}
              </Typography>
            </Box>

            {/* Setting */}
            {world.setting && (
              <Box mb={4}>
                <Typography variant="h6" color="#fff" fontWeight={700} mb={2}>
                  배경 설정
                </Typography>
                <Paper
                  sx={{
                    bgcolor: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography color="#999" fontStyle="italic">
                    {world.setting}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Rules */}
            {world.rules && world.rules.length > 0 && (
              <Box mb={4}>
                <Typography variant="h6" color="#fff" fontWeight={700} mb={2}>
                  세계관 규칙
                </Typography>
                <Stack spacing={1}>
                  {world.rules.map((rule, index) => (
                    <Paper
                      key={index}
                      sx={{
                        bgcolor: '#0a0a0a',
                        border: '1px solid #333',
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Typography color="#ccc">
                        {index + 1}. {rule}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Tags */}
            {world.tags && world.tags.length > 0 && (
              <Box mb={4}>
                <Typography variant="h6" color="#fff" fontWeight={700} mb={2}>
                  태그
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                  {world.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      sx={{
                        bgcolor: '#2a2a2a',
                        color: '#ff3366',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Actions */}
            <Box sx={{ pt: 3, borderTop: '1px solid #2a2a2a' }}>
              <Button
                variant="contained"
                onClick={() => router.push(`/characters/create?worldId=${worldId}`)}
                sx={{
                  bgcolor: '#ff3366',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#e62958' },
                }}
              >
                이 세계관으로 캐릭터 만들기
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>세계관 삭제</DialogTitle>
        <DialogContent>
          <Typography color="#ccc">
            정말로 "{world.name}" 세계관을 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: '#999' }}
          >
            취소
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              color: '#ff3366',
              '&:hover': { bgcolor: 'rgba(255,51,102,0.1)' },
            }}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
}
