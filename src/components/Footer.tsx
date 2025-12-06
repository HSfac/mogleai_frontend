'use client';

import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';



export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'grey.100', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              몽글AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              나만의 AI 캐릭터를 만들고 대화하세요
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              링크
            </Typography>
            <Link href="/" color="inherit" display="block" sx={{ mb: 1 }}>
              홈
            </Link>
            <Link href="/characters" color="inherit" display="block" sx={{ mb: 1 }}>
              캐릭터 탐색
            </Link>
            <Link href="/characters/popular" color="inherit" display="block" sx={{ mb: 1 }}>
              인기 캐릭터
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              고객 지원
            </Typography>
            <Link href="/faq" color="inherit" display="block" sx={{ mb: 1 }}>
              자주 묻는 질문
            </Link>
            <Link href="/contact" color="inherit" display="block" sx={{ mb: 1 }}>
              문의하기
            </Link>
            <Link href="/terms" color="inherit" display="block" sx={{ mb: 1 }}>
              이용약관
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} 몽글AI. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
} 