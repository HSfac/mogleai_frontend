'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Button,
  CircularProgress,
  Avatar,
  Grow,
  keyframes,
} from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarIcon from '@mui/icons-material/Star';
import api from '@/lib/api';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

// 애니메이션 키프레임
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
`;

// 순위별 색상 및 아이콘
const RANK_CONFIG = {
  1: {
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #fff9e6 0%, #fff5cc 50%, #ffecb3 100%)',
    borderColor: '#FFD700',
    icon: '👑',
    label: '1st',
    shadowColor: 'rgba(255, 215, 0, 0.4)',
  },
  2: {
    color: '#C0C0C0',
    bgGradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
    borderColor: '#C0C0C0',
    icon: '🥈',
    label: '2nd',
    shadowColor: 'rgba(192, 192, 192, 0.4)',
  },
  3: {
    color: '#CD7F32',
    bgGradient: 'linear-gradient(135deg, #fff5eb 0%, #ffe8d6 50%, #ffdcc5 100%)',
    borderColor: '#CD7F32',
    icon: '🥉',
    label: '3rd',
    shadowColor: 'rgba(205, 127, 50, 0.4)',
  },
};

interface LeaderboardEntry {
  rank: number;
  character: {
    _id: string;
    name: string;
    description: string;
    profileImage?: string;
    tags?: string[];
  };
  creator: {
    _id: string;
    username: string;
  };
  stats: {
    usageCount?: number;
    likes?: number;
    conversationCount?: number;
  };
}

const periods: { label: string; value: 'all-time' | 'monthly' | 'weekly' | 'daily' }[] = [
  { label: '전체', value: 'all-time' },
  { label: '이번 달', value: 'monthly' },
  { label: '이번 주', value: 'weekly' },
  { label: '오늘', value: 'daily' },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'all-time' | 'monthly' | 'weekly' | 'daily'>('all-time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { getLocalePath } = useLocaleNavigation();

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/characters/leaderboard/ranking?period=${period}&limit=50`);
        setLeaderboard(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, [period]);

  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const rest = useMemo(() => leaderboard.slice(3), [leaderboard]);

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 헤더 카드 - 글래스모피즘 스타일 */}
        <Card
          sx={{
            borderRadius: 6,
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 5 },
            mb: 5,
            background: 'linear-gradient(135deg, rgba(255,95,155,0.95) 0%, rgba(255,140,180,0.9) 50%, rgba(255,180,200,0.85) 100%)',
            color: '#fff',
            boxShadow: '0 20px 60px rgba(255, 95, 155, 0.3), 0 8px 20px rgba(255, 95, 155, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 90% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 32, color: '#FFD700' }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    캐릭터 리더보드
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    가장 많은 사랑을 받은 캐릭터들
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* 기간 필터 탭 */}
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 3,
                p: 0.75,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Stack direction="row" spacing={0.5}>
                {periods.map((item) => (
                  <Button
                    key={item.value}
                    onClick={() => setPeriod(item.value)}
                    sx={{
                      px: { xs: 2, md: 3 },
                      py: 1,
                      borderRadius: 2.5,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      bgcolor: period === item.value ? 'rgba(255,255,255,0.25)' : 'transparent',
                      boxShadow: period === item.value ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: period === item.value ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Stack>

          {/* 통계 칩 */}
          <Stack direction="row" spacing={2} mt={3} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<WhatshotIcon sx={{ color: '#fff !important' }} />}
              label={`${leaderboard.length}명의 인기 캐릭터`}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip
              icon={<TrendingUpIcon sx={{ color: '#fff !important' }} />}
              label={periods.find((p) => p.value === period)?.label + ' 기준'}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            />
          </Stack>
        </Card>

        {/* 포디움 스타일 Top 3 */}
        {topThree.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <StarIcon sx={{ color: '#FFD700' }} />
              <Typography variant="h6" fontWeight={700} color="text.primary">
                TOP 3 인기 캐릭터
              </Typography>
            </Stack>

            {/* 포디움 레이아웃 - 2위, 1위, 3위 순서 */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: { xs: 1.5, md: 3 },
                flexWrap: { xs: 'wrap', md: 'nowrap' },
              }}
            >
              {/* 순서: 2위, 1위, 3위 (포디움 스타일) */}
              {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((entry, displayIndex) => {
                const actualRank = entry.rank;
                const config = RANK_CONFIG[actualRank as keyof typeof RANK_CONFIG];
                const isFirst = actualRank === 1;

                return (
                  <Grow in key={entry.character._id} timeout={400 + displayIndex * 200}>
                    <Card
                      sx={{
                        width: { xs: '100%', sm: isFirst ? 280 : 240 },
                        maxWidth: { xs: 280, sm: 'none' },
                        borderRadius: 5,
                        border: `3px solid ${config?.borderColor || '#ddd'}`,
                        background: config?.bgGradient || '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isFirst ? 'scale(1.05)' : 'scale(1)',
                        order: { xs: displayIndex, md: displayIndex },
                        animation: isFirst ? `${pulseGlow} 3s infinite` : 'none',
                        '&:hover': {
                          transform: isFirst ? 'scale(1.08) translateY(-8px)' : 'scale(1.03) translateY(-8px)',
                          boxShadow: `0 20px 50px ${config?.shadowColor || 'rgba(0,0,0,0.2)'}`,
                        },
                      }}
                      onClick={() => router.push(`/characters/${entry.character._id}`)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: isFirst ? 4 : 3 }}>
                        {/* 순위 배지 */}
                        <Box
                          sx={{
                            position: 'relative',
                            display: 'inline-block',
                            mb: 2,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: isFirst ? '3rem' : '2.5rem',
                              lineHeight: 1,
                              animation: isFirst ? `${floatAnimation} 3s ease-in-out infinite` : 'none',
                            }}
                          >
                            {config?.icon}
                          </Typography>
                        </Box>

                        {/* 아바타 */}
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                          <Avatar
                            src={entry.character.profileImage}
                            sx={{
                              width: isFirst ? 120 : 100,
                              height: isFirst ? 120 : 100,
                              border: `4px solid ${config?.borderColor || '#ddd'}`,
                              boxShadow: `0 8px 24px ${config?.shadowColor || 'rgba(0,0,0,0.15)'}`,
                            }}
                          >
                            {entry.character.name[0]}
                          </Avatar>
                          {/* 순위 번호 배지 */}
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: -8,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              bgcolor: config?.borderColor || '#ddd',
                              color: '#fff',
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            }}
                          >
                            {config?.label}
                          </Box>
                        </Box>

                        {/* 캐릭터 정보 */}
                        <Typography variant={isFirst ? 'h5' : 'h6'} fontWeight={800} gutterBottom>
                          {entry.character.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mb: 2,
                            cursor: entry.creator?._id ? 'pointer' : 'default',
                            '&:hover': entry.creator?._id ? { color: '#ff5f9b' } : undefined,
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (entry.creator?._id) {
                              router.push(getLocalePath(`/creators/${entry.creator._id}`));
                            }
                          }}
                        >
                          by {entry.creator.username}
                        </Typography>

                        {/* 통계 */}
                        <Stack direction="row" justifyContent="center" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            icon={<ChatBubbleIcon sx={{ fontSize: 14 }} />}
                            label={`${entry.stats.usageCount?.toLocaleString() ?? 0}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255, 95, 155, 0.1)',
                              color: '#c3006e',
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            icon={<FavoriteIcon sx={{ fontSize: 14, color: '#ff5f9b' }} />}
                            label={`${entry.stats.likes?.toLocaleString() ?? 0}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255, 95, 155, 0.1)',
                              color: '#c3006e',
                              fontWeight: 600,
                            }}
                          />
                        </Stack>

                        {/* 설명 */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5,
                          }}
                        >
                          {entry.character.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                );
              })}
            </Box>
          </Box>
        )}

        {/* 나머지 순위 목록 */}
        {rest.length > 0 && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <TrendingUpIcon sx={{ color: '#ff5f9b' }} />
              <Typography variant="h6" fontWeight={700} color="text.primary">
                더 많은 인기 캐릭터
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              {rest.map((entry, index) => (
                <Grow in key={entry.rank} timeout={300 + index * 50}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      border: '1px solid rgba(255, 95, 155, 0.1)',
                      bgcolor: '#fff',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      px: { xs: 2, md: 3 },
                      py: 2,
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        boxShadow: '0 8px 24px rgba(255, 95, 155, 0.15)',
                        borderColor: 'rgba(255, 95, 155, 0.3)',
                      },
                    }}
                    onClick={() => router.push(getLocalePath(`/characters/${entry.character._id}`))}
                  >
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, md: 2.5 }}>
                      {/* 순위 */}
                      <Box
                        sx={{
                          minWidth: { xs: 40, md: 52 },
                          height: { xs: 40, md: 52 },
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 95, 155, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h6" fontWeight={800} color="#ff5f9b">
                          {entry.rank}
                        </Typography>
                      </Box>

                      {/* 아바타 */}
                      <Avatar
                        src={entry.character.profileImage}
                        sx={{
                          width: { xs: 48, md: 56 },
                          height: { xs: 48, md: 56 },
                          border: '3px solid rgba(255, 95, 155, 0.15)',
                        }}
                      >
                        {entry.character.name[0]}
                      </Avatar>

                      {/* 캐릭터 정보 */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                          <Typography variant="subtitle1" fontWeight={700} noWrap>
                            {entry.character.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              cursor: entry.creator?._id ? 'pointer' : 'default',
                              '&:hover': entry.creator?._id ? { color: '#ff5f9b' } : undefined,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (entry.creator?._id) {
                                router.push(getLocalePath(`/creators/${entry.creator._id}`));
                              }
                            }}
                          >
                            by {entry.creator.username}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: { xs: 'none', sm: '-webkit-box' },
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1,
                          }}
                        >
                          {entry.character.description}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {entry.character.tags?.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: '0.7rem',
                                bgcolor: 'rgba(255, 95, 155, 0.06)',
                                color: '#888',
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      {/* 통계 */}
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'flex-end', sm: 'center' }}
                      >
                        <Chip
                          icon={<ChatBubbleIcon sx={{ fontSize: 14 }} />}
                          label={`${(entry.stats.conversationCount ?? entry.stats.usageCount ?? 0).toLocaleString()}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 95, 155, 0.08)',
                            color: '#c3006e',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: '#ff5f9b' },
                          }}
                        />
                        <Chip
                          icon={<FavoriteIcon sx={{ fontSize: 14 }} />}
                          label={`${(entry.stats.likes ?? 0).toLocaleString()}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 95, 155, 0.08)',
                            color: '#c3006e',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: '#ff5f9b' },
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grow>
              ))}
            </Stack>
          </Box>
        )}

        {/* 빈 상태 */}
        {leaderboard.length === 0 && (
          <Card
            sx={{
              borderRadius: 5,
              p: 6,
              textAlign: 'center',
              bgcolor: 'rgba(255, 95, 155, 0.03)',
              border: '2px dashed rgba(255, 95, 155, 0.2)',
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 64, color: 'rgba(255, 95, 155, 0.3)', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
              아직 기록된 캐릭터가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              캐릭터들과 대화하고 첫 번째 순위를 만들어보세요!
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push(getLocalePath('/characters'))}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #ff5f9b 0%, #ff8fab 100%)',
                boxShadow: '0 4px 15px rgba(255, 95, 155, 0.35)',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff4d8d 0%, #ff7fa0 100%)',
                },
              }}
            >
              캐릭터 탐색하기
            </Button>
          </Card>
        )}
      </Container>
    </PageLayout>
  );
}
