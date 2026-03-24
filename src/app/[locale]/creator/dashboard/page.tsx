'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Divider,
  Grid,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import TokenIcon from '@mui/icons-material/Token';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InsightsIcon from '@mui/icons-material/Insights';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { characterService } from '@/services/character.service';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

const glassCardSx = {
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.09)',
  background: 'linear-gradient(180deg, rgba(18,22,34,0.94), rgba(10,13,22,0.9))',
  boxShadow: '0 28px 60px rgba(2,6,23,0.34)',
  backdropFilter: 'blur(18px)',
};

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { getLocalePath } = useLocaleNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [createdCharacters, setCreatedCharacters] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`${getLocalePath('/login')}?redirect=${encodeURIComponent(getLocalePath('/creator/dashboard'))}`);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [dashboard, myCharacters, earningsData] = await Promise.all([
          characterService.getCreatorDashboard(),
          characterService.getMyCharacters(),
          characterService.getCreatorEarnings(),
        ]);
        setStats(dashboard);
        setCreatedCharacters(myCharacters || []);
        setEarnings(earningsData?.earnings || []);
      } catch (error) {
        console.error(error);
        setToast({ severity: 'error', message: '대시보드 정보를 불러오는데 실패했습니다.' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getLocalePath, isAuthenticated, router]);

  const levelInfo = useMemo(() => {
    const creatorProgress = user?.creatorProgress;
    if (!user) {
      return {
        label: '로딩중',
        progress: 0,
        next: '대화 1,000회',
        badge: '시작 준비',
        progressLabel: '진행도 집계 중',
      };
    }

    if (creatorProgress) {
      const isPartner = user.creatorLevel === 'partner';
      const isLevelThree = user.creatorLevel === 'level3';

      return {
        label: creatorProgress.currentLabel,
        progress: creatorProgress.progressPercent,
        next: creatorProgress.nextRequirement || '최상위 혜택 적용 중',
        badge: isPartner
          ? '파트너 혜택 적용중'
          : creatorProgress.remainingConversations > 0
            ? `다음 단계까지 ${creatorProgress.remainingConversations.toLocaleString()}회`
            : isLevelThree
              ? '파트너 검토 대상'
              : '성장 중',
        progressLabel: isPartner
          ? '최고 레벨 혜택 적용 중'
          : isLevelThree
            ? '파트너 승격은 관리자 승인'
            : `${creatorProgress.progressPercent}% 진행`,
      };
    }

    switch (user.creatorLevel) {
      case 'partner':
        return {
          label: '공식 파트너',
          progress: 100,
          next: '관리자 협업 프로그램 유지',
          badge: '파트너 혜택 적용중',
          progressLabel: '최고 레벨 혜택 적용 중',
        };
      case 'level3':
        return {
          label: 'LV3 전문가',
          progress: 100,
          next: '관리자 승인으로 파트너 승격',
          badge: '최상위 크리에이터',
          progressLabel: '파트너 승격은 관리자 승인',
        };
      case 'level2':
        return {
          label: 'LV2 고급',
          progress: 72,
          next: '대화 10,000회',
          badge: '성장 중',
          progressLabel: '72% 진행',
        };
      case 'level1':
      default:
        return {
          label: 'LV1 입문',
          progress: 42,
          next: '대화 1,000회',
          badge: '첫 성장 구간',
          progressLabel: '42% 진행',
        };
    }
  }, [user]);

  const creatorBenefits = useMemo(() => {
    const creatorProgress = user?.creatorProgress;
    if (!user) {
      return {
        earningRate: '30%',
        slotLimit: '2개',
        slotUsage: '0/2 사용 중',
        nextUnlock: '대화 1,000회 달성 시 LV2 해금',
      };
    }

    if (creatorProgress) {
      const slotLimit =
        creatorProgress.maxCharacters === null
          ? '무제한'
          : `${creatorProgress.maxCharacters}개`;
      const slotUsage =
        creatorProgress.maxCharacters === null
          ? `${creatorProgress.activeCharacterCount || 0}개 운영 중`
          : `${creatorProgress.activeCharacterCount || 0}/${creatorProgress.maxCharacters} 사용 중`;

      return {
        earningRate: `${creatorProgress.earningRatePercent}%`,
        slotLimit,
        slotUsage,
        nextUnlock: creatorProgress.nextRequirement
          ? `${creatorProgress.nextRequirement} 달성 시 ${creatorProgress.nextLabel || '다음 단계'}`
          : '최상위 베네핏 적용 중',
      };
    }

    switch (user.creatorLevel) {
      case 'partner':
        return {
          earningRate: '60%',
          slotLimit: '무제한',
          slotUsage: `${createdCharacters.length}개 운영 중`,
          nextUnlock: '공식 배지와 관리자 협업 혜택 유지',
        };
      case 'level3':
        return {
          earningRate: '50%',
          slotLimit: '무제한',
          slotUsage: `${createdCharacters.length}개 운영 중`,
          nextUnlock: '파트너 승격 시 60% 수익 배분',
        };
      case 'level2':
        return {
          earningRate: '40%',
          slotLimit: '5개',
          slotUsage: `${createdCharacters.length}/5 사용 중`,
          nextUnlock: '대화 10,000회 달성 시 LV3 해금',
        };
      case 'level1':
      default:
        return {
          earningRate: '30%',
          slotLimit: '2개',
          slotUsage: `${createdCharacters.length}/2 사용 중`,
          nextUnlock: '대화 1,000회 달성 시 LV2 해금',
        };
    }
  }, [createdCharacters.length, user]);

  const creatorAnalytics = stats?.analytics;
  const characterAnalyticsMap = useMemo(
    () =>
      new Map(
        ((creatorAnalytics?.characterSummaries as any[]) || []).map((summary) => [
          summary.characterId,
          summary,
        ]),
      ),
    [creatorAnalytics],
  );
  const enrichedCharacters = useMemo(
    () =>
      createdCharacters.map((character) => ({
        ...character,
        analytics: characterAnalyticsMap.get(character._id),
      })),
    [characterAnalyticsMap, createdCharacters],
  );

  const headlineMetrics = useMemo(
    () => [
      {
        label: '누적 대화',
        value: stats?.stats?.totalConversations ?? stats?.stats?.totalUsage ?? 0,
        icon: <ChatIcon />,
        accent: '#7cc7ff',
        helper: '캐릭터 소비 시간',
      },
      {
        label: '누적 좋아요',
        value: stats?.stats?.totalLikes ?? 0,
        icon: <FavoriteBorderIcon />,
        accent: '#ff9ec2',
        helper: '팬 반응 지표',
      },
      {
        label: '누적 수익',
        value: stats?.stats?.totalEarnings ?? 0,
        icon: <TrendingUpIcon />,
        accent: '#8df2c2',
        helper: '토큰 정산 합계',
      },
    ],
    [stats],
  );

  const quickActions = useMemo(
    () => [
      {
        label: '새 캐릭터 제작',
        description: '새 콘셉트를 바로 올립니다.',
        icon: <AddCircleOutlineIcon />,
        onClick: () => router.push(getLocalePath('/characters/create')),
      },
      {
        label: '캐릭터 둘러보기',
        description: '현재 공개 페이지 톤을 점검합니다.',
        icon: <AutoAwesomeIcon />,
        onClick: () => router.push(getLocalePath('/characters')),
      },
    ],
    [getLocalePath, router],
  );

  const recentEarnings = earnings.slice(0, 4);
  const earningsSnapshot = recentEarnings.reduce((sum, earning) => sum + (earning.tokensEarned || 0), 0);
  const insightLines = useMemo(
    () => [
      `현재 레벨은 ${levelInfo.label}입니다.`,
      creatorAnalytics
        ? `재방문 유저 비중은 ${creatorAnalytics.returningUserRate}% (${creatorAnalytics.returningUsers}/${creatorAnalytics.uniqueUsers})입니다.`
        : `${createdCharacters.length}개의 캐릭터가 운영 중입니다.`,
      creatorAnalytics
        ? `최근 7일 활성 채팅 ${creatorAnalytics.activeChats7d}건, 신규 채팅 ${creatorAnalytics.newChats7d}건입니다.`
        : recentEarnings.length > 0
          ? `최근 ${recentEarnings.length}건 수익 합계는 ${earningsSnapshot} 토큰입니다.`
          : '아직 집계된 최근 수익이 없습니다.',
    ],
    [createdCharacters.length, creatorAnalytics, earningsSnapshot, levelInfo.label, recentEarnings.length],
  );

  const operationalMetrics = useMemo(
    () => [
      {
        label: '재방문율',
        value: `${creatorAnalytics?.returningUserRate ?? 0}%`,
        helper: `재방문 ${creatorAnalytics?.returningUsers ?? 0} / 전체 ${creatorAnalytics?.uniqueUsers ?? 0}`,
      },
      {
        label: '평균 세션 길이',
        value: `${creatorAnalytics?.avgMessagesPerChat ?? 0}`,
        helper: `메시지/채팅 · AI 응답 ${creatorAnalytics?.avgAiRepliesPerChat ?? 0}`,
      },
      {
        label: '짧은 세션 비율',
        value: `${creatorAnalytics?.shortSessionRate ?? 0}%`,
        helper: `깊은 세션 ${creatorAnalytics?.deepSessionRate ?? 0}% · 최근 7일 활성 ${creatorAnalytics?.activeChats7d ?? 0}`,
      },
    ],
    [creatorAnalytics],
  );

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress sx={{ color: '#ff5f9b' }} />
        </Box>
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
              'radial-gradient(circle at top left, rgba(255,95,155,0.18), transparent 30%), radial-gradient(circle at 86% 14%, rgba(124,199,255,0.14), transparent 26%)',
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
                position: 'relative',
                background:
                  'linear-gradient(135deg, rgba(255,95,155,0.92) 0%, rgba(255,164,197,0.82) 38%, rgba(124,199,255,0.34) 100%)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(120deg, rgba(255,255,255,0.18), transparent 36%, transparent 58%, rgba(255,255,255,0.1) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Grid container spacing={3} alignItems="stretch">
                  <Grid item xs={12} lg={7}>
                    <Stack spacing={3} sx={{ height: '100%', justifyContent: 'space-between' }}>
                      <Stack spacing={2.5}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Avatar
                            src={user?.profileImage}
                            sx={{
                              width: 94,
                              height: 94,
                              bgcolor: 'rgba(255,255,255,0.18)',
                              color: '#fff',
                              fontSize: '2rem',
                              fontWeight: 800,
                              border: '1px solid rgba(255,255,255,0.28)',
                              boxShadow: '0 18px 40px rgba(103, 27, 52, 0.28)',
                            }}
                          >
                            {user?.username?.[0] ?? 'C'}
                          </Avatar>
                          <Box>
                            <Chip
                              label={levelInfo.badge}
                              sx={{
                                mb: 1.5,
                                bgcolor: 'rgba(14,18,28,0.22)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.2)',
                                fontWeight: 700,
                              }}
                            />
                            <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.05 }}>
                              {user?.username || '크리에이터'}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1.2, color: 'rgba(255,255,255,0.86)', maxWidth: 560 }}>
                              캐릭터 반응, 수익 흐름, 성장 목표를 한 화면에서 바로 보도록 정리했습니다.
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
                          <Chip label={`현재 레벨: ${levelInfo.label}`} sx={heroChipSx} />
                          <Chip label={`다음 목표: ${levelInfo.next}`} sx={heroChipSx} />
                          <Chip label={`보유 캐릭터: ${createdCharacters.length}개`} sx={heroChipSx} />
                        </Stack>

                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 4,
                            bgcolor: 'rgba(12,16,24,0.18)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            backdropFilter: 'blur(12px)',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Box>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                                레벨 진행도
                              </Typography>
                              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                                {levelInfo.progressLabel}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.76)' }}>
                              {levelInfo.next}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={levelInfo.progress}
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
                        </Box>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        {quickActions.map((action) => (
                          <Button
                            key={action.label}
                            variant="contained"
                            startIcon={action.icon}
                            endIcon={<ArrowForwardIcon />}
                            onClick={action.onClick}
                            sx={{
                              justifyContent: 'space-between',
                              borderRadius: '12px',
                              px: 2,
                              py: 1.3,
                              bgcolor: 'rgba(12,16,24,0.26)',
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.18)',
                              boxShadow: 'none',
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: 'rgba(12,16,24,0.36)',
                                boxShadow: '0 12px 28px rgba(12,16,24,0.24)',
                              },
                            }}
                          >
                            <Stack alignItems="flex-start" spacing={0.2}>
                              <Typography fontWeight={700}>{action.label}</Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                {action.description}
                              </Typography>
                            </Stack>
                          </Button>
                        ))}
                      </Stack>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} lg={5}>
                    <Grid container spacing={2}>
                      {headlineMetrics.map((metric) => (
                        <Grid item xs={12} sm={4} lg={12} key={metric.label}>
                          <Box
                            sx={{
                              p: 2.25,
                              borderRadius: 4,
                              bgcolor: 'rgba(12,16,24,0.18)',
                              border: '1px solid rgba(255,255,255,0.18)',
                              backdropFilter: 'blur(14px)',
                              minHeight: 118,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.8,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: `${metric.accent}24`,
                                color: metric.accent,
                                width: 52,
                                height: 52,
                                border: `1px solid ${metric.accent}45`,
                              }}
                            >
                              {metric.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.76)' }}>
                                {metric.label}
                              </Typography>
                              <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.1 }}>
                                {metric.value?.toLocaleString() ?? '0'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.68)' }}>
                                {metric.helper}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={glassCardSx}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      sx={{ mb: 2.5 }}
                    >
                      <Box>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
                          내 캐릭터
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)', mt: 0.5 }}>
                          카드 밀도와 작업 버튼을 정리해서 상태 확인이 더 빠르게 보이도록 바꿨습니다.
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => router.push(getLocalePath('/characters/create'))}
                        sx={{
                          borderRadius: '12px',
                          borderColor: 'rgba(255,255,255,0.16)',
                          color: '#fff',
                          '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.04)' },
                        }}
                      >
                        새 캐릭터 추가
                      </Button>
                    </Stack>

                    <Grid container spacing={2}>
                      {enrichedCharacters.map((character) => (
                        <Grid item xs={12} md={6} key={character._id}>
                          <Card
                            sx={{
                              borderRadius: 4,
                              border: '1px solid rgba(255,255,255,0.08)',
                              bgcolor: 'rgba(255,255,255,0.03)',
                              boxShadow: 'none',
                              height: '100%',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                borderColor: 'rgba(255,159,194,0.3)',
                                boxShadow: '0 20px 40px rgba(6,10,20,0.24)',
                              },
                            }}
                          >
                            <CardContent sx={{ p: 2.25 }}>
                              <Stack spacing={2}>
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
                                  {(character.tags || []).slice(0, 3).map((tag: string) => (
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
                                  {character.isPublic !== undefined && (
                                    <Chip
                                      label={character.isPublic ? '공개중' : '비공개'}
                                      size="small"
                                      sx={{
                                        bgcolor: character.isPublic ? 'rgba(124,199,255,0.14)' : 'rgba(255,255,255,0.05)',
                                        color: character.isPublic ? '#7cc7ff' : 'rgba(255,255,255,0.72)',
                                        borderRadius: '12px',
                                      }}
                                    />
                                  )}
                                </Stack>

                                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                                  <MetricPill icon={<ChatIcon sx={{ fontSize: 15 }} />} label={`${character.usageCount || 0} 대화`} />
                                  <MetricPill icon={<FavoriteBorderIcon sx={{ fontSize: 15 }} />} label={`${character.likes || 0} 좋아요`} />
                                  <MetricPill icon={<TokenIcon sx={{ fontSize: 15 }} />} label={`${character.tokenEarnings || 0} 토큰`} />
                                </Stack>

                                {character.analytics ? (
                                  <Box
                                    sx={{
                                      p: 1.4,
                                      borderRadius: 3,
                                      bgcolor: 'rgba(255,255,255,0.04)',
                                      border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                  >
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                      <MetricPill
                                        icon={<TrendingUpIcon sx={{ fontSize: 15 }} />}
                                        label={`재방문 ${character.analytics.returningUserRate}%`}
                                      />
                                      <MetricPill
                                        icon={<ChatIcon sx={{ fontSize: 15 }} />}
                                        label={`평균 ${character.analytics.avgMessagesPerChat} msg`}
                                      />
                                      <MetricPill
                                        icon={<InsightsIcon sx={{ fontSize: 15 }} />}
                                        label={`짧은세션 ${character.analytics.shortSessionRate}%`}
                                      />
                                    </Stack>
                                    <Typography
                                      variant="caption"
                                      sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.64)' }}
                                    >
                                      최근 7일 활성 채팅 {character.analytics.activeChats7d}건 · 활성 유저 {character.analytics.activeUsers7d}명
                                    </Typography>
                                  </Box>
                                ) : null}

                                <Stack direction="row" spacing={1.2}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => router.push(getLocalePath(`/characters/${character._id}/edit`))}
                                    sx={outlineActionSx}
                                  >
                                    수정
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => router.push(getLocalePath(`/characters/${character._id}`))}
                                    sx={solidActionSx}
                                  >
                                    보기
                                  </Button>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}

                      {createdCharacters.length === 0 && (
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              borderRadius: 4,
                              border: '1px dashed rgba(255,255,255,0.16)',
                              bgcolor: 'rgba(255,255,255,0.03)',
                              p: 4,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                              아직 제작한 캐릭터가 없습니다
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)', mt: 1 }}>
                              첫 캐릭터를 만들면 여기서 반응과 성과를 한 번에 관리할 수 있습니다.
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddCircleOutlineIcon />}
                              sx={{ ...solidActionSx, mt: 2 }}
                              onClick={() => router.push(getLocalePath('/characters/create'))}
                            >
                              첫 캐릭터 만들기
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Stack spacing={3}>
                  <Card sx={glassCardSx}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar sx={{ width: 42, height: 42, bgcolor: 'rgba(124,199,255,0.14)', color: '#7cc7ff' }}>
                          <InsightsIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
                            성장 인사이트
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)' }}>
                            다음 액션이 바로 보이도록 정리했습니다.
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack spacing={1.25}>
                        {insightLines.map((line) => (
                          <Box
                            key={line}
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                              {line}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card sx={glassCardSx}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar sx={{ width: 42, height: 42, bgcolor: 'rgba(255,184,107,0.14)', color: '#ffbf6b' }}>
                          <TrendingUpIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
                            운영 지표
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)' }}>
                            대화 유지력과 재방문 흐름
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack spacing={1.25}>
                        {operationalMetrics.map((metric) => (
                          <Box
                            key={metric.label}
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                              {metric.label}
                            </Typography>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mt: 0.3 }}>
                              {metric.value}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)', mt: 0.2 }}>
                              {metric.helper}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card sx={glassCardSx}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar sx={{ width: 42, height: 42, bgcolor: 'rgba(141,242,194,0.14)', color: '#8df2c2' }}>
                          <TokenIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
                            현재 혜택
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)' }}>
                            지금 적용 중인 크리에이터 베네핏
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack spacing={1.25}>
                        {[
                          `수익 배분율 ${creatorBenefits.earningRate}`,
                          `캐릭터 슬롯 ${creatorBenefits.slotLimit} · ${creatorBenefits.slotUsage}`,
                          `다음 해금: ${creatorBenefits.nextUnlock}`,
                        ].map((line) => (
                          <Box
                            key={line}
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                              {line}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card sx={glassCardSx}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
                            최근 수익
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)' }}>
                            최근 지급 흐름과 대화량
                          </Typography>
                        </Box>
                        <Chip label={`${earningsSnapshot} 토큰`} sx={heroChipSx} />
                      </Stack>

                      <Stack spacing={1.5}>
                        {recentEarnings.map((earning) => (
                          <Box
                            key={earning._id}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.64)' }}>
                                  {earning.period}
                                </Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                                  {earning.tokensEarned} 토큰
                                </Typography>
                              </Box>
                              <BadgeLabel value={earning.tokensEarned} />
                            </Stack>
                            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <MetricPill icon={<ChatIcon sx={{ fontSize: 15 }} />} label={`${earning.conversationCount} 대화`} />
                              <MetricPill icon={<TokenIcon sx={{ fontSize: 15 }} />} label={`${earning.tokensEarned} 토큰`} />
                            </Stack>
                          </Box>
                        ))}

                        {recentEarnings.length === 0 && (
                          <Box
                            sx={{
                              borderRadius: 3,
                              border: '1px dashed rgba(255,255,255,0.14)',
                              p: 3,
                              textAlign: 'center',
                              color: 'rgba(255,255,255,0.62)',
                            }}
                          >
                            아직 집계된 최근 수익이 없습니다.
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Container>

        <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
        </Snackbar>
      </Box>
    </PageLayout>
  );
}

function BadgeLabel({ value }: { value: number }) {
  return (
    <Chip
      label={`수익 ${value}`}
      sx={{
        borderRadius: '12px',
        fontWeight: 700,
        bgcolor: 'rgba(255,159,194,0.16)',
        color: '#ff9ec2',
        border: '1px solid rgba(255,159,194,0.22)',
      }}
    />
  );
}

function MetricPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.8,
        bgcolor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.82)',
      }}
    >
      {icon}
      <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}

const heroChipSx = {
  borderRadius: '12px',
  bgcolor: 'rgba(12,16,24,0.2)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.16)',
  fontWeight: 700,
};

const outlineActionSx = {
  borderRadius: '12px',
  borderColor: 'rgba(255,255,255,0.14)',
  color: '#fff',
  textTransform: 'none',
  '&:hover': {
    borderColor: 'rgba(255,255,255,0.28)',
    bgcolor: 'rgba(255,255,255,0.04)',
  },
};

const solidActionSx = {
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 700,
  bgcolor: '#ff5f9b',
  color: '#fff',
  boxShadow: '0 14px 30px rgba(255,95,155,0.22)',
  '&:hover': {
    bgcolor: '#ff4c8d',
    boxShadow: '0 18px 34px rgba(255,95,155,0.28)',
  },
};
