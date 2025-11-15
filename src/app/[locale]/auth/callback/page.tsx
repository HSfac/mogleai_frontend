'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Paper, Container } from '@mui/material';
import { authService } from '@/services/authService';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 토큰 추출
        const token = searchParams.get('access_token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('소셜 로그인에 실패했습니다.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        if (!token) {
          setError('인증 토큰이 없습니다.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        // 토큰 저장
        const result = await authService.handleSocialCallback(token);

        if (result.success) {
          // 로그인 성공 - 메인 페이지로 리다이렉트
          router.push('/');
        } else {
          setError('로그인 처리 중 오류가 발생했습니다.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('소셜 로그인 콜백 처리 실패:', error);
        setError('로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {error ? (
            <>
              <Typography variant="h5" color="error" gutterBottom>
                ⚠️ 로그인 실패
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                {error}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                잠시 후 로그인 페이지로 이동합니다...
              </Typography>
            </>
          ) : (
            <>
              <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                로그인 처리 중...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                잠시만 기다려주세요
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
