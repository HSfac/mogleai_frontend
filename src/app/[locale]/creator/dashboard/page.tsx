'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import TokenIcon from '@mui/icons-material/Token';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { characterService } from '@/services/character.service';

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [createdCharacters, setCreatedCharacters] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/creator/dashboard');
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
  }, [isAuthenticated, router]);

  const levelInfo = useMemo(() => {
    if (!user) return { label: '로딩중', progress: 40, next: '캐릭터 1개 만들기' };
    switch (user.creatorLevel) {
      case 'level3':
        return { label: 'LV3 전문가', progress: 100, next: '모든 기능 해제' };
      case 'level2':
        return { label: 'LV2 고급', progress: 70, next: 'LV3 달성: 인기 캐릭터 3개' };
      case 'level1':
      default:
        return { label: 'LV1 입문', progress: 40, next: 'LV2 달성: 인기 캐릭터 1개' };
    }
  }, [user]);

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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: 28,
              background: 'linear-gradient(135deg, rgba(255,95,155,0.95), rgba(255,214,227,0.95))',
              color: '#fff',
              boxShadow: '0 30px 60px rgba(255, 95, 155, 0.35)',
            }}
          >
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                <Avatar
                  src={user?.profileImage}
                  sx={{ width: 96, height: 96, bgcolor: '#fff', color: '#ff5f9b', fontWeight: 700 }}
                >
                  {user?.username?.[0] ?? 'C'}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {user?.username || '크리에이터'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    최고 레벨의 크리에이터 경험을 만들어가세요.
                  </Typography>
                </Box>
                <Button variant="outlined" color="inherit" sx={{ borderRadius: 999, ml: 'auto' }}>
                  Insights 공유
                </Button>
              </Stack>
              <Stack direction="row" spacing={2} mt={3} flexWrap="wrap">
                <Chip label={`레벨: ${levelInfo.label}`} />
                <Chip label={`다음 목표: ${levelInfo.next}`} />
              </Stack>
              <Box mt={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {levelInfo.progress === 100 ? '최고 레벨 달성!' : '다음 레벨까지 얼마나 남았나요?'}
                </Typography>
                <LinearProgress variant="determinate" value={levelInfo.progress} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {[
              { label: '대화 수', value: stats?.stats?.totalConversations ?? stats?.stats?.totalUsage, icon: <ChatIcon />, accent: '#ffc0d6' },
              { label: '좋아요', value: stats?.stats?.totalLikes, icon: <TokenIcon />, accent: '#ffd7f2' },
              { label: '수익', value: stats?.stats?.totalEarnings, icon: <TrendingUpIcon />, accent: '#ffe8f3' },
            ].map((metric) => (
              <Grid item xs={12} md={4} key={metric.label}>
                <Card
                  sx={{
                    borderRadius: 20,
                    border: '1px solid rgba(255, 95, 155, 0.25)',
                    background: '#fff',
                    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: metric.accent, color: '#ff5f9b' }}>
                        {metric.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {metric.label}
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {metric.value?.toLocaleString() ?? '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={700}>
              내 캐릭터
            </Typography>
            <Grid container spacing={3}>
              {createdCharacters.map((character) => (
                <Grid item xs={12} md={4} key={character._id}>
                  <Card
                    sx={{
                      borderRadius: 20,
                      border: '1px solid rgba(255, 95, 155, 0.2)',
                      boxShadow: '0 12px 30px rgba(255, 95, 155, 0.12)',
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={character.profileImage} sx={{ bgcolor: '#ffe4f5', color: '#c3006e', width: 56, height: 56 }}>
                          {character.name?.slice(0, 1)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {character.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {character.tags?.slice(0, 2).join(', ')}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 48 }}>
                        {character.description || '설명이 없습니다.'}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={2}>
                        <Button size="small" variant="outlined" sx={{ borderRadius: 999 }}>
                          수정
                        </Button>
                        <Button size="small" variant="contained" color="secondary" sx={{ borderRadius: 999 }}>
                          보기
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {createdCharacters.length === 0 && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 20, p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      아직 제작한 캐릭터가 없습니다. 새로운 캐릭터를 만들어보세요!
                    </Typography>
                    <Button variant="contained" color="secondary" sx={{ mt: 2, borderRadius: 999 }} onClick={() => router.push('/characters/create')}>
                      캐릭터 만들기
                    </Button>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Stack>

          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={700}>
              최근 수익
            </Typography>
            {earnings.slice(0, 3).map((earning) => (
              <Card
                key={earning._id}
                sx={{
                  borderRadius: 18,
                  border: '1px solid rgba(255, 95, 155, 0.18)',
                  boxShadow: '0 10px 30px rgba(255, 95, 155, 0.1)',
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack>
                      <Typography variant="subtitle2" color="text.secondary">
                        {earning.period}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {earning.tokensEarned} 토큰
                      </Typography>
                    </Stack>
                    <BadgeLabel value={earning.tokensEarned} />
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={2}>
                    <Chip label={`${earning.conversationCount} 대화`} />
                    <Chip label={`${earning.tokensEarned} 토큰`} color="secondary" />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Container>

      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </PageLayout>
  );
}

function BadgeLabel({ value }: { value: number }) {
  return (
    <Chip
      label={`수익 ${value}`}
      color="secondary"
      sx={{ borderRadius: 999, fontWeight: 600 }}
    />
  );
}
