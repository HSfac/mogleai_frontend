'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Stack,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { adminService } from '@/services/adminService';

interface DashboardStats {
  totalUsers: number;
  totalCharacters: number;
  todayRevenue: number;
  monthlyRevenue: number;
  activeUsers: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // 데이터
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [topCharacters, setTopCharacters] = useState<any[]>([]);

  // 검색
  const [userSearch, setUserSearch] = useState('');
  const [characterSearch, setCharacterSearch] = useState('');

  // 관리자 토큰 확인
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 대시보드 통계
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);

      // 사용자 목록
      const usersData = await adminService.getUsers(1, 10);
      setUsers(usersData.users || []);

      // 캐릭터 목록
      const charactersData = await adminService.getCharacters(1, 10);
      setCharacters(charactersData.characters || []);

      // 결제 내역
      const paymentsData = await adminService.getPayments(1, 10);
      setPayments(paymentsData.payments || []);

      // Top 캐릭터
      const topData = await adminService.getTopCharacters();
      setTopCharacters(topData || []);
    } catch (error: any) {
      console.error('대시보드 데이터 로딩 실패:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('인증에 실패했습니다. 다시 로그인해주세요.');
        setTimeout(() => {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }, 2000);
      } else {
        setError('대시보드 데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  // 사용자 차단/해제
  const handleToggleUserBlock = async (userId: string) => {
    try {
      await adminService.toggleUserBlock(userId);
      fetchDashboardData();
      setError('사용자 상태가 변경되었습니다.');
    } catch (error) {
      setError('작업에 실패했습니다.');
    }
  };

  // 캐릭터 검증/해제
  const handleToggleCharacterVerify = async (characterId: string) => {
    try {
      await adminService.toggleCharacterVerify(characterId);
      fetchDashboardData();
      setError('캐릭터 검증 상태가 변경되었습니다.');
    } catch (error) {
      setError('작업에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} sx={{ color: '#ff5e62' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              관리자 대시보드
            </Typography>
            <Typography variant="body1" color="text.secondary">
              몽글AI 시스템 관리
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
            sx={{ borderColor: '#ff5e62', color: '#ff5e62' }}
          >
            로그아웃
          </Button>
        </Box>

        {/* 통계 카드 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      총 사용자
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.totalUsers || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#e3f2fd', width: 56, height: 56 }}>
                    <PeopleIcon sx={{ color: '#2196f3', fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      총 캐릭터
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.totalCharacters || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#f3e5f5', width: 56, height: 56 }}>
                    <SmartToyIcon sx={{ color: '#9c27b0', fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      오늘 매출
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#ff5e62">
                      ₩{(stats?.todayRevenue || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#fff3e0', width: 56, height: 56 }}>
                    <AttachMoneyIcon sx={{ color: '#ff9800', fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      이번 달 매출
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#4caf50">
                      ₩{(stats?.monthlyRevenue || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#e8f5e9', width: 56, height: 56 }}>
                    <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 탭 메뉴 */}
        <Paper elevation={3}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { color: '#666' },
              '& .Mui-selected': { color: '#ff5e62 !important' },
              '& .MuiTabs-indicator': { bgcolor: '#ff5e62' },
            }}
          >
            <Tab label="사용자 관리" />
            <Tab label="캐릭터 관리" />
            <Tab label="결제 내역" />
            <Tab label="Top 캐릭터" />
          </Tabs>

          {/* 사용자 관리 탭 */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="사용자 검색 (이메일, 이름)"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>사용자</TableCell>
                    <TableCell>이메일</TableCell>
                    <TableCell align="center">토큰</TableCell>
                    <TableCell align="center">구독</TableCell>
                    <TableCell align="center">레벨</TableCell>
                    <TableCell align="center">가입일</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="center">{user.tokens}</TableCell>
                      <TableCell align="center">
                        {user.isSubscribed ? (
                          <Chip label="구독 중" size="small" color="success" />
                        ) : (
                          <Chip label="미구독" size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={`Level ${user.creatorLevel || 0}`} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={user.isBlocked ? '차단 해제' : '차단'}>
                          <IconButton
                            size="small"
                            color={user.isBlocked ? 'error' : 'default'}
                            onClick={() => handleToggleUserBlock(user._id)}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 캐릭터 관리 탭 */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="캐릭터 검색"
                value={characterSearch}
                onChange={(e) => setCharacterSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>캐릭터</TableCell>
                    <TableCell>크리에이터</TableCell>
                    <TableCell align="center">대화 수</TableCell>
                    <TableCell align="center">좋아요</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {characters.map((character) => (
                    <TableRow key={character._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={character.profileImage}
                            alt={character.name}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {character.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{character.creator?.username || '알 수 없음'}</TableCell>
                      <TableCell align="center">{character.conversationCount || 0}</TableCell>
                      <TableCell align="center">{character.likes || 0}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {character.isVerified && (
                            <Chip label="검증" size="small" color="success" />
                          )}
                          {character.isPublic ? (
                            <Chip label="공개" size="small" color="primary" />
                          ) : (
                            <Chip label="비공개" size="small" color="default" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={character.isVerified ? '검증 해제' : '검증'}>
                          <IconButton
                            size="small"
                            color={character.isVerified ? 'success' : 'default'}
                            onClick={() => handleToggleCharacterVerify(character._id)}
                          >
                            <VerifiedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 결제 내역 탭 */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>사용자</TableCell>
                    <TableCell>타입</TableCell>
                    <TableCell align="right">금액</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">결제일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id} hover>
                      <TableCell>{payment.user?.username || '알 수 없음'}</TableCell>
                      <TableCell>
                        {payment.type === 'token_purchase' ? '토큰 구매' : '구독 결제'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          ₩{payment.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            payment.status === 'completed'
                              ? '완료'
                              : payment.status === 'pending'
                              ? '대기'
                              : '실패'
                          }
                          size="small"
                          color={
                            payment.status === 'completed'
                              ? 'success'
                              : payment.status === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Top 캐릭터 탭 */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              대화 수 Top 10 캐릭터
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">순위</TableCell>
                    <TableCell>캐릭터</TableCell>
                    <TableCell>크리에이터</TableCell>
                    <TableCell align="center">대화 수</TableCell>
                    <TableCell align="center">좋아요</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCharacters.map((character, index) => (
                    <TableRow key={character._id} hover>
                      <TableCell align="center">
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#ff5e62' : '#f0f0f0',
                            color: index < 3 ? 'white' : 'text.primary',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={character.profileImage}
                            alt={character.name}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {character.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{character.creator?.username || '알 수 없음'}</TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold" color="#ff5e62">
                          {character.conversationCount || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{character.likes || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>
      </Container>

      {/* 스낵바 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError('')}
          severity={error.includes('성공') || error.includes('변경') ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
