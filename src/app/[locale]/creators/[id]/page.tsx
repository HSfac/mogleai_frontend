'use client';

import { useEffect, useMemo, useState, use } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PublicIcon from '@mui/icons-material/Public';
import TokenIcon from '@mui/icons-material/Token';
import VerifiedIcon from '@mui/icons-material/Verified';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';
import { characterService } from '@/services/character.service';
import { userService } from '@/services/userService';
import type { Character } from '@/types/character';
import type { CreatorProfile } from '@/types/user';

const glassCardSx = {
  borderRadius: 5,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(18,22,34,0.94), rgba(10,13,22,0.9))',
  boxShadow: '0 28px 60px rgba(2,6,23,0.28)',
  backdropFilter: 'blur(18px)',
};

const getLevelAccent = (creatorLevel?: string) => {
  switch (creatorLevel) {
    case 'partner':
      return { label: '공식 파트너', color: '#ffd66b', bg: 'rgba(255,214,107,0.16)' };
    case 'level3':
      return { label: 'LV3 전문가', color: '#8df2c2', bg: 'rgba(141,242,194,0.16)' };
    case 'level2':
      return { label: 'LV2 고급', color: '#7cc7ff', bg: 'rgba(124,199,255,0.16)' };
    case 'level1':
    default:
      return { label: 'LV1 입문', color: '#ff9ec2', bg: 'rgba(255,158,194,0.16)' };
  }
};

