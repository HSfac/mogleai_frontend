'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Avatar,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import PageLayout from '@/components/PageLayout';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// 에러 코드별 메시지 매핑
const ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: '결제가 취소되었습니다.',
  PAY_PROCESS_ABORTED: '결제 진행 중 문제가 발생했습니다.',
  REJECT_CARD_COMPANY: '카드사에서 결제를 거부했습니다. 카드사에 문의해주세요.',
  BELOW_MINIMUM_AMOUNT: '최소 결제 금액 미만입니다.',
  INVALID_CARD_EXPIRATION: '카드 유효기간이 만료되었습니다.',
  INVALID_STOPPED_CARD: '정지된 카드입니다.',
  EXCEED_MAX_DAILY_PAYMENT_COUNT: '일일 결제 한도를 초과했습니다.',
  EXCEED_MAX_PAYMENT_AMOUNT: '결제 한도를 초과했습니다.',
  INVALID_CARD_NUMBER: '유효하지 않은 카드 번호입니다.',
  INVALID_CARD_LOST_OR_STOLEN: '분실 또는 도난 신고된 카드입니다.',
  NOT_ALLOWED_POINT_USE: '포인트 사용이 불가능한 카드입니다.',
  INVALID_API_KEY: '결제 시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  INVALID_AUTHORIZE_AUTH: '인증에 실패했습니다.',
};

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const errorCode = searchParams.get('code') || '';
  const errorMessage = searchParams.get('message') || '';

  const displayMessage = useMemo(() => {
    if (ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }
    return errorMessage || '결제가 완료되지 않았습니다.';
  }, [errorCode, errorMessage]);

  const isUserCanceled = errorCode === 'PAY_PROCESS_CANCELED';

  return (
    <PageLayout>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card
          sx={{
            borderRadius: 4,
            px: 4,
            py: 5,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
          }}
        >
          <Avatar
            sx={{
              bgcolor: isUserCanceled ? '#fef3c7' : '#fee2e2',
              color: isUserCanceled ? '#d97706' : '#ef4444',
              width: 100,
              height: 100,
              mx: 'auto',
              mb: 3,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 60 }} />
          </Avatar>

          <Typography variant="h4" fontWeight={700} gutterBottom>
            {isUserCanceled ? '결제가 취소되었습니다' : '결제에 실패했습니다'}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {displayMessage}
          </Typography>

          {errorCode && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 3,
                textAlign: 'left',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                에러 코드: {errorCode}
              </Typography>
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          <Stack spacing={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={() => router.push('/pricing')}
              sx={{
                borderRadius: 2,
                py: 1.5,
                bgcolor: '#ff5f9b',
                '&:hover': { bgcolor: '#e54d87' },
              }}
            >
              다시 시도하기
            </Button>

            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => router.push('/')}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                홈으로
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SupportAgentIcon />}
                onClick={() => window.open('mailto:support@monglai.com', '_blank')}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                문의하기
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ mt: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              결제 관련 문의: support@monglai.com
            </Typography>
          </Box>
        </Card>
      </Container>
    </PageLayout>
  );
}
