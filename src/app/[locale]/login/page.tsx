'use client';

import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
  Stack,
  alpha,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import GoogleIcon from '@mui/icons-material/Google';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

const socialPlatforms = [
  { name: 'google', icon: <GoogleIcon />, color: '#DB4437' },
  { name: 'kakao', icon: <ChatBubbleIcon />, color: '#FEE500' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
    } catch (error: any) {
      console.error('로그인 중 오류가 발생했습니다:', error);
      setError(error.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    if (provider === 'google') {
      window.location.href = `${backendUrl}/auth/google`;
    } else if (provider === 'kakao') {
      window.location.href = `${backendUrl}/auth/kakao`;
    } else {
      setError(`${provider} 로그인은 현재 준비 중입니다.`);
    }
  };

  const handleCloseError = () => {
    setError('');
  };

  return (
    <PageLayout showHeader={false}>
      <Box
        sx={{
          minHeight: '100vh',
          background: '#0a0a0a',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Navigation Button */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 20, md: 32 },
            left: { xs: 20, md: 32 },
            zIndex: 10,
          }}
        >
          <Link href="/" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              sx={{
                borderColor: '#333',
                color: '#fff',
                bgcolor: 'rgba(26, 26, 26, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                px: 2.5,
                py: 1,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#ff3366',
                  bgcolor: 'rgba(255, 51, 102, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(255, 51, 102, 0.2)',
                },
              }}
            >
              홈으로
            </Button>
          </Link>
        </Box>

        {/* Left Side - Form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 4, md: 6 },
            pt: { xs: 10, md: 6 },
          }}
        >
          <Container maxWidth="sm">
          <Box sx={{ maxWidth: 480, width: '100%' }}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', mb: 2 }}>
                로그인
              </Typography>
              <Typography variant="body1" sx={{ color: '#999' }}>
                몽글AI에서 AI 캐릭터와 대화하세요
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="이메일"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1a1a1a',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                    '&.Mui-focused fieldset': { borderColor: '#ff3366', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#ff3366' },
                }}
              />

              <TextField
                label="비밀번호"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#999' }}>
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1a1a1a',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                    '&.Mui-focused fieldset': { borderColor: '#ff3366', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#ff3366' },
                }}
              />

              <Box sx={{ textAlign: 'right', mt: -1 }}>
                <Link href="/forgot-password" passHref>
                  <MuiLink sx={{ color: '#666', fontSize: '0.9rem', '&:hover': { color: '#ff3366' } }}>
                    비밀번호를 잊으셨나요?
                  </MuiLink>
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  bgcolor: '#ff3366',
                  py: 1.8,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#e62958' },
                  '&.Mui-disabled': { bgcolor: '#ff3366', opacity: 0.6 },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
              </Button>

              <Divider sx={{ '&::before, &::after': { borderColor: '#333' } }}>
                <Typography variant="body2" sx={{ color: '#666' }}>또는</Typography>
              </Divider>

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => handleSocialLogin('google')}
                  startIcon={<GoogleIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#333',
                    bgcolor: '#fff',
                    color: '#333',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#DB4437',
                      bgcolor: '#fff',
                      '& .MuiButton-startIcon': {
                        color: '#DB4437',
                      }
                    },
                  }}
                >
                  Google로 계속하기
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleSocialLogin('kakao')}
                  startIcon={<ChatBubbleIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: '#FEE500',
                    color: '#000',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#FDD835',
                    },
                  }}
                >
                  카카오로 계속하기
                </Button>
              </Stack>

              <Typography variant="body1" sx={{ textAlign: 'center', color: '#999' }}>
                계정이 없으신가요?{' '}
                <Link href="/register" passHref>
                  <MuiLink sx={{ color: '#ff3366', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    회원가입하기
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </Box>
          </Container>
        </Box>

        {/* Right Side - Mascot Image */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#0f0f0f',
            borderLeft: '1px solid #1a1a1a',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)',
            }}
          >
            <Box
              sx={{
                fontSize: '15rem',
                opacity: 0.3,
                filter: 'blur(2px)',
              }}
            >
              🤖
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
