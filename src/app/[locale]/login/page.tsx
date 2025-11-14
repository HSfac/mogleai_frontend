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
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

const socialPlatforms = [
  { name: 'google', icon: <GoogleIcon />, color: '#DB4437' },
  { name: 'apple', icon: <AppleIcon />, color: '#000' },
  { name: 'facebook', icon: <FacebookIcon />, color: '#4267B2' },
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
    setError(`${provider} 로그인은 현재 준비 중입니다.`);
  };

  const handleCloseError = () => {
    setError('');
  };

  return (
    <PageLayout showHeader={false}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16162e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '50%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,51,102,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '40%',
            height: '80%',
            background: 'radial-gradient(circle, rgba(102,126,234,0.06) 0%, transparent 70%)',
            borderRadius: '50%',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            {/* Logo */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #ff3366 0%, #ff6699 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.75rem',
                  color: '#fff',
                  boxShadow: '0 8px 32px rgba(255,51,102,0.3)',
                }}
              >
                몽
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', letterSpacing: -1 }}>
                몽글AI
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#fff', mb: 1.5 }}>
              어서오세요! 👋
            </Typography>
            <Typography variant="body1" sx={{ color: '#b0b0c8', fontSize: '1.05rem' }}>
              나만의 AI 캐릭터와 대화를 시작하세요
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 1,
              background: 'rgba(30, 30, 46, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              p: { xs: 4, sm: 5 },
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}
          >

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <TextField
                label="이메일"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff3366',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff3366',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ff3366',
                  },
                }}
              />
              <TextField
                label="비밀번호"
                variant="outlined"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#b0b0c8' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff3366',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff3366',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ff3366',
                  },
                }}
              />

              <Box sx={{ textAlign: 'right', mt: -1.5 }}>
                <Link href="/forgot-password" passHref>
                  <MuiLink
                    sx={{
                      color: '#b0b0c8',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      '&:hover': {
                        color: '#ff3366',
                      },
                    }}
                  >
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
                  background: 'linear-gradient(135deg, #ff3366 0%, #ff6699 100%)',
                  py: 1.8,
                  borderRadius: 1,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(255,51,102,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e62958 0%, #ff5588 100%)',
                    boxShadow: '0 12px 32px rgba(255,51,102,0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-disabled': {
                    background: 'linear-gradient(135deg, #ff3366 0%, #ff6699 100%)',
                    opacity: 0.6,
                    color: '#fff',
                  },
                  transition: 'all 0.3s',
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
              </Button>

              <Divider sx={{ my: 1, '&::before, &::after': { borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
                <Typography variant="body2" sx={{ color: '#b0b0c8' }}>
                  또는
                </Typography>
              </Divider>

              <Stack direction="row" spacing={2} justifyContent="center">
                {socialPlatforms.map((platform) => (
                  <IconButton
                    key={platform.name}
                    onClick={() => handleSocialLogin(platform.name)}
                    sx={{
                      width: 60,
                      height: 60,
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: '#ff3366',
                        bgcolor: 'rgba(255, 51, 102, 0.1)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(255,51,102,0.2)',
                      },
                    }}
                  >
                    <Box sx={{ color: platform.color, fontSize: 26 }}>{platform.icon}</Box>
                  </IconButton>
                ))}
              </Stack>

              <Typography
                variant="body1"
                sx={{ textAlign: 'center', mt: 2, color: '#b0b0c8' }}
              >
                계정이 없으신가요?{' '}
                <Link href="/register" passHref>
                  <MuiLink
                    sx={{
                      color: '#ff3366',
                      fontWeight: 700,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    회원가입하기
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
