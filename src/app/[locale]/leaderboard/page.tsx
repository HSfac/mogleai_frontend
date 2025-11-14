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
} from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '@/lib/api';

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
        <Card
          sx={{
            borderRadius: 28,
            px: { xs: 3, md: 4 },
            py: 4,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,95,155,0.95), rgba(255,214,227,0.95))',
            color: '#fff',
            boxShadow: '0 30px 60px rgba(255, 95, 155, 0.35)',
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              캐릭터 리더보드
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              가장 많은 사랑을 받은 캐릭터들의 최근 순위를 확인하고 바로 대화해보세요.
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={3}>
            {periods.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                clickable
                color={period === item.value ? 'secondary' : 'default'}
                onClick={() => setPeriod(item.value)}
                sx={{ borderRadius: 10, px: 2 }}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={2} mt={3} flexWrap="wrap">
            <Chip label={`현재 기간: ${periods.find((p) => p.value === period)?.label}`} />
            <Chip label={`상위 캐릭터: ${leaderboard.length}`} />
          </Stack>
        </Card>

        {topThree.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {topThree.map((entry, index) => (
              <Grid item xs={12} sm={index === 1 ? 12 : 6} md={index === 1 ? 6 : 4} key={entry.character._id}>
                <Card
                  sx={{
                    borderRadius: 24,
                    border: `2px solid ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}`,
                    boxShadow: '0 15px 35px rgba(255, 95, 155, 0.18)',
                    cursor: 'pointer',
                    background: index === 0 ? 'linear-gradient(135deg, #fff5e6, #fff)' : '#fff',
                  }}
                  onClick={() => router.push(`/characters/${entry.character._id}`)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      src={entry.character.profileImage}
                      sx={{
                        width: index === 1 ? 120 : 100,
                        height: index === 1 ? 120 : 100,
                        mx: 'auto',
                        mb: 2,
                        border: '3px solid rgba(255, 95, 155, 0.4)',
                      }}
                    />
                    <Typography variant={index === 0 ? 'h5' : 'h6'} fontWeight={700}>
                      {entry.character.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      by {entry.creator.username}
                    </Typography>
                    <Stack direction="row" justifyContent="center" spacing={1} mt={2}>
                      <Chip label={`${entry.stats.usageCount?.toLocaleString() ?? 0} 대화`} size="small" />
                      <Chip label={`${entry.stats.likes?.toLocaleString() ?? 0} 좋아요`} size="small" color="secondary" />
                    </Stack>
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        {entry.character.description.length > 80
                          ? `${entry.character.description.slice(0, 80)}...`
                          : entry.character.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Stack spacing={2}>
          {rest.map((entry) => (
            <Card
              key={entry.rank}
              sx={{
                borderRadius: 22,
                border: '1px solid rgba(255, 95, 155, 0.2)',
                boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
                px: 2,
                py: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-3px)' },
              }}
              onClick={() => router.push(`/characters/${entry.character._id}`)}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ minWidth: 52, textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight={700} color="#ff5f9b">
                    {entry.rank}
                  </Typography>
                </Box>
                <Avatar src={entry.character.profileImage} sx={{ width: 56, height: 56 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {entry.character.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entry.character.description.length > 80
                      ? `${entry.character.description.slice(0, 80)}...`
                      : entry.character.description}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    {entry.character.tags?.slice(0, 2).map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                </Box>
                <Stack direction="column" spacing={0.5} alignItems="flex-end">
                  <Chip label={`${entry.stats.conversationCount ?? entry.stats.usageCount ?? 0} 대화`} size="small" />
                  <Chip label={`${entry.stats.likes ?? 0} 좋아요`} size="small" color="secondary" />
                </Stack>
              </Stack>
            </Card>
          ))}
          {rest.length === 0 && (
            <Box textAlign="center" py={6}>
              <Typography variant="body2" color="text.secondary">
                아직 기록된 캐릭터가 없습니다.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 2, borderRadius: 999 }}
                onClick={() => router.push('/characters')}
              >
                캐릭터 탐색하기
              </Button>
            </Box>
          )}
        </Stack>
      </Container>
    </PageLayout>
  );
}
