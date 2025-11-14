'use client';

import {
  Avatar,
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState(false);

  useEffect(() => {
    const errorMsg = searchParams.get('message') || '결제 처리 중 오류가 발생했습니다.';
    setMessage(errorMsg);
    setSnackbar(!!errorMsg);
  }, [searchParams]);

  return (
    <PageLayout>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card
          sx={{
            borderRadius: 28,
            px: 4,
            py: 5,
            textAlign: 'center',
            boxShadow: '0 30px 60px rgba(255, 95, 155, 0.3)',
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mx: 'auto',
              mb: 3,
              bgcolor: '#fff4f8',
              color: '#ff5f9b',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            결제가 실패했습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {message}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" sx={{ borderRadius: 999 }} onClick={() => router.push('/pricing')}>
              다시 시도
            </Button>
            <Button variant="contained" color="secondary" sx={{ borderRadius: 999 }} onClick={() => router.push('/')}>
              홈으로
            </Button>
          </Stack>
        </Card>
      </Container>
      <Snackbar open={snackbar} autoHideDuration={4000} onClose={() => setSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error">{message}</Alert>
      </Snackbar>
    </PageLayout>
  );
}
