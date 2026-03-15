'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import { useEffect, useMemo, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { paymentService, type PaymentRecord } from '@/services/paymentService';

const filters = [
  { label: '전체', value: 'all' },
  { label: '토큰 구매', value: 'token_purchase' },
  { label: '구독', value: 'subscription' },
];

export default function PaymentHistoryPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'token_purchase' | 'subscription'>('all');
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleOpenDetail = (record: PaymentRecord) => {
    setSelectedPayment(record);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedPayment(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'failed':
      case 'cancelled':
      case 'refunded':
        return <CancelIcon sx={{ color: '#f44336' }} />;
      default:
        return <PendingIcon sx={{ color: '#ff9800' }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: '결제 완료',
      pending: '처리 중',
      failed: '결제 실패',
      cancelled: '취소됨',
      refunded: '환불됨',
    };
    return labels[status] || status;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await paymentService.getPaymentHistory();
        setRecords(data);
      } catch (error) {
        console.error(error);
        setToast({ message: '결제 내역을 불러오는 중 오류가 발생했습니다.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return records;
    return records.filter((record) => record.type === filter);
  }, [filter, records]);

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,95,155,0.95), rgba(255,214,227,0.95))',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(255, 95, 155, 0.25)',
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            결제 내역
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            토큰 구매와 구독 결제 모두 이 페이지에서 확인할 수 있습니다.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
          {filters.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              variant={filter === item.value ? 'filled' : 'outlined'}
              color="secondary"
              onClick={() => setFilter(item.value as any)}
              sx={{ borderRadius: 8 }}
            />
          ))}
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: '#ff5f9b' }} />
          </Box>
        ) : filteredRecords.length === 0 ? (
          <Card
            sx={{
              borderRadius: 3,
              textAlign: 'center',
              py: 6,
              boxShadow: '0 4px 16px rgba(255, 95, 155, 0.08)',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              해당 필터에 맞는 결제 기록이 없습니다.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredRecords.map((record) => (
              <Grid item xs={12} sm={6} md={4} key={record._id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '1px solid rgba(255, 95, 155, 0.2)',
                    boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
                  }}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={700}>
                        {record.type === 'token_purchase' ? '토큰 구매' : '구독 결제'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(record.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="h4" color="#ff5f9b" fontWeight={700}>
                        {record.amount.toLocaleString()}원
                      </Typography>
                      {record.tokens && (
                        <Chip label={`${record.tokens.toLocaleString()} 토큰`} variant="outlined" />
                      )}
                      <Chip label={getStatusLabel(record.status)} color="secondary" size="small" />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2, mt: 1 }}
                        onClick={() => handleOpenDetail(record)}
                      >
                        상세 보기
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
        </Snackbar>

        {/* 결제 상세 모달 */}
        <Dialog
          open={detailOpen}
          onClose={handleCloseDetail}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
            }
          }}
        >
          {selectedPayment && (
            <>
              <DialogTitle
                sx={{
                  background: 'linear-gradient(135deg, #ff5f9b, #ffbbd3)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ReceiptIcon />
                결제 상세
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Stack spacing={2.5}>
                  {/* 상태 표시 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      py: 2,
                      borderRadius: 3,
                      bgcolor: selectedPayment.status === 'completed' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                    }}
                  >
                    {getStatusIcon(selectedPayment.status)}
                    <Typography variant="h6" fontWeight={600}>
                      {getStatusLabel(selectedPayment.status)}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* 결제 정보 */}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      결제 유형
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedPayment.type === 'token_purchase' ? '토큰 구매' : '구독 결제'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      결제 금액
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="#ff5f9b">
                      {selectedPayment.amount.toLocaleString()}원
                    </Typography>
                  </Box>

                  {selectedPayment.tokens > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        충전된 토큰
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedPayment.tokens.toLocaleString()} 토큰
                      </Typography>
                    </Box>
                  )}

                  <Divider />

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      결제 일시
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedPayment.createdAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>

                  {selectedPayment.orderId && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        주문 번호
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {selectedPayment.orderId}
                      </Typography>
                    </Box>
                  )}

                  {selectedPayment.paymentMethod && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        결제 수단
                      </Typography>
                      <Typography variant="body1">
                        {selectedPayment.paymentMethod}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                  onClick={handleCloseDetail}
                  variant="contained"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    bgcolor: '#ff5f9b',
                    '&:hover': { bgcolor: '#e54d87' },
                  }}
                >
                  닫기
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </PageLayout>
  );
}
