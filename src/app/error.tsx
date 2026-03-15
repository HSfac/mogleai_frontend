'use client';

import { useEffect } from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff5f8 0%, #ffe8f0 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f44336, #ff7961)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              boxShadow: '0 20px 40px rgba(244, 67, 54, 0.3)',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 60, color: '#fff' }} />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f44336, #ff7961)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            오류 발생
          </Typography>

          <Typography
            variant="h5"
            fontWeight={600}
            color="text.primary"
            gutterBottom
          >
            문제가 발생했습니다
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            문제가 지속되면 고객센터로 문의해주세요.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={reset}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                bgcolor: '#ff5f9b',
                '&:hover': { bgcolor: '#e54d87' },
              }}
            >
              다시 시도
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<HomeIcon />}
              component={Link}
              href="/"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                borderColor: '#ff5f9b',
                color: '#ff5f9b',
                '&:hover': {
                  borderColor: '#e54d87',
                  bgcolor: 'rgba(255, 95, 155, 0.05)',
                },
              }}
            >
              홈으로 돌아가기
            </Button>
          </Stack>

          {process.env.NODE_ENV === 'development' && error.digest && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 4, display: 'block' }}
            >
              Error ID: {error.digest}
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}