export default function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, refreshUser, isAuthenticated, openLoginModal } = useAuth();
  const { getLocalePath, router } = useLocaleNavigation();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const loadCreator = async () => {
      setLoading(true);
      setError('');

      try {
        const [creatorProfile, creatorCharacters] = await Promise.all([
          userService.getCreatorProfile(id),
          characterService.getPublicCreatorCharacters(id),
        ]);

        setCreator(creatorProfile);
        setCharacters(creatorCharacters || []);
      } catch (loadError) {
        console.error(loadError);
        setError('크리에이터 페이지를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCreator();
    }
  }, [id]);

  const isOwner = creator?._id && user?._id === creator._id;
  const followerCount = creator?.stats?.followerCount || 0;
  const levelAccent = getLevelAccent(creator?.creatorLevel);
  const headlineMetrics = useMemo(
    () =>
      creator
        ? [
            {
              label: '공개 캐릭터',
              value: creator.stats.publicCharacterCount,
              helper: `전체 ${creator.stats.totalCharacterCount}개`,
              icon: <PublicIcon />,
            },
            {
              label: '누적 반응',
              value: creator.stats.totalLikes,
              helper: `좋아요 합산`,
              icon: <FavoriteBorderIcon />,
            },
            {
              label: '누적 대화',
              value: creator.stats.totalUsage,
              helper: `캐릭터 소비 시간`,
              icon: <ChatBubbleOutlineIcon />,
            },
            {
              label: '누적 수익',
              value: creator.stats.totalTokenEarnings,
              helper: `정산 누적 토큰`,
              icon: <TokenIcon />,
            },
          ]
        : [],
    [creator],
  );

  useEffect(() => {
    if (!creator || !user?.followingCreators) {
      setIsFollowing(false);
      return;
    }

    setIsFollowing(
      user.followingCreators.some((creatorId) => creatorId === creator._id),
    );
  }, [creator, user?.followingCreators]);

  const handleFollowToggle = async () => {
    if (!creator) {
      return;
    }

    if (!isAuthenticated) {
      openLoginModal('크리에이터를 팔로우하려면 로그인이 필요해요');
      return;
    }

    if (isOwner) {
      return;
    }

    setFollowLoading(true);
    try {
      const result = isFollowing
        ? await userService.unfollowCreator(creator._id)
        : await userService.followCreator(creator._id);

      setIsFollowing(result.isFollowing);
      setCreator((prev) =>
        prev
          ? {
              ...prev,
              stats: {
                ...prev.stats,
                followerCount: result.followerCount,
              },
            }
          : prev,
      );
      await refreshUser();
    } catch (followError) {
      console.error(followError);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress sx={{ color: '#ff5f9b' }} />
        </Box>
      </PageLayout>
    );
  }

  if (error || !creator) {
    return (
      <PageLayout>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Alert severity="error">{error || '크리에이터 정보를 찾을 수 없습니다.'}</Alert>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box
        sx={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top left, rgba(255,95,155,0.18), transparent 32%), radial-gradient(circle at 82% 18%, rgba(124,199,255,0.14), transparent 28%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
          <Stack spacing={3}>
            <Card
              sx={{
                ...glassCardSx,
                overflow: 'hidden',
                background:
                  'linear-gradient(135deg, rgba(255,95,155,0.92) 0%, rgba(255,164,197,0.82) 42%, rgba(124,199,255,0.34) 100%)',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Grid container spacing={3} alignItems="stretch">
                  <Grid item xs={12} lg={7}>
                    <Stack spacing={2.5} sx={{ height: '100%', justifyContent: 'space-between' }}>
                      <Stack spacing={2.5}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={2.5}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                        >
                          <Avatar
                            src={creator.profileImage}
                            sx={{
                              width: 96,
                              height: 96,
                              bgcolor: 'rgba(255,255,255,0.18)',
                              color: '#fff',
                              fontSize: '2rem',
                              fontWeight: 800,
                              border: '1px solid rgba(255,255,255,0.28)',
                            }}
                          >
                            {creator.username?.[0] ?? 'C'}
                          </Avatar>
                          <Box>
                            <Chip
                              label={levelAccent.label}
                              sx={{
                                mb: 1.4,
                                bgcolor: levelAccent.bg,
                                color: levelAccent.color,
                                border: `1px solid ${levelAccent.color}55`,
                                fontWeight: 700,
                              }}
                            />
                            <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.04 }}>
                              {creator.username}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1.1, color: 'rgba(255,255,255,0.84)', maxWidth: 560 }}>
                              공개 캐릭터와 성장 흐름을 한 번에 볼 수 있는 크리에이터 페이지입니다.
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                              <Chip label={`레벨 ${creator.creatorProgress.currentLabel}`} sx={{ bgcolor: 'rgba(12,16,24,0.22)', color: '#fff' }} />
                              <Chip
                                label={`수익 ${creator.creatorProgress.earningRatePercent}%`}
                                sx={{ bgcolor: 'rgba(12,16,24,0.22)', color: '#fff' }}
                              />
                              <Chip
                                label={`팔로워 ${followerCount.toLocaleString()}명`}
                                sx={{ bgcolor: 'rgba(12,16,24,0.22)', color: '#fff' }}
                              />
                              {creator.creatorProgress.maxCharacters !== null ? (
                                <Chip
                                  label={`슬롯 ${creator.creatorProgress.activeCharacterCount}/${creator.creatorProgress.maxCharacters}`}
                                  sx={{ bgcolor: 'rgba(12,16,24,0.22)', color: '#fff' }}
                                />
                              ) : (
                                <Chip label="슬롯 무제한" sx={{ bgcolor: 'rgba(12,16,24,0.22)', color: '#fff' }} />
                              )}
                            </Stack>
                          </Box>
                        </Stack>

                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 4,
                            bgcolor: 'rgba(12,16,24,0.18)',
                            border: '1px solid rgba(255,255,255,0.18)',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Box>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                                성장 진행도
                              </Typography>
                              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                                {creator.creatorProgress.progressPercent === 100
                                  ? creator.creatorProgress.nextRequirement
                                    ? '다음 단계는 운영 성과와 관리자 검토'
                                    : '최고 등급 혜택 적용 중'
                                  : `${creator.creatorProgress.progressPercent}% 진행`}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.76)', textAlign: 'right' }}>
                              {creator.creatorProgress.nextRequirement || '최종 단계'}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={creator.creatorProgress.progressPercent}
                            sx={{
                              mt: 1.5,
                              height: 10,
                              borderRadius: '12px',
                              bgcolor: 'rgba(255,255,255,0.16)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: '12px',
                                background: 'linear-gradient(90deg, #fff 0%, #ffd3e4 45%, #b5ecff 100%)',
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ display: 'block', mt: 1.1, color: 'rgba(255,255,255,0.76)' }}>
                            누적 대화 {creator.totalConversations.toLocaleString()}회
                            {creator.creatorProgress.remainingConversations > 0
                              ? ` · 다음 단계까지 ${creator.creatorProgress.remainingConversations.toLocaleString()}회`
                              : ''}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        {!isOwner ? (
                          <Button
                            variant={isFollowing ? 'outlined' : 'contained'}
                            endIcon={<ArrowForwardIcon />}
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                            sx={{
                              borderRadius: '12px',
                              px: 2.4,
                              color: '#fff',
                              borderColor: 'rgba(255,255,255,0.22)',
                              background: isFollowing
                                ? 'transparent'
                                : 'rgba(12,16,24,0.24)',
                              boxShadow: 'none',
                            }}
                          >
                            {followLoading
                              ? '처리 중'
                              : isFollowing
                                ? '팔로우 중'
                                : '크리에이터 팔로우'}
                          </Button>
                        ) : null}
                        {isOwner ? (
                          <Button
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => router.push(getLocalePath('/creator/dashboard'))}
                            sx={{
                              borderRadius: '12px',
                              px: 2.4,
                              background: 'rgba(12,16,24,0.24)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              boxShadow: 'none',
                            }}
                          >
                            내 대시보드 열기
                          </Button>
                        ) : null}
                        <Button
                          variant="outlined"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => router.push(getLocalePath('/characters'))}
                          sx={{
                            borderRadius: '12px',
                            px: 2.4,
                            color: '#fff',
                            borderColor: 'rgba(255,255,255,0.22)',
                          }}
                        >
                          다른 캐릭터 둘러보기
                        </Button>
                      </Stack>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} lg={5}>
                    <Grid container spacing={2}>
                      {headlineMetrics.map((metric) => (
                        <Grid item xs={12} sm={6} key={metric.label}>
                          <Box
                            sx={{
                              p: 2.2,
                              borderRadius: 4,
                              bgcolor: 'rgba(12,16,24,0.18)',
                              border: '1px solid rgba(255,255,255,0.18)',
                              minHeight: 112,
                            }}
                          >
                            <Stack direction="row" spacing={1.3} alignItems="center">
                              <Avatar
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.14)',
                                  color: '#fff',
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {metric.icon}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                  {metric.label}
                                </Typography>
                                <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.05 }}>
                                  {metric.value.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.68)' }}>
                                  {metric.helper}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={glassCardSx}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  spacing={1.5}
                  sx={{ mb: 2.5 }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
                      공개 캐릭터
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)', mt: 0.5 }}>
                      이 크리에이터가 지금 공개해 둔 캐릭터입니다.
                    </Typography>
                  </Box>
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: 18 }} />}
                    label={`검증 캐릭터 ${creator.stats.verifiedCharacterCount}개`}
                    sx={{
                      bgcolor: 'rgba(124,199,255,0.12)',
                      color: '#7cc7ff',
                      border: '1px solid rgba(124,199,255,0.24)',
                    }}
                  />
                </Stack>

                {characters.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      border: '1px dashed rgba(255,255,255,0.14)',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                      아직 공개된 캐릭터가 없습니다
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)', mt: 1 }}>
                      이후 공개되는 신작은 이 페이지에서 바로 확인할 수 있습니다.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {characters.map((character) => (
                      <Grid item xs={12} sm={6} lg={4} key={character._id}>
                        <Card
                          onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                          sx={{
                            height: '100%',
                            borderRadius: 4,
                            border: '1px solid rgba(255,255,255,0.08)',
                            bgcolor: 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              borderColor: 'rgba(255,159,194,0.3)',
                              boxShadow: '0 20px 40px rgba(6,10,20,0.24)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2.25 }}>
                            <Stack spacing={1.5}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar
                                  src={character.profileImage}
                                  sx={{
                                    width: 58,
                                    height: 58,
                                    bgcolor: 'rgba(255,159,194,0.16)',
                                    color: '#ff8db5',
                                    fontWeight: 800,
                                  }}
                                >
                                  {character.name?.slice(0, 1)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }} noWrap>
                                    {character.name}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)' }}>
                                    {character.description || '설명이 없습니다.'}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {(character.tags || []).slice(0, 3).map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(255,255,255,0.05)',
                                      color: 'rgba(255,255,255,0.82)',
                                      borderRadius: '12px',
                                    }}
                                  />
                                ))}
                                {character.isVerified ? (
                                  <Chip
                                    label="검증"
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(124,199,255,0.12)',
                                      color: '#7cc7ff',
                                      borderRadius: '12px',
                                    }}
                                  />
                                ) : null}
                              </Stack>

                              <Stack direction="row" spacing={1.4} flexWrap="wrap" useFlexGap>
                                <Chip
                                  icon={<ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />}
                                  label={`${character.usageCount || 0} 대화`}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' }}
                                />
                                <Chip
                                  icon={<FavoriteBorderIcon sx={{ fontSize: 15 }} />}
                                  label={`${character.likes || 0} 좋아요`}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' }}
                                />
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </PageLayout>
  );
}
