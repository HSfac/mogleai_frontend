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
  Tooltip,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { characterService } from '@/services/character.service';
import { chatService } from '@/services/chatService';
import { paymentService } from '@/services/paymentService';
import { authService } from '@/services/authService';

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
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: '' });
  const [saving, setSaving] = useState(false);

  // 성인인증 관련 상태
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

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

  // KCP 인증 결과 메시지 수신 핸들러
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'KCP_CERT_RESULT') {
        if (event.data.success && event.data.data) {
          try {
            // 인증 결과를 서버에 저장
            await authService.completeAdultVerification({
              ci: event.data.data.ci,
              name: event.data.data.name,
              birthDate: event.data.data.birthDate,
            });

            setToast({ message: '성인인증이 완료되었습니다.', severity: 'success' });
            // 사용자 정보 새로고침
            await refreshUser();
            const userRes = await userService.getMe();
            setUserData(userRes);
          } catch (error: any) {
            console.error('인증 정보 저장 실패:', error);
            setToast({ message: error.response?.data?.message || '인증 정보 저장에 실패했습니다.', severity: 'error' });
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshUser]);

  // KCP 성인인증 시작
  const handleVerifyAdult = async () => {
    setVerifying(true);
    try {
      // 1. 인증 상태 확인
      const statusResult = await authService.getAdultVerificationStatus();

      if (!statusResult.kcpConfigured) {
        setToast({ message: 'KCP 본인인증이 설정되지 않았습니다. 관리자에게 문의하세요.', severity: 'error' });
        setVerifying(false);
        return;
      }

      // 2. KCP 인증 팝업 열기
      const popupWidth = 500;
      const popupHeight = 600;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;

      const popupUrl = authService.getKcpPopupUrl();
      const popup = window.open(
        popupUrl,
        'kcpCertification',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (popup) {
        setToast({ message: '본인인증 창이 열렸습니다. 인증을 완료해주세요.', severity: 'info' });
      } else {
        setToast({ message: '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.', severity: 'error' });
      }

      setVerifyDialogOpen(false);
    } catch (error: any) {
      console.error('성인인증 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '인증에 실패했습니다.';
      setToast({ message: errorMessage, severity: 'error' });
    } finally {
      setVerifying(false);
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
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h5" fontWeight={700}>
                      {authUser?.username || '사용자'}
                    </Typography>
                    {authUser?.isAdultVerified && (
                      <Tooltip title="19세 이상 인증 완료" arrow>
                        <Chip
                          icon={<VerifiedUserIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
                          label="19+"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.25)',
                            color: '#fff',
                            fontWeight: 700,
                            height: 26,
                            '& .MuiChip-icon': { color: '#fff' },
                          }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
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

            {/* 19세 인증 안내 카드 */}
            {!authUser?.isAdultVerified && (
              <Card
                sx={{
                  borderRadius: 2.5,
                  mb: 3,
                  border: '1px solid rgba(255, 95, 155, 0.3)',
                  background: 'linear-gradient(135deg, rgba(255,95,155,0.05) 0%, rgba(255,143,179,0.05) 100%)',
                }}
              >
                <CardContent sx={{ py: 2.5 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255, 95, 155, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ShieldIcon sx={{ color: '#ff5f9b', fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        19세 이상 인증하고 더 많은 콘텐츠를 즐겨보세요
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        성인 인증을 완료하면 19+ 캐릭터 생성 및 대화가 가능합니다.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => setVerifyDialogOpen(true)}
                      sx={{
                        bgcolor: '#ff5f9b',
                        '&:hover': { bgcolor: '#e54d87' },
                        borderRadius: 2,
                        px: 3,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      인증하기
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

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

        {/* 성인인증 다이얼로그 */}
        <Dialog
          open={verifyDialogOpen}
          onClose={() => !verifying && setVerifyDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, textAlign: 'center', pb: 1 }}>
            <ShieldIcon sx={{ fontSize: 40, color: '#ff5f9b', mb: 1, display: 'block', mx: 'auto' }} />
            19세 이상 인증
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
              성인 콘텐츠 이용을 위해 휴대폰 본인인증이 필요합니다.
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(255, 95, 155, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(255, 95, 155, 0.2)',
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                인증 절차 안내
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                1. 아래 인증하기 버튼을 클릭합니다.<br />
                2. 본인인증 팝업이 열립니다.<br />
                3. 휴대폰 번호를 입력하고 본인인증을 진행합니다.<br />
                4. 인증이 완료되면 자동으로 반영됩니다.
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              본인인증 정보는 연령 확인 목적으로만 사용됩니다.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
            <Button
              onClick={() => setVerifyDialogOpen(false)}
              disabled={verifying}
              sx={{ color: 'text.secondary', mr: 1 }}
            >
              취소
            </Button>
            <Button
              onClick={handleVerifyAdult}
              variant="contained"
              disabled={verifying}
              sx={{
                bgcolor: '#ff5f9b',
                '&:hover': { bgcolor: '#e54d87' },
                borderRadius: 2,
                px: 4,
                minWidth: 120,
              }}
            >
              {verifying ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '본인인증하기'}
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
