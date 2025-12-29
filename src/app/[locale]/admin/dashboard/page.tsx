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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import StarIcon from '@mui/icons-material/Star';
import HandshakeIcon from '@mui/icons-material/Handshake';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ReportIcon from '@mui/icons-material/Report';
import CampaignIcon from '@mui/icons-material/Campaign';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HelpIcon from '@mui/icons-material/Help';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefundIcon from '@mui/icons-material/MoneyOff';
import { adminService } from '@/services/adminService';

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
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [topCharacters, setTopCharacters] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [creatorStats, setCreatorStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [settlementStats, setSettlementStats] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);

  // 검색
  const [userSearch, setUserSearch] = useState('');
  const [characterSearch, setCharacterSearch] = useState('');

  // 다이얼로그
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [couponDialog, setCouponDialog] = useState(false);
  const [faqDialog, setFaqDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // 폼 데이터
  const [formData, setFormData] = useState<any>({});

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
      const [
        statsData,
        usersData,
        charactersData,
        paymentsData,
        topData,
        creatorsData,
        reportsData,
        announcementsData,
        couponsData,
        settlementsData,
        faqsData,
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers(1, 10),
        adminService.getCharacters(1, 10),
        adminService.getPayments(1, 10),
        adminService.getTopCharacters(),
        adminService.getCreators(1, 20),
        adminService.getReports(1, 20),
        adminService.getAnnouncements(1, 20),
        adminService.getCoupons(1, 20),
        adminService.getSettlements(1, 20),
        adminService.getFAQs(1, 50),
      ]);

      setStats(statsData);
      setUsers(usersData.users || []);
      setCharacters(charactersData.characters || []);
      setPayments(paymentsData.payments || []);
      setTopCharacters(topData || []);
      setCreators(creatorsData.creators || []);
      setCreatorStats(creatorsData.levelStats || null);
      setReports(reportsData.reports || []);
      setReportStats(reportsData.statusStats || null);
      setAnnouncements(announcementsData.announcements || []);
      setCoupons(couponsData.coupons || []);
      setSettlements(settlementsData.settlements || []);
      setSettlementStats(settlementsData.statusStats || null);
      setFaqs(faqsData.faqs || []);
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const handleToggleUserBlock = async (userId: string) => {
    try {
      await adminService.toggleUserBlock(userId);
      fetchDashboardData();
      setError('사용자 상태가 변경되었습니다.');
    } catch (error) {
      setError('작업에 실패했습니다.');
    }
  };

  const handleToggleCharacterVerify = async (characterId: string) => {
    try {
      await adminService.toggleCharacterVerify(characterId);
      fetchDashboardData();
      setError('캐릭터 검증 상태가 변경되었습니다.');
    } catch (error) {
      setError('작업에 실패했습니다.');
    }
  };

  const handleSetPartner = async (userId: string) => {
    try {
      const result = await adminService.setPartner(userId);
      fetchDashboardData();
      setError(result.message || '파트너로 승격되었습니다.');
    } catch (error) {
      setError('파트너 승격에 실패했습니다.');
    }
  };

  const handleRemovePartner = async (userId: string) => {
    try {
      const result = await adminService.removePartner(userId);
      fetchDashboardData();
      setError(result.message || '파트너가 해제되었습니다.');
    } catch (error) {
      setError('파트너 해제에 실패했습니다.');
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: string) => {
    try {
      await adminService.updateReportStatus(reportId, status);
      fetchDashboardData();
      setError('신고 상태가 업데이트되었습니다.');
    } catch (error) {
      setError('작업에 실패했습니다.');
    }
  };

  const handleRefundPayment = async (paymentId: string) => {
    if (!confirm('정말 환불 처리하시겠습니까?')) return;
    try {
      await adminService.refundPayment(paymentId, '관리자 환불 처리');
      fetchDashboardData();
      setError('환불이 처리되었습니다.');
    } catch (error) {
      setError('환불 처리에 실패했습니다.');
    }
  };

  const handleProcessSettlement = async (settlementId: string, status: string) => {
    try {
      await adminService.processSettlement(settlementId, status);
      fetchDashboardData();
      setError('정산이 처리되었습니다.');
    } catch (error) {
      setError('정산 처리에 실패했습니다.');
    }
  };

  // 공지사항 CRUD
  const handleSaveAnnouncement = async () => {
    try {
      if (editingItem) {
        await adminService.updateAnnouncement(editingItem._id, formData);
      } else {
        await adminService.createAnnouncement(formData);
      }
      fetchDashboardData();
      setAnnouncementDialog(false);
      setEditingItem(null);
      setFormData({});
      setError(editingItem ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.');
    } catch (error) {
      setError('작업에 실패했습니다.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await adminService.deleteAnnouncement(id);
      fetchDashboardData();
      setError('공지사항이 삭제되었습니다.');
    } catch (error) {
      setError('삭제에 실패했습니다.');
    }
  };

  // 쿠폰 CRUD
  const handleSaveCoupon = async () => {
    try {
      if (editingItem) {
        await adminService.updateCoupon(editingItem._id, formData);
      } else {
        await adminService.createCoupon(formData);
      }
      fetchDashboardData();
      setCouponDialog(false);
      setEditingItem(null);
      setFormData({});
      setError(editingItem ? '쿠폰이 수정되었습니다.' : '쿠폰이 생성되었습니다.');
    } catch (error) {
      setError('작업에 실패했습니다.');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await adminService.deleteCoupon(id);
      fetchDashboardData();
      setError('쿠폰이 삭제되었습니다.');
    } catch (error) {
      setError('삭제에 실패했습니다.');
    }
  };

  // FAQ CRUD
  const handleSaveFAQ = async () => {
    try {
      if (editingItem) {
        await adminService.updateFAQ(editingItem._id, formData);
      } else {
        await adminService.createFAQ(formData);
      }
      fetchDashboardData();
      setFaqDialog(false);
      setEditingItem(null);
      setFormData({});
      setError(editingItem ? 'FAQ가 수정되었습니다.' : 'FAQ가 등록되었습니다.');
    } catch (error) {
      setError('작업에 실패했습니다.');
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await adminService.deleteFAQ(id);
      fetchDashboardData();
      setError('FAQ가 삭제되었습니다.');
    } catch (error) {
      setError('삭제에 실패했습니다.');
    }
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      level1: { label: 'Lv.1 입문', color: '#9e9e9e' },
      level2: { label: 'Lv.2 고급', color: '#2196f3' },
      level3: { label: 'Lv.3 전문가', color: '#9c27b0' },
      partner: { label: '공식 파트너', color: '#ff5e62' },
    };
    return labels[level] || { label: level, color: '#9e9e9e' };
  };

  const getReportReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate: '부적절한 콘텐츠',
      spam: '스팸',
      harassment: '괴롭힘',
      copyright: '저작권 침해',
      adult_content: '성인 콘텐츠',
      violence: '폭력적 콘텐츠',
      other: '기타',
    };
    return labels[reason] || reason;
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
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              관리자 대시보드
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={2}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">총 사용자</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stats?.users?.total || 0}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ color: '#2196f3', fontSize: 28 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={2}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">총 캐릭터</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stats?.characters?.total || 0}
                    </Typography>
                  </Box>
                  <SmartToyIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={2}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">오늘 매출</Typography>
                    <Typography variant="h5" fontWeight="bold" color="#ff5e62">
                      ₩{(stats?.revenue?.today || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <AttachMoneyIcon sx={{ color: '#ff9800', fontSize: 28 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={2}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">월 매출</Typography>
                    <Typography variant="h5" fontWeight="bold" color="#4caf50">
                      ₩{(stats?.revenue?.last30d || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={2}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">대기 신고</Typography>
                    <Typography variant="h5" fontWeight="bold" color="#f44336">
                      {stats?.pendingReports || 0}
                    </Typography>
                  </Box>
                  <ReportIcon sx={{ color: '#f44336', fontSize: 28 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={2}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">대기 정산</Typography>
                    <Typography variant="h5" fontWeight="bold" color="#ff9800">
                      {stats?.pendingSettlements || 0}
                    </Typography>
                  </Box>
                  <AccountBalanceIcon sx={{ color: '#ff9800', fontSize: 28 }} />
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
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { color: '#666', minWidth: 100 },
              '& .Mui-selected': { color: '#ff5e62 !important' },
              '& .MuiTabs-indicator': { bgcolor: '#ff5e62' },
            }}
          >
            <Tab icon={<PeopleIcon />} label="사용자" iconPosition="start" />
            <Tab icon={<SmartToyIcon />} label="캐릭터" iconPosition="start" />
            <Tab icon={<HandshakeIcon />} label="크리에이터" iconPosition="start" />
            <Tab icon={<AttachMoneyIcon />} label="결제" iconPosition="start" />
            <Tab icon={<ReportIcon />} label="신고" iconPosition="start" />
            <Tab icon={<CampaignIcon />} label="공지" iconPosition="start" />
            <Tab icon={<LocalOfferIcon />} label="쿠폰" iconPosition="start" />
            <Tab icon={<AccountBalanceIcon />} label="정산" iconPosition="start" />
            <Tab icon={<HelpIcon />} label="FAQ" iconPosition="start" />
          </Tabs>

          {/* 사용자 관리 탭 */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="사용자 검색 (이메일, 이름)"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
              />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>사용자</TableCell>
                    <TableCell>이메일</TableCell>
                    <TableCell align="center">토큰</TableCell>
                    <TableCell align="center">구독</TableCell>
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
                        <Chip label={user.isSubscribed ? '구독' : '미구독'} size="small" color={user.isSubscribed ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell align="center">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleToggleUserBlock(user._id)}>
                          <BlockIcon fontSize="small" color={user.isBlocked ? 'error' : 'inherit'} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 캐릭터 관리 탭 */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>캐릭터</TableCell>
                    <TableCell>크리에이터</TableCell>
                    <TableCell align="center">대화 수</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {characters.map((character) => (
                    <TableRow key={character._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={character.profileImage} sx={{ width: 32, height: 32 }} />
                          <Typography variant="body2">{character.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{character.creator?.username || '-'}</TableCell>
                      <TableCell align="center">{character.usageCount || 0}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {character.isVerified && <Chip label="검증" size="small" color="success" />}
                          <Chip label={character.isPublic ? '공개' : '비공개'} size="small" />
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleToggleCharacterVerify(character._id)}>
                          <VerifiedIcon fontSize="small" color={character.isVerified ? 'success' : 'inherit'} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 크리에이터 관리 탭 */}
          <TabPanel value={tabValue} index={2}>
            {creatorStats && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {['level1', 'level2', 'level3', 'partner'].map((level) => {
                  const info = getLevelLabel(level);
                  return (
                    <Grid item xs={6} sm={3} key={level}>
                      <Card sx={{ bgcolor: level === 'partner' ? '#ffebee' : '#f5f5f5' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h4" fontWeight="bold" sx={{ color: info.color }}>
                            {creatorStats[level] || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">{info.label}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>크리에이터</TableCell>
                    <TableCell>이메일</TableCell>
                    <TableCell align="center">레벨</TableCell>
                    <TableCell align="center">총 대화</TableCell>
                    <TableCell align="center">수익률</TableCell>
                    <TableCell align="center">파트너</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creators.map((creator) => {
                    const levelInfo = getLevelLabel(creator.creatorLevel);
                    return (
                      <TableRow key={creator._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={creator.profileImage} sx={{ width: 32, height: 32 }}>{creator.username?.charAt(0)}</Avatar>
                            <Typography variant="body2">{creator.username}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{creator.email}</TableCell>
                        <TableCell align="center">
                          <Chip label={levelInfo.label} size="small" sx={{ bgcolor: levelInfo.color, color: 'white' }} />
                        </TableCell>
                        <TableCell align="center">{(creator.totalConversations || 0).toLocaleString()}</TableCell>
                        <TableCell align="center">{Math.round((creator.levelConfig?.earningRate || 0.3) * 100)}%</TableCell>
                        <TableCell align="center">
                          {creator.creatorLevel === 'partner' ? (
                            <IconButton size="small" color="error" onClick={() => handleRemovePartner(creator._id)}>
                              <RemoveCircleIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton size="small" color="primary" onClick={() => handleSetPartner(creator._id)}>
                              <HandshakeIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 결제 내역 탭 */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>사용자</TableCell>
                    <TableCell>타입</TableCell>
                    <TableCell align="right">금액</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">결제일</TableCell>
                    <TableCell align="center">환불</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id} hover>
                      <TableCell>{payment.user?.username || '-'}</TableCell>
                      <TableCell>{payment.type === 'token_purchase' ? '토큰' : '구독'}</TableCell>
                      <TableCell align="right">₩{payment.amount.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={payment.status === 'completed' ? '완료' : payment.status === 'refunded' ? '환불' : '대기'}
                          size="small"
                          color={payment.status === 'completed' ? 'success' : payment.status === 'refunded' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align="center">{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        {payment.status === 'completed' && (
                          <IconButton size="small" color="error" onClick={() => handleRefundPayment(payment._id)}>
                            <RefundIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 신고 관리 탭 */}
          <TabPanel value={tabValue} index={4}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>신고자</TableCell>
                    <TableCell>유형</TableCell>
                    <TableCell>사유</TableCell>
                    <TableCell>내용</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id} hover>
                      <TableCell>{report.reporter?.username || '-'}</TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{getReportReasonLabel(report.reason)}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.description}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={report.status === 'pending' ? '대기' : report.status === 'resolved' ? '처리완료' : '반려'}
                          size="small"
                          color={report.status === 'pending' ? 'warning' : report.status === 'resolved' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {report.status === 'pending' && (
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton size="small" color="success" onClick={() => handleUpdateReportStatus(report._id, 'resolved')}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleUpdateReportStatus(report._id, 'rejected')}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 공지사항 탭 */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingItem(null); setFormData({ isActive: true }); setAnnouncementDialog(true); }}
                sx={{ bgcolor: '#ff5e62' }}
              >
                공지사항 등록
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>제목</TableCell>
                    <TableCell>유형</TableCell>
                    <TableCell align="center">고정</TableCell>
                    <TableCell align="center">활성</TableCell>
                    <TableCell align="center">조회수</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {announcements.map((ann) => (
                    <TableRow key={ann._id} hover>
                      <TableCell>{ann.title}</TableCell>
                      <TableCell>{ann.type}</TableCell>
                      <TableCell align="center">{ann.isPinned ? '고정' : '-'}</TableCell>
                      <TableCell align="center">
                        <Chip label={ann.isActive ? '활성' : '비활성'} size="small" color={ann.isActive ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell align="center">{ann.viewCount || 0}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => { setEditingItem(ann); setFormData(ann); setAnnouncementDialog(true); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteAnnouncement(ann._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 쿠폰 관리 탭 */}
          <TabPanel value={tabValue} index={6}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingItem(null); setFormData({ isActive: true, type: 'tokens' }); setCouponDialog(true); }}
                sx={{ bgcolor: '#ff5e62' }}
              >
                쿠폰 생성
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>코드</TableCell>
                    <TableCell>이름</TableCell>
                    <TableCell>유형</TableCell>
                    <TableCell align="center">값</TableCell>
                    <TableCell align="center">사용</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon._id} hover>
                      <TableCell><code>{coupon.code}</code></TableCell>
                      <TableCell>{coupon.name}</TableCell>
                      <TableCell>{coupon.type === 'tokens' ? '토큰' : coupon.type === 'discount' ? '할인' : '구독'}</TableCell>
                      <TableCell align="center">{coupon.value}</TableCell>
                      <TableCell align="center">{coupon.usedCount}/{coupon.maxUsageCount || '무제한'}</TableCell>
                      <TableCell align="center">
                        <Chip label={coupon.isActive ? '활성' : '비활성'} size="small" color={coupon.isActive ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => { setEditingItem(coupon); setFormData(coupon); setCouponDialog(true); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteCoupon(coupon._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 정산 관리 탭 */}
          <TabPanel value={tabValue} index={7}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>크리에이터</TableCell>
                    <TableCell align="right">금액</TableCell>
                    <TableCell>기간</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settlements.map((settlement) => (
                    <TableRow key={settlement._id} hover>
                      <TableCell>{settlement.creator?.username || '-'}</TableCell>
                      <TableCell align="right">₩{settlement.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(settlement.periodStart).toLocaleDateString()} ~ {new Date(settlement.periodEnd).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={settlement.status === 'pending' ? '대기' : settlement.status === 'completed' ? '완료' : '거절'}
                          size="small"
                          color={settlement.status === 'pending' ? 'warning' : settlement.status === 'completed' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {settlement.status === 'pending' && (
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton size="small" color="success" onClick={() => handleProcessSettlement(settlement._id, 'completed')}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleProcessSettlement(settlement._id, 'rejected')}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* FAQ 관리 탭 */}
          <TabPanel value={tabValue} index={8}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingItem(null); setFormData({ isActive: true, category: 'general' }); setFaqDialog(true); }}
                sx={{ bgcolor: '#ff5e62' }}
              >
                FAQ 등록
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>카테고리</TableCell>
                    <TableCell>질문</TableCell>
                    <TableCell align="center">조회수</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq._id} hover>
                      <TableCell>{faq.category}</TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{faq.question}</TableCell>
                      <TableCell align="center">{faq.viewCount || 0}</TableCell>
                      <TableCell align="center">
                        <Chip label={faq.isActive ? '활성' : '비활성'} size="small" color={faq.isActive ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => { setEditingItem(faq); setFormData(faq); setFaqDialog(true); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteFAQ(faq._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>
      </Container>

      {/* 공지사항 다이얼로그 */}
      <Dialog open={announcementDialog} onClose={() => setAnnouncementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? '공지사항 수정' : '공지사항 등록'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="제목"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="내용"
              multiline
              rows={4}
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>유형</InputLabel>
              <Select
                value={formData.type || 'notice'}
                label="유형"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="notice">공지사항</MenuItem>
                <MenuItem value="event">이벤트</MenuItem>
                <MenuItem value="maintenance">점검</MenuItem>
                <MenuItem value="update">업데이트</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch checked={formData.isPinned || false} onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })} />}
              label="상단 고정"
            />
            <FormControlLabel
              control={<Switch checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />}
              label="활성화"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnnouncementDialog(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveAnnouncement} sx={{ bgcolor: '#ff5e62' }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* 쿠폰 다이얼로그 */}
      <Dialog open={couponDialog} onClose={() => setCouponDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? '쿠폰 수정' : '쿠폰 생성'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="쿠폰 코드"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            <TextField
              fullWidth
              label="쿠폰 이름"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>유형</InputLabel>
              <Select
                value={formData.type || 'tokens'}
                label="유형"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="tokens">토큰 지급</MenuItem>
                <MenuItem value="discount">할인</MenuItem>
                <MenuItem value="subscription">구독 기간</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="값 (토큰 수 / 할인율 / 일수)"
              type="number"
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
            />
            <TextField
              fullWidth
              label="최대 사용 횟수 (0=무제한)"
              type="number"
              value={formData.maxUsageCount || 0}
              onChange={(e) => setFormData({ ...formData, maxUsageCount: Number(e.target.value) })}
            />
            <FormControlLabel
              control={<Switch checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />}
              label="활성화"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCouponDialog(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveCoupon} sx={{ bgcolor: '#ff5e62' }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* FAQ 다이얼로그 */}
      <Dialog open={faqDialog} onClose={() => setFaqDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'FAQ 수정' : 'FAQ 등록'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={formData.category || 'general'}
                label="카테고리"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="general">일반</MenuItem>
                <MenuItem value="account">계정</MenuItem>
                <MenuItem value="payment">결제</MenuItem>
                <MenuItem value="character">캐릭터</MenuItem>
                <MenuItem value="creator">크리에이터</MenuItem>
                <MenuItem value="subscription">구독</MenuItem>
                <MenuItem value="technical">기술 지원</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="질문"
              value={formData.question || ''}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            />
            <TextField
              fullWidth
              label="답변"
              multiline
              rows={4}
              value={formData.answer || ''}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            />
            <FormControlLabel
              control={<Switch checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />}
              label="활성화"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFaqDialog(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveFAQ} sx={{ bgcolor: '#ff5e62' }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setError('')} severity={error.includes('실패') ? 'error' : 'success'} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
