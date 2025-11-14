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
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { paymentService } from '@/services/paymentService';

interface PaymentRecord {
  _id: string;
  amount: number;
  tokens: number;
  status: string;
  type: 'token_purchase' | 'subscription';
  createdAt: string;
}

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
            borderRadius: 28,
            p: { xs: 3, md: 4 },
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,95,155,0.95), rgba(255,214,227,0.95))',
            color: '#fff',
            boxShadow: '0 30px 60px rgba(255, 95, 155, 0.35)',
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
              borderRadius: 20,
              textAlign: 'center',
              py: 6,
              boxShadow: '0 12px 30px rgba(255, 95, 155, 0.1)',
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
                    borderRadius: 20,
                    border: '1px solid rgba(255, 95, 155, 0.2)',
                    boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
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
                      <Chip label={record.status} color="secondary" size="small" />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 999, mt: 1 }}
                        onClick={() => setToast({ message: '결제 상세는 준비 중입니다.', severity: 'success' })}
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
          {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
        </Snackbar>
      </Container>
    </PageLayout>
  );
}
