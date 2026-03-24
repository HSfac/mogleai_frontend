'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Pagination,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import { adminService } from '@/services/adminService';
import DashboardCharts from '@/components/admin/DashboardCharts';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
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

function getPaginationTotal(payload: any) {
  return payload?.pagination?.total ?? payload?.total ?? 0;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { getLocalePath } = useLocaleNavigation();
  const adminLoginPath = getLocalePath('/admin/login');
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
  const debouncedUserSearch = useDebounce(userSearch, 300);
  const debouncedCharacterSearch = useDebounce(characterSearch, 300);

  // 페이지네이션
  const [userPage, setUserPage] = useState(1);
  const [characterPage, setCharacterPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [characterTotal, setCharacterTotal] = useState(0);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const PAGE_SIZE = 10;

  // 다이얼로그
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [couponDialog, setCouponDialog] = useState(false);
  const [faqDialog, setFaqDialog] = useState(false);
  const [userDetailDialog, setUserDetailDialog] = useState(false);
  const [reportDetailDialog, setReportDetailDialog] = useState(false);
  const [settlementDialog, setSettlementDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // 폼 데이터
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push(adminLoginPath);
      return;
    }
    fetchDashboardData();
  }, [adminLoginPath, router]);

  // 검색어 변경 시 사용자 목록 리로드
  useEffect(() => {
    if (debouncedUserSearch !== undefined) {
      fetchUsers(1, debouncedUserSearch);
      setUserPage(1);
    }
  }, [debouncedUserSearch]);

  // 검색어 변경 시 캐릭터 목록 리로드
  useEffect(() => {
    if (debouncedCharacterSearch !== undefined) {
      fetchCharacters(1, debouncedCharacterSearch);
      setCharacterPage(1);
    }
  }, [debouncedCharacterSearch]);

  const fetchUsers = async (page: number, search?: string) => {
    try {
      const data = await adminService.getUsers(page, PAGE_SIZE, search);
      setUsers(data.users || []);
      setUserTotal(getPaginationTotal(data));
    } catch (error) {
      console.error('사용자 로딩 실패:', error);
    }
  };

  const fetchCharacters = async (page: number, search?: string) => {
    try {
      const data = await adminService.getCharacters(page, PAGE_SIZE, search);
      setCharacters(data.characters || []);
      setCharacterTotal(getPaginationTotal(data));
    } catch (error) {
      console.error('캐릭터 로딩 실패:', error);
    }
  };

  const fetchPayments = async (page: number) => {
    try {
      const data = await adminService.getPayments(page, PAGE_SIZE);
      setPayments(data.payments || []);
      setPaymentTotal(getPaginationTotal(data));
    } catch (error) {
      console.error('결제 로딩 실패:', error);
    }
  };

  const handleUserPageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setUserPage(page);
    fetchUsers(page, debouncedUserSearch);
  };

  const handleCharacterPageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCharacterPage(page);
    fetchCharacters(page, debouncedCharacterSearch);
  };

  const handlePaymentPageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPaymentPage(page);
    fetchPayments(page);
  };

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
      setUserTotal(getPaginationTotal(usersData));
      setCharacters(charactersData.characters || []);
      setCharacterTotal(getPaginationTotal(charactersData));
      setPayments(paymentsData.payments || []);
      setPaymentTotal(getPaginationTotal(paymentsData));
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
          router.push(adminLoginPath);
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
    router.push(adminLoginPath);
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

  const handleToggleCharacterPublic = async (characterId: string) => {
    try {
      await adminService.toggleCharacterPublic(characterId);
      fetchCharacters(characterPage, debouncedCharacterSearch);
      setError('캐릭터 공개 상태가 변경되었습니다.');
    } catch (error) {
      setError('작업에 실패했습니다.');
    }
  };

  const handleViewUserDetail = async (userId: string) => {
    try {
      const userDetail = await adminService.getUserDetail(userId);
      setSelectedUser(userDetail);
      setUserDetailDialog(true);
    } catch (error) {
      setError('사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleViewReportDetail = (report: any) => {
    setSelectedReport(report);
    setAdminNote(report.adminNote || '');
    setReportDetailDialog(true);
  };

  const handleProcessReportWithNote = async (status: string) => {
    if (!selectedReport) return;
    try {
      await adminService.updateReportStatus(selectedReport._id, status, adminNote);
      fetchDashboardData();
      setReportDetailDialog(false);
      setSelectedReport(null);
      setAdminNote('');
      setError(`신고가 ${status === 'resolved' ? '처리완료' : '반려'}되었습니다.`);
    } catch (error) {
      setError('신고 처리에 실패했습니다.');
    }
  };

  const handleOpenSettlementDialog = (settlement: any) => {
    setSelectedSettlement(settlement);
    setAdminNote('');
    setTransactionId('');
    setSettlementDialog(true);
  };

  const handleProcessSettlementWithDetails = async (status: string) => {
    if (!selectedSettlement) return;
    try {
      await adminService.processSettlement(selectedSettlement._id, status, adminNote, transactionId);
      fetchDashboardData();
      setSettlementDialog(false);
      setSelectedSettlement(null);
      setAdminNote('');
      setTransactionId('');
      setError(`정산이 ${status === 'completed' ? '완료' : '거절'}되었습니다.`);
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

  const formatCompactCurrency = (value: number) =>
    new Intl.NumberFormat('ko-KR', {
      notation: value >= 10000 ? 'compact' : 'standard',
      maximumFractionDigits: 1,
    }).format(value);

  const overviewCards = [
    {
      label: '총 사용자',
      value: stats?.users?.total || 0,
      helper: '현재 누적 가입자',
      color: '#7cc7ff',
      icon: <PeopleIcon sx={{ fontSize: 26 }} />,
    },
    {
      label: '총 캐릭터',
      value: stats?.characters?.total || 0,
      helper: '운영 중인 캐릭터',
      color: '#caa7ff',
      icon: <SmartToyIcon sx={{ fontSize: 26 }} />,
    },
    {
      label: '오늘 매출',
      value: `₩${formatCompactCurrency(stats?.revenue?.today || 0)}`,
      helper: '실시간 당일 수익',
      color: '#ffbd66',
      icon: <AttachMoneyIcon sx={{ fontSize: 26 }} />,
    },
    {
      label: '최근 30일 매출',
      value: `₩${formatCompactCurrency(stats?.revenue?.last30d || 0)}`,
      helper: '월간 성장 흐름',
      color: '#88ebb4',
      icon: <TrendingUpIcon sx={{ fontSize: 26 }} />,
    },
    {
      label: '대기 신고',
      value: stats?.pendingReports || 0,
      helper: '즉시 확인 필요',
      color: '#ff8d8d',
      icon: <ReportIcon sx={{ fontSize: 26 }} />,
    },
    {
      label: '대기 정산',
      value: stats?.pendingSettlements || 0,
      helper: '처리 대기 건수',
      color: '#ffd166',
      icon: <AccountBalanceIcon sx={{ fontSize: 26 }} />,
    },
  ];

  const operationBadges = [
    `미처리 신고 ${stats?.pendingReports || 0}건`,
    `정산 대기 ${stats?.pendingSettlements || 0}건`,
    `파트너 ${creatorStats?.partner || 0}명`,
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#1a1a1a">
        <CircularProgress size={60} sx={{ color: '#ff5e62' }} />
      </Box>
    );
  }

  // 다크모드 스타일
  const darkCardStyle = {
    bgcolor: 'rgba(12,16,25,0.82)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 5,
    backdropFilter: 'blur(18px)',
    boxShadow: '0 24px 60px rgba(2,6,23,0.34)',
  };

  const darkTableStyle = {
    '& .MuiTableHead-root': {
      '& .MuiTableCell-root': {
        bgcolor: 'rgba(255,255,255,0.05)',
        color: '#aaa',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontWeight: 600,
      },
    },
    '& .MuiTableBody-root': {
      '& .MuiTableRow-root': {
        transition: 'background-color 0.2s ease',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.03)',
        },
      },
      '& .MuiTableCell-root': {
        color: '#ddd',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#090b12',
        background:
          'radial-gradient(circle at top left, rgba(255,94,98,0.16), transparent 28%), radial-gradient(circle at 88% 10%, rgba(33,150,243,0.12), transparent 24%), linear-gradient(180deg, #121620 0%, #090b12 100%)',
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4.5 } }}>
        <Card
          sx={{
            ...darkCardStyle,
            mb: 3.5,
            overflow: 'hidden',
            position: 'relative',
            background:
              'linear-gradient(135deg, rgba(255,94,98,0.26) 0%, rgba(255,94,98,0.12) 24%, rgba(15,23,42,0.9) 58%, rgba(124,199,255,0.14) 100%)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(120deg, rgba(255,255,255,0.08), transparent 32%, transparent 60%, rgba(255,255,255,0.04) 100%)',
              pointerEvents: 'none',
            }}
          />
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
              >
                <Box>
                  <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.64)', letterSpacing: 1.8 }}>
                    MONGLAI CONTROL CENTER
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="#fff" sx={{ lineHeight: 1.08 }}>
                    관리자 대시보드
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ mt: 1.2, maxWidth: 720 }}>
                    운영 지표, 리스크, 수익, 관리 대기열을 한 화면에서 빠르게 확인할 수 있도록 상단 정보를 재구성했습니다.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<ExitToAppIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '12px',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    px: 2.2,
                    '&:hover': {
                      borderColor: '#ff5e62',
                      bgcolor: 'rgba(255,94,98,0.08)',
                    },
                  }}
                >
                  로그아웃
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {operationBadges.map((badge) => (
                  <Chip
                    key={badge}
                    label={badge}
                    sx={{
                      borderRadius: '12px',
                      bgcolor: 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontWeight: 700,
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2.2} sx={{ mb: 3.5 }}>
          {overviewCards.map((card) => (
            <Grid item xs={6} sm={4} md={2} key={card.label}>
              <Card
                sx={{
                  ...darkCardStyle,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: `${card.color}66`,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at top right, ${card.color}18, transparent 44%)`,
                    pointerEvents: 'none',
                  }}
                />
                <CardContent sx={{ py: 2.2, px: 2.2 }}>
                  <Stack spacing={1.8}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: `${card.color}20`,
                          color: card.color,
                          border: `1px solid ${card.color}38`,
                        }}
                      >
                        {card.icon}
                      </Avatar>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.52)' }}>
                        Live
                      </Typography>
                    </Stack>
                    <Box>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)">
                        {card.label}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="#fff" sx={{ mt: 0.4, lineHeight: 1.1 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.52)' }}>
                        {card.helper}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ ...darkCardStyle, mb: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#fff' }}>
                  운영 차트
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  핵심 지표를 요약 카드 아래에 분리해서 시선 이동을 줄였습니다.
                </Typography>
              </Box>
              <Chip
                label="실시간 모니터링"
                sx={{
                  borderRadius: '12px',
                  bgcolor: 'rgba(124,199,255,0.12)',
                  color: '#7cc7ff',
                  border: '1px solid rgba(124,199,255,0.18)',
                  fontWeight: 700,
                }}
              />
            </Stack>
            <DashboardCharts />
          </CardContent>
        </Card>

        <Paper sx={{ ...darkCardStyle, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 1.5,
              pt: 1.5,
              bgcolor: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.5)',
                minWidth: 108,
                minHeight: 52,
                borderRadius: '12px',
                mx: 0.4,
                transition: 'background-color 0.2s ease, color 0.2s ease',
              },
              '& .Mui-selected': {
                color: '#fff !important',
                bgcolor: 'rgba(255,94,98,0.18)',
              },
              '& .MuiTabs-indicator': { display: 'none' },
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
            <Box sx={{ mb: 2, px: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="사용자 검색 (이메일, 이름)"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} /></InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff5e62' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)' },
                }}
              />
            </Box>
            <TableContainer sx={{ px: 2 }}>
              <Table size="small" sx={darkTableStyle}>
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
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="상세 정보">
                            <IconButton size="small" onClick={() => handleViewUserDetail(user._id)}>
                              <InfoIcon fontSize="small" sx={{ color: '#2196f3' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.isBlocked ? '차단 해제' : '차단'}>
                            <IconButton size="small" onClick={() => handleToggleUserBlock(user._id)}>
                              <BlockIcon fontSize="small" sx={{ color: user.isBlocked ? '#f44336' : 'rgba(255,255,255,0.5)' }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {userTotal > PAGE_SIZE && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                <Pagination
                  count={Math.ceil(userTotal / PAGE_SIZE)}
                  page={userPage}
                  onChange={handleUserPageChange}
                  sx={{
                    '& .MuiPaginationItem-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .Mui-selected': { bgcolor: '#ff5e62 !important', color: '#fff' },
                  }}
                />
              </Box>
            )}
          </TabPanel>

          {/* 캐릭터 관리 탭 */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2, px: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="캐릭터 검색 (이름, 크리에이터)"
                value={characterSearch}
                onChange={(e) => setCharacterSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} /></InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff5e62' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)' },
                }}
              />
            </Box>
            <TableContainer sx={{ px: 2 }}>
              <Table size="small" sx={darkTableStyle}>
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
                          <Typography variant="body2" color="#fff">{character.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{character.creator?.username || '-'}</TableCell>
                      <TableCell align="center">{character.usageCount || 0}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {character.isVerified && <Chip label="검증" size="small" color="success" />}
                          <Chip label={character.isPublic ? '공개' : '비공개'} size="small" color={character.isPublic ? 'info' : 'default'} />
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title={character.isPublic ? '비공개로 변경' : '공개로 변경'}>
                            <IconButton size="small" onClick={() => handleToggleCharacterPublic(character._id)}>
                              {character.isPublic ? (
                                <VisibilityIcon fontSize="small" sx={{ color: '#2196f3' }} />
                              ) : (
                                <VisibilityOffIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={character.isVerified ? '검증 해제' : '검증 처리'}>
                            <IconButton size="small" onClick={() => handleToggleCharacterVerify(character._id)}>
                              <VerifiedIcon fontSize="small" sx={{ color: character.isVerified ? '#4caf50' : 'rgba(255,255,255,0.5)' }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {characterTotal > PAGE_SIZE && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                <Pagination
                  count={Math.ceil(characterTotal / PAGE_SIZE)}
                  page={characterPage}
                  onChange={handleCharacterPageChange}
                  sx={{
                    '& .MuiPaginationItem-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .Mui-selected': { bgcolor: '#ff5e62 !important', color: '#fff' },
                  }}
                />
              </Box>
            )}
          </TabPanel>

          {/* 크리에이터 관리 탭 */}
          <TabPanel value={tabValue} index={2}>
            {creatorStats && (
              <Grid container spacing={2} sx={{ mb: 3, px: 2 }}>
                {['level1', 'level2', 'level3', 'partner'].map((level) => {
                  const info = getLevelLabel(level);
                  return (
                    <Grid item xs={6} sm={3} key={level}>
                      <Card sx={{ ...darkCardStyle, bgcolor: level === 'partner' ? 'rgba(255,94,98,0.1)' : 'rgba(255,255,255,0.03)' }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h4" fontWeight="bold" sx={{ color: info.color }}>
                            {creatorStats[level] || 0}
                          </Typography>
                          <Typography variant="body2" color="rgba(255,255,255,0.6)">{info.label}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
            <TableContainer sx={{ px: 2 }}>
              <Table size="small" sx={darkTableStyle}>
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
            <TableContainer sx={{ px: 2 }}>
              <Table size="small" sx={darkTableStyle}>
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
                          <IconButton size="small" onClick={() => handleRefundPayment(payment._id)}>
                            <RefundIcon fontSize="small" sx={{ color: '#f44336' }} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {paymentTotal > PAGE_SIZE && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                <Pagination
                  count={Math.ceil(paymentTotal / PAGE_SIZE)}
                  page={paymentPage}
                  onChange={handlePaymentPageChange}
                  sx={{
                    '& .MuiPaginationItem-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .Mui-selected': { bgcolor: '#ff5e62 !important', color: '#fff' },
                  }}
                />
              </Box>
            )}
          </TabPanel>

          {/* 신고 관리 탭 */}
          <TabPanel value={tabValue} index={4}>
            <TableContainer sx={{ px: 2 }}>
              <Table size="small" sx={darkTableStyle}>
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
                        <Tooltip title="상세 보기">
                          <IconButton size="small" onClick={() => handleViewReportDetail(report)}>
                            <InfoIcon fontSize="small" sx={{ color: '#2196f3' }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* 공지사항 탭 */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ mb: 2, px: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingItem(null); setFormData({ isActive: true }); setAnnouncementDialog(true); }}
                sx={{ bgcolor: '#ff5e62', '&:hover': { bgcolor: '#e54d87' } }}
              >
                공지사항 등록
              </Button>
            </Box>
            <TableContainer sx={{ px: 2 }}>
              <Table size="small" sx={darkTableStyle}>
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
            <Box sx={{ mb: 2, px: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingItem(null); setFormData({ isActive: true, type: 'tokens' }); setCouponDialog(true); }}
                sx={{ bgcolor: '#ff5e62', '&:hover': { bgcolor: '#e54d87' } }}
              >
                쿠폰 생성
              </Button>
            </Box>
            <TableContainer sx={{ px: 2 }}>
              <Table size="small" sx={darkTableStyle}>
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
            <TableContainer sx={{ px: 2 }}>
              <Table size="small" sx={darkTableStyle}>
                <TableHead>
                  <TableRow>
                    <TableCell>크리에이터</TableCell>
                    <TableCell align="right">금액</TableCell>
                    <TableCell>기간</TableCell>
                    <TableCell align="center">거래ID</TableCell>
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
                        <Typography variant="caption" color="rgba(255,255,255,0.6)">
                          {settlement.transactionId || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={settlement.status === 'pending' ? '대기' : settlement.status === 'completed' ? '완료' : '거절'}
                          size="small"
                          color={settlement.status === 'pending' ? 'warning' : settlement.status === 'completed' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {settlement.status === 'pending' ? (
                          <Tooltip title="정산 처리">
                            <IconButton size="small" onClick={() => handleOpenSettlementDialog(settlement)}>
                              <AccountBalanceIcon fontSize="small" sx={{ color: '#ff9800' }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="상세 보기">
                            <IconButton size="small" onClick={() => handleOpenSettlementDialog(settlement)}>
                              <InfoIcon fontSize="small" sx={{ color: '#2196f3' }} />
                            </IconButton>
                          </Tooltip>
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
            <Box sx={{ mb: 2, px: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingItem(null); setFormData({ isActive: true, category: 'general' }); setFaqDialog(true); }}
                sx={{ bgcolor: '#ff5e62', '&:hover': { bgcolor: '#e54d87' } }}
              >
                FAQ 등록
              </Button>
            </Box>
            <TableContainer sx={{ px: 2 }}>
              <Table size="small" sx={darkTableStyle}>
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
      <Dialog
        open={announcementDialog}
        onClose={() => setAnnouncementDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#2a2a2a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>{editingItem ? '공지사항 수정' : '공지사항 등록'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="제목"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              }}
            />
            <TextField
              fullWidth
              label="내용"
              multiline
              rows={4}
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              }}
            />
            <FormControl fullWidth sx={{ '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' } }}>
              <InputLabel>유형</InputLabel>
              <Select
                value={formData.type || 'notice'}
                label="유형"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
              >
                <MenuItem value="notice">공지사항</MenuItem>
                <MenuItem value="event">이벤트</MenuItem>
                <MenuItem value="maintenance">점검</MenuItem>
                <MenuItem value="update">업데이트</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch checked={formData.isPinned || false} onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })} sx={{ '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.2)' } }} />}
              label="상단 고정"
              sx={{ color: 'rgba(255,255,255,0.8)' }}
            />
            <FormControlLabel
              control={<Switch checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} sx={{ '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.2)' } }} />}
              label="활성화"
              sx={{ color: 'rgba(255,255,255,0.8)' }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAnnouncementDialog(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>취소</Button>
          <Button variant="contained" onClick={handleSaveAnnouncement} sx={{ bgcolor: '#ff5e62', '&:hover': { bgcolor: '#e54d87' } }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* 쿠폰 다이얼로그 */}
      <Dialog
        open={couponDialog}
        onClose={() => setCouponDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#2a2a2a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>{editingItem ? '쿠폰 수정' : '쿠폰 생성'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="쿠폰 코드"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              }}
            />
            <TextField
              fullWidth
              label="쿠폰 이름"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              }}
            />
            <FormControl fullWidth sx={{ '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' } }}>
              <InputLabel>유형</InputLabel>
              <Select
                value={formData.type || 'tokens'}
                label="유형"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
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
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              }}
            />
            <TextField
              fullWidth
              label="최대 사용 횟수 (0=무제한)"
              type="number"
              value={formData.maxUsageCount || 0}
              onChange={(e) => setFormData({ ...formData, maxUsageCount: Number(e.target.value) })}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              }}
            />
            <FormControlLabel
              control={<Switch checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} sx={{ '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.2)' } }} />}
              label="활성화"
              sx={{ color: 'rgba(255,255,255,0.8)' }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCouponDialog(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>취소</Button>
          <Button variant="contained" onClick={handleSaveCoupon} sx={{ bgcolor: '#ff5e62', '&:hover': { bgcolor: '#e54d87' } }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* FAQ 다이얼로그 */}
      <Dialog
        open={faqDialog}
        onClose={() => setFaqDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#2a2a2a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>{editingItem ? 'FAQ 수정' : 'FAQ 등록'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' } }}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={formData.category || 'general'}
                label="카테고리"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
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
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              }}
            />
            <TextField
              fullWidth
              label="답변"
              multiline
              rows={4}
              value={formData.answer || ''}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              }}
            />
            <FormControlLabel
              control={<Switch checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} sx={{ '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.2)' } }} />}
              label="활성화"
              sx={{ color: 'rgba(255,255,255,0.8)' }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFaqDialog(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>취소</Button>
          <Button variant="contained" onClick={handleSaveFAQ} sx={{ bgcolor: '#ff5e62', '&:hover': { bgcolor: '#e54d87' } }}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* 사용자 상세 다이얼로그 */}
      <Dialog
        open={userDetailDialog}
        onClose={() => { setUserDetailDialog(false); setSelectedUser(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#2a2a2a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>사용자 상세 정보</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={selectedUser.profileImage} sx={{ width: 64, height: 64 }}>
                  {selectedUser.username?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#fff">{selectedUser.username}</Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">{selectedUser.email}</Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">보유 토큰</Typography>
                    <Typography variant="h5" color="#ff5e62">{selectedUser.tokens?.toLocaleString() || 0}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">총 결제금액</Typography>
                    <Typography variant="h5" color="#4caf50">₩{selectedUser.totalPayment?.toLocaleString() || 0}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">총 대화 수</Typography>
                    <Typography variant="h5" color="#2196f3">{selectedUser.totalConversations?.toLocaleString() || 0}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">생성 캐릭터</Typography>
                    <Typography variant="h5" color="#9c27b0">{selectedUser.createdCharacters?.toLocaleString() || 0}</Typography>
                  </Card>
                </Grid>
              </Grid>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">구독 상태</Typography>
                  <Chip
                    label={selectedUser.isSubscribed ? '구독 중' : '미구독'}
                    size="small"
                    color={selectedUser.isSubscribed ? 'success' : 'default'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">차단 상태</Typography>
                  <Chip
                    label={selectedUser.isBlocked ? '차단됨' : '정상'}
                    size="small"
                    color={selectedUser.isBlocked ? 'error' : 'success'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">크리에이터 레벨</Typography>
                  <Typography variant="body2" color="#fff">
                    {selectedUser.creatorLevel ? getLevelLabel(selectedUser.creatorLevel).label : '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">가입일</Typography>
                  <Typography variant="body2" color="#fff">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">마지막 활동</Typography>
                  <Typography variant="body2" color="#fff">
                    {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : '-'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setUserDetailDialog(false); setSelectedUser(null); }} sx={{ color: 'rgba(255,255,255,0.6)' }}>닫기</Button>
          {selectedUser && (
            <Button
              variant="contained"
              color={selectedUser.isBlocked ? 'success' : 'error'}
              onClick={() => {
                handleToggleUserBlock(selectedUser._id);
                setUserDetailDialog(false);
                setSelectedUser(null);
              }}
            >
              {selectedUser.isBlocked ? '차단 해제' : '차단'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 신고 상세 다이얼로그 */}
      <Dialog
        open={reportDetailDialog}
        onClose={() => { setReportDetailDialog(false); setSelectedReport(null); setAdminNote(''); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#2a2a2a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>신고 상세 정보</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">신고자</Typography>
                  <Typography variant="body1" color="#fff">{selectedReport.reporter?.username || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">신고 유형</Typography>
                  <Typography variant="body1" color="#fff">{selectedReport.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">신고 사유</Typography>
                  <Typography variant="body1" color="#fff">{getReportReasonLabel(selectedReport.reason)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">신고 일시</Typography>
                  <Typography variant="body1" color="#fff">
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              <Box>
                <Typography variant="caption" color="rgba(255,255,255,0.5)">신고 내용</Typography>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, mt: 1 }}>
                  <Typography variant="body2" color="#fff" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedReport.description}
                  </Typography>
                </Card>
              </Box>
              {selectedReport.targetId && (
                <Box>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">대상 ID</Typography>
                  <Typography variant="body2" color="#fff">{selectedReport.targetId}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="rgba(255,255,255,0.5)">현재 상태</Typography>
                <Chip
                  label={selectedReport.status === 'pending' ? '대기' : selectedReport.status === 'resolved' ? '처리완료' : '반려'}
                  size="small"
                  color={selectedReport.status === 'pending' ? 'warning' : selectedReport.status === 'resolved' ? 'success' : 'default'}
                />
              </Box>
              {selectedReport.status === 'pending' && (
                <TextField
                  fullWidth
                  label="관리자 메모"
                  multiline
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="처리 결과에 대한 메모를 남겨주세요..."
                  sx={{
                    '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                  }}
                />
              )}
              {selectedReport.adminNote && selectedReport.status !== 'pending' && (
                <Box>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">관리자 메모</Typography>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, mt: 1 }}>
                    <Typography variant="body2" color="#fff" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedReport.adminNote}
                    </Typography>
                  </Card>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setReportDetailDialog(false); setSelectedReport(null); setAdminNote(''); }} sx={{ color: 'rgba(255,255,255,0.6)' }}>닫기</Button>
          {selectedReport?.status === 'pending' && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleProcessReportWithNote('rejected')}
              >
                반려
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleProcessReportWithNote('resolved')}
              >
                처리 완료
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* 정산 처리 다이얼로그 */}
      <Dialog
        open={settlementDialog}
        onClose={() => { setSettlementDialog(false); setSelectedSettlement(null); setAdminNote(''); setTransactionId(''); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#2a2a2a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>정산 처리</DialogTitle>
        <DialogContent>
          {selectedSettlement && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">크리에이터</Typography>
                  <Typography variant="body1" color="#fff">{selectedSettlement.creator?.username || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">정산 금액</Typography>
                  <Typography variant="h5" color="#ff5e62">₩{selectedSettlement.amount?.toLocaleString()}</Typography>
                </Grid>
              </Grid>
              <Box>
                <Typography variant="caption" color="rgba(255,255,255,0.5)">정산 기간</Typography>
                <Typography variant="body1" color="#fff">
                  {new Date(selectedSettlement.periodStart).toLocaleDateString()} ~ {new Date(selectedSettlement.periodEnd).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="rgba(255,255,255,0.5)">현재 상태</Typography>
                <Chip
                  label={selectedSettlement.status === 'pending' ? '대기' : selectedSettlement.status === 'completed' ? '완료' : '거절'}
                  size="small"
                  color={selectedSettlement.status === 'pending' ? 'warning' : selectedSettlement.status === 'completed' ? 'success' : 'error'}
                />
              </Box>
              {selectedSettlement.status === 'pending' && (
                <>
                  <TextField
                    fullWidth
                    label="거래 ID (송금 확인용)"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="은행 거래 ID 또는 이체 확인 번호"
                    sx={{
                      '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="관리자 메모"
                    multiline
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="정산 처리에 대한 메모..."
                    sx={{
                      '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                    }}
                  />
                </>
              )}
              {selectedSettlement.transactionId && selectedSettlement.status !== 'pending' && (
                <Box>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">거래 ID</Typography>
                  <Typography variant="body1" color="#fff">{selectedSettlement.transactionId}</Typography>
                </Box>
              )}
              {selectedSettlement.adminNote && selectedSettlement.status !== 'pending' && (
                <Box>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">관리자 메모</Typography>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, mt: 1 }}>
                    <Typography variant="body2" color="#fff" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedSettlement.adminNote}
                    </Typography>
                  </Card>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setSettlementDialog(false); setSelectedSettlement(null); setAdminNote(''); setTransactionId(''); }} sx={{ color: 'rgba(255,255,255,0.6)' }}>닫기</Button>
          {selectedSettlement?.status === 'pending' && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleProcessSettlementWithDetails('rejected')}
              >
                거절
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleProcessSettlementWithDetails('completed')}
              >
                정산 완료
              </Button>
            </>
          )}
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
