'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from '@mui/material';
import PageLayout from '@/components/PageLayout';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reason = useMemo(() => {
    return (
      searchParams.get('message') ||
      searchParams.get('code') ||
      '결제가 완료되지 않았습니다.'
    );
  }, [searchParams]);

  useEffect(() => {
    // 잠재적으로 오류 코드/메시지를 콘솔에 남겨 디버깅
    // 서버 로깅이 있다면 추후 연동
    // eslint-disable-next-line no-console
    console.warn('Payment failed:', {
      code: searchParams.get('code'),
      message: searchParams.get('message'),
    });
  }, [searchParams]);

  return (
    <PageLayout>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ borderRadius: 2, p: 2 }}>
          <CardContent>
            <Box display="flex" flexDirection="column" gap={2} alignItems="center" textAlign="center">
              <Typography variant="h5" fontWeight={700}>
                결제에 실패했습니다
              </Typography>
              <Typography color="text.secondary">{reason}</Typography>
              <Box display="flex" gap={1} mt={1}>
                <Button variant="contained" color="secondary" onClick={() => router.push('/tokens')}>
                  다시 시도하기
                </Button>
                <Button variant="outlined" onClick={() => router.push('/')}>
                  홈으로 이동
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  );
}
