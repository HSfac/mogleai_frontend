'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Badge,
  Stack,
  Alert,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatIcon from '@mui/icons-material/Chat';
import TokenIcon from '@mui/icons-material/Token';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PageLayout from '@/components/PageLayout';
import { useSession } from 'next-auth/react';
import { CreatorLevel } from '@/types/user';

// 탭 패널 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // 사용자 데이터
  const [user, setUser] = useState(null);
  const [createdCharacters, setCreatedCharacters] = useState([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // 사용자 정보 가져오기
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        setUser(userResponse.data);

        // 생성한 캐릭터 가져오기
        const createdResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/characters/my-characters`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        setCreatedCharacters(createdResponse.data);

        // 즐겨찾기 캐릭터 가져오기
        const favoritesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me/favorites`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        setFavoriteCharacters(favoritesResponse.data);

        // 최근 대화 가져오기
        const chatsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/chat`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        setRecentChats(chatsResponse.data);

        // 결제 내역 가져오기
        const paymentResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/history`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        setPaymentHistory(paymentResponse.data);
      } catch (error) {
        console.error('사용자 정보를 불러오는데 실패했습니다:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
        setSnackbar({
          open: true,
          message: '사용자 정보를 불러오는데 실패했습니다.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status, router]);

  // 크리에이터 레벨 표시
  const getCreatorLevelInfo = (level) => {
    switch (level) {
      case CreatorLevel.LEVEL1:
        return { label: '초보 크리에이터', color: 'primary' };
      case CreatorLevel.LEVEL2:
        return { label: '중급 크리에이터', color: 'secondary' };
      case CreatorLevel.LEVEL3:
        return { label: '전문 크리에이터', color: 'success' };
      default:
        return { label: '초보 크리에이터', color: 'primary' };
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">
            사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => router.push('/login')}
            sx={{ mt: 2 }}
          >
            로그인 페이지로 이동
          </Button>
        </Container>
      </PageLayout>
    );
  }

  const creatorLevelInfo = getCreatorLevelInfo(user.creatorLevel);

  return (
    <PageLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* 프로필 헤더 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={user.profileImage || '/images/default-avatar.png'}
                alt={user.username}
                sx={{ width: 100, height: 100 }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {user.username}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip 
                  label={creatorLevelInfo.label} 
                  color={creatorLevelInfo.color} 
                  size="small" 
                />
                <Chip 
                  icon={<TokenIcon />} 
                  label={`${user.tokens} 토큰`} 
                  variant="outlined" 
                  size="small" 
                />
                {user.isSubscribed && (
                  <Chip 
                    label="구독 중" 
                    color="success" 
                    size="small" 
                  />
                )}
              </Stack>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push('/settings')}
              >
                프로필 수정
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* 탭 메뉴 */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="내 캐릭터" icon={<AddIcon />} iconPosition="start" />
            <Tab label="즐겨찾기" icon={<FavoriteIcon />} iconPosition="start" />
            <Tab label="최근 대화" icon={<ChatIcon />} iconPosition="start" />
            <Tab label="결제 내역" icon={<ReceiptIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* 내 캐릭터 탭 */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              내 캐릭터 ({createdCharacters.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/characters/create')}
            >
              새 캐릭터 만들기
            </Button>
          </Box>
          
          {createdCharacters.length > 0 ? (
            <Grid container spacing={3}>
              {createdCharacters.map((character) => (
                <Grid item key={character._id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push(`/characters/${character._id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={character.imageUrl || '/images/default-character.png'}
                      alt={character.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2">
                        {character.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {character.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          size="small" 
                          label={`${character.likes || 0} 좋아요`} 
                          icon={<FavoriteIcon fontSize="small" />} 
                        />
                        <Chip 
                          size="small" 
                          label={`${character.usageCount || 0} 대화`} 
                          icon={<ChatIcon fontSize="small" />} 
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                아직 만든 캐릭터가 없습니다.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/characters/create')}
                sx={{ mt: 2 }}
              >
                첫 캐릭터 만들기
              </Button>
            </Box>
          )}
        </TabPanel>
        
        {/* 즐겨찾기 탭 */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            즐겨찾기 ({favoriteCharacters.length})
          </Typography>
          
          {favoriteCharacters.length > 0 ? (
            <Grid container spacing={3}>
              {favoriteCharacters.map((character) => (
                <Grid item key={character._id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push(`/characters/${character._id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={character.imageUrl || '/images/default-character.png'}
                      alt={character.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2">
                        {character.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {character.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                아직 즐겨찾기한 캐릭터가 없습니다.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/search')}
                sx={{ mt: 2 }}
              >
                캐릭터 찾아보기
              </Button>
            </Box>
          )}
        </TabPanel>
        
        {/* 최근 대화 탭 */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            최근 대화 ({recentChats.length})
          </Typography>
          
          {recentChats.length > 0 ? (
            <List>
              {recentChats.map((chat) => (
                <ListItem
                  key={chat._id}
                  button
                  onClick={() => router.push(`/chat/${chat._id}`)}
                  divider
                  sx={{ 
                    borderRadius: 1, 
                    mb: 1, 
                    '&:hover': { 
                      bgcolor: 'action.hover' 
                    } 
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={chat.character?.imageUrl || '/images/default-character.png'}
                      alt={chat.character?.name}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={chat.character?.name || '알 수 없는 캐릭터'}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {chat.messages[chat.messages.length - 1]?.content.substring(0, 50)}
                          {chat.messages[chat.messages.length - 1]?.content.length > 50 ? '...' : ''}
                        </Typography>
                        <Typography component="span" variant="caption" display="block">
                          {new Date(chat.lastActivity).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                아직 대화 기록이 없습니다.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/search')}
                sx={{ mt: 2 }}
              >
                캐릭터와 대화하기
              </Button>
            </Box>
          )}
        </TabPanel>
        
        {/* 결제 내역 탭 */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            결제 내역 ({paymentHistory.length})
          </Typography>
          
          {paymentHistory.length > 0 ? (
            <Stack spacing={2}>
              {paymentHistory.map((payment) => (
                <Paper key={payment._id} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {payment.type === 'token_purchase' ? '토큰 구매' : '구독 결제'}
                    </Typography>
                    <Chip
                      label={
                        payment.status === 'completed'
                          ? '완료'
                          : payment.status === 'pending'
                          ? '대기중'
                          : '실패'
                      }
                      color={
                        payment.status === 'completed'
                          ? 'success'
                          : payment.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">결제 금액</Typography>
                      <Typography variant="body1">{payment.amount.toLocaleString()}원</Typography>
                    </Grid>
                    
                    {payment.type === 'token_purchase' && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">구매 토큰</Typography>
                        <Typography variant="body1">{payment.tokens}개</Typography>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">결제 일시</Typography>
                      <Typography variant="body1">{new Date(payment.createdAt).toLocaleString()}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">결제 방법</Typography>
                      <Typography variant="body1">{payment.paymentMethod || '카드 결제'}</Typography>
                    </Grid>
                  </Grid>
                  
                  {payment.receiptUrl && (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={() => window.open(payment.receiptUrl, '_blank')}
                    >
                      영수증 보기
                    </Button>
                  )}
                </Paper>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                아직 결제 내역이 없습니다.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/tokens')}
                sx={{ mt: 2 }}
              >
                토큰 구매하기
              </Button>
            </Box>
          )}
        </TabPanel>
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
} 