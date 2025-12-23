'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { characterService } from '@/services/character.service';
import { chatService } from '@/services/chatService';
import { paymentService } from '@/services/paymentService';

const tabLabels = ['내가 만든 캐릭터', '즐겨찾기', '최근 대화', '결제 내역'];

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, refreshUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [createdCharacters, setCreatedCharacters] = useState<any[]>([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [userRes, createdRes, favoriteRes, chatRes, paymentRes] = await Promise.all([
          userService.getMe(),
          characterService.getMyCharacters(),
          userService.getFavorites(),
          chatService.getChats(),
          paymentService.getPaymentHistory(),
        ]);

        setUserData(userRes);
        setCreatedCharacters(createdRes || []);
        setFavoriteCharacters(favoriteRes || []);
        setRecentChats((chatRes || []).slice(0, 5));
        setPaymentHistory(paymentRes || []);
      } catch (error: any) {
        console.error('프로필 데이터를 불러오는데 실패했습니다:', error);
        setToast({ message: '프로필 정보를 불러오는데 실패했습니다.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  const stats = useMemo(() => ({
    tokens: userData?.tokens ?? 0,
    conversations: userData?.totalConversations ?? 0,
    favorites: favoriteCharacters.length,
    created: createdCharacters.length,
  }), [userData, favoriteCharacters.length, createdCharacters.length]);

  const handleOpenEditDialog = () => {
    setEditForm({ username: authUser?.username || '' });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditForm({ username: '' });
  };

  const handleSaveProfile = async () => {
    if (!editForm.username.trim()) {
      setToast({ message: '사용자 이름을 입력해주세요.', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      await userService.updateMe({ username: editForm.username.trim() });
      setToast({ message: '프로필이 업데이트되었습니다.', severity: 'success' });
      handleCloseEditDialog();
      // 프로필 데이터 새로고침 (로컬 + 전역 상태)
      const userRes = await userService.getMe();
      setUserData(userRes);
      await refreshUser();
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      setToast({ message: '프로필 업데이트에 실패했습니다.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6">로그인이 필요합니다.</Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: '#ff5f9b' }} />
          </Box>
        ) : (
          <>
            <Card
              sx={{
                borderRadius: 3,
                px: { xs: 3, md: 4 },
                py: 4,
                mb: 4,
                background: 'linear-gradient(135deg, #ff5f9b 0%, #ff8fb3 100%)',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(255, 95, 155, 0.25)',
                border: 'none',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                <Avatar
                  src={authUser?.profileImage}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#fff',
                    color: '#ff5f9b',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    border: '3px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {authUser?.username?.slice(0, 1) ?? 'U'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {authUser?.username || '사용자'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                    {authUser?.email}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={handleOpenEditDialog}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: '#fff',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    프로필 편집
                  </Button>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap" mt={3} gap={1}>
                {[
                  { label: '보유 토큰', value: stats.tokens },
                  { label: '대화 수', value: stats.conversations },
                  { label: '즐겨찾기', value: stats.favorites },
                  { label: '생성 캐릭터', value: stats.created },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      minWidth: 100,
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {item.value.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>

            <Tabs
              value={tabValue}
              onChange={(event, value) => setTabValue(value)}
              textColor="secondary"
              indicatorColor="secondary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3 }}
            >
              {tabLabels.map((label) => (
                <Tab key={label} label={label} />
              ))}
            </Tabs>

            {tabValue === 0 && (
              <>
                <Grid container spacing={3}>
                  {createdCharacters.map((character) => (
                    <Grid item xs={12} sm={6} md={4} key={character._id}>
                      <Card
                        sx={{
                          borderRadius: 2.5,
                          border: '1px solid rgba(255, 95, 155, 0.15)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(255, 95, 155, 0.15)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {character.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
                            {character.description || '설명 정보가 없습니다.'}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            {character.tags?.slice(0, 2).map((tag: string) => (
                              <Chip key={tag} label={tag} size="small" sx={{ borderRadius: 1.5, fontSize: '0.75rem' }} />
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {createdCharacters.length === 0 && (
                  <Paper sx={{ p: 3, mt: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <Typography variant="body2" color="text.secondary">
                      아직 만든 캐릭터가 없습니다. 캐릭터를 만들고 첫 대화를 시작해보세요.
                    </Typography>
                  </Paper>
                )}
              </>
            )}

            {tabValue === 1 && (
              <List>
                {favoriteCharacters.map((character) => (
                  <ListItem key={character._id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ffe4f5', color: '#c3006e' }}>
                        {character.name?.slice(0, 1)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={character.name}
                      secondary={character.description}
                    />
                    <Chip label="즐겨찾기" variant="outlined" sx={{ borderColor: '#ff5f9b', color: '#ff5f9b' }} />
                  </ListItem>
                ))}
                {favoriteCharacters.length === 0 && (
                  <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <Typography variant="body2" color="text.secondary">
                      관심 있는 캐릭터를 즐겨찾기에 등록하면 이곳에 모아 보여드립니다.
                    </Typography>
                  </Paper>
                )}
              </List>
            )}

            {tabValue === 2 && (
              <List>
                {recentChats.map((chat) => (
                  <ListItem key={chat._id} button onClick={() => router.push(`/chat/${chat._id}`)}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ffe4f5', color: '#c3006e' }}>
                        {chat.characterInfo?.name?.slice(0, 1) || 'C'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={chat.characterInfo?.name || '알 수 없는'}
                      secondary={`마지막 대화: ${
                        chat.lastActivity ? new Date(chat.lastActivity).toLocaleString() : '정보 없음'
                      }`}
                    />
                  </ListItem>
                ))}
                {recentChats.length === 0 && (
                  <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <Typography variant="body2" color="text.secondary">
                      대화가 없습니다. 새로운 캐릭터와 대화를 시작해보세요.
                    </Typography>
                  </Paper>
                )}
              </List>
            )}

            {tabValue === 3 && (
              <Grid container spacing={3}>
                {paymentHistory.map((payment) => (
                  <Grid item xs={12} md={6} key={payment._id}>
                    <Card
                      sx={{
                        borderRadius: 2.5,
                        border: '1px solid rgba(255, 95, 155, 0.12)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="subtitle2" fontWeight={600}>
                            {payment.paymentId}
                          </Typography>
                          <Chip label={payment.status} size="small" sx={{ borderRadius: 1.5 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {payment.tokens} 토큰 · {payment.amount?.toLocaleString()}원
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {paymentHistory.length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="body2" color="text.secondary">
                        결제 기록이 없습니다. 토큰을 구매하면 여기에 기록됩니다.
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </>
        )}

        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>프로필 편집</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="사용자 이름"
              type="text"
              fullWidth
              variant="outlined"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseEditDialog}
              sx={{ color: 'text.secondary' }}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveProfile}
              variant="contained"
              disabled={saving}
              sx={{
                bgcolor: '#ff5f9b',
                '&:hover': { bgcolor: '#e54d87' },
                borderRadius: 2,
                px: 3,
              }}
            >
              {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '저장'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!toast}
          autoHideDuration={4000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
        </Snackbar>
      </Container>
    </PageLayout>
  );
}
