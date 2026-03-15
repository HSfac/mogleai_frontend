'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

export default function NotFound() {
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
              background: 'linear-gradient(135deg, #ff5f9b, #ffbbd3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              boxShadow: '0 20px 40px rgba(255, 95, 155, 0.3)',
            }}
          >
            <SearchOffIcon sx={{ fontSize: 60, color: '#fff' }} />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', md: '6rem' },
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ff5f9b, #ff8fab)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h5"
            fontWeight={600}
            color="text.primary"
            gutterBottom
          >
            페이지를 찾을 수 없습니다
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            주소를 다시 확인해주세요.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              component={Link}
              href="/"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                bgcolor: '#ff5f9b',
                '&:hover': { bgcolor: '#e54d87' },
              }}
            >
              홈으로 돌아가기
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => window.history.back()}
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
              이전 페이지로
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
