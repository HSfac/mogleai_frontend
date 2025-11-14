'use client';

import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Grid,
  Divider,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteIcon from '@mui/icons-material/Delete';

type AdminUser = {
  _id: string;
  email: string;
  username: string;
  isVerified: boolean;
  createdCharacters: number;
};

type AdminCharacter = {
  _id: string;
  name: string;
  creator: string;
  isVerified: boolean;
  isPublic: boolean;
};

type AdminPayment = {
  _id: string;
  amount: number;
  status: string;
  user: string;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [adminToken, setAdminToken] = useState<string>('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [characters, setCharacters] = useState<AdminCharacter[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login?redirect=/admin');
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setAdminToken(token);
  }, [isAuthenticated, user, loading, router]);

  useEffect(() => {
    if (!adminToken) return;
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const config = { headers: { 'x-admin-token': adminToken } };
        const [usersRes, charactersRes, paymentsRes] = await Promise.all([
          api.get('/admin/users', config),
          api.get('/admin/characters', config),
          api.get('/admin/payments', config),
        ]);
        setUsers(usersRes.data);
        setCharacters(charactersRes.data);
        setPayments(paymentsRes.data);
      } catch (error) {
        console.error(error);
        setToast({ message: '관리자 데이터를 불러오는데 실패했습니다.', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [adminToken]);

  const stats = useMemo(() => ({
    users: users.length,
    characters: characters.length,
    payments: payments.length,
  }), [users.length, characters.length, payments.length]);

  const handleToggleCharacterPublic = async (characterId: string, makePublic: boolean) => {
    try {
      const config = { headers: { 'x-admin-token': adminToken } };
      await api.patch(`/admin/characters/${characterId}/public`, { isPublic: makePublic }, config);
      setToast({ message: '공개 상태를 변경했습니다.', severity: 'success' });
      // refresh
      const updated = await api.get('/admin/characters', config);
      setCharacters(updated.data);
    } catch (error) {
      console.error(error);
      setToast({ message: '처리 중 오류가 발생했습니다.', severity: 'error' });
    }
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: 28,
              color: '#fff',
              background: 'linear-gradient(135deg, rgba(255,95,155,0.95), rgba(255,214,227,0.95))',
              boxShadow: '0 30px 60px rgba(255, 95, 155, 0.35)',
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar sx={{ bgcolor: '#fff', color: '#ff5f9b' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    관리자 대시보드
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    사용자·캐릭터·결제 현황을 확인하고 빠르게 조율하세요.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip label={`사용자 ${stats.users}`} />
                  <Chip label={`캐릭터 ${stats.characters}`} />
                  <Chip label={`결제 ${stats.payments}`} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: '#ff5f9b' }} />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <SectionCard title="사용자 관리">
                    {users.slice(0, 4).map((adminUser) => (
                      <ActionRow key={adminUser._id} label={adminUser.username} value={adminUser.email}>
                        <Chip label={adminUser.isVerified ? '신뢰됨' : '미인증'} color="secondary" variant="outlined" />
                      </ActionRow>
                    ))}
                  </SectionCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <SectionCard title="캐릭터 관리">
                    {characters.slice(0, 4).map((character) => (
                      <ActionRow key={character._id} label={character.name} value={`by ${character.creator}`}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleToggleCharacterPublic(character._id, !character.isPublic)}
                          sx={{ borderRadius: 999, color: '#ff5f9b', borderColor: '#ff5f9b' }}
                        >
                          {character.isPublic ? '비공개' : '공개'}
                        </Button>
                      </ActionRow>
                    ))}
                  </SectionCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <SectionCard title="결제 현황">
                    {payments.slice(0, 4).map((payment) => (
                      <ActionRow key={payment._id} label={`결제 ${payment._id}`} value={`${payment.amount.toLocaleString()}원`}>
                        <Chip label={payment.status} color="secondary" />
                      </ActionRow>
                    ))}
                  </SectionCard>
                </Grid>
              </Grid>
            </>
          )}
        </Stack>

        <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
        </Snackbar>
      </Container>
    </PageLayout>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card
      sx={{
        borderRadius: 24,
        boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Stack spacing={1}>{children}</Stack>
      </CardContent>
    </Card>
  );
}

function ActionRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="subtitle1">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {value}
        </Typography>
      </Box>
      {children}
    </Stack>
  );
}
