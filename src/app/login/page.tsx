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
  Alert
} from '@mui/material';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        setIsLoading(false);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('로그인 중 오류가 발생했습니다:', error);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error(`${provider} 로그인 중 오류가 발생했습니다:`, error);
      setError(`${provider} 로그인 중 오류가 발생했습니다. 다시 시도해주세요.`);
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError('');
  };

  return (
    <PageLayout showHeader={false}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: '#fff'
        }}
      >
        <Box sx={{ p: 2 }}>
          <IconButton 
            edge="start" 
            onClick={() => router.back()}
            sx={{ mb: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: 3,
            pt: 4,
            pb: 8
          }}
        >
          <Box 
            component="div" 
            sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              bgcolor: '#ff5e62', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3,
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            B
          </Box>
          
          <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
            로그인
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            베이비챗에 오신 것을 환영합니다!
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mb: 4 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Link href="/forgot-password" passHref>
                <MuiLink variant="body2" underline="hover" color="text.secondary">
                  비밀번호를 잊으셨나요?
                </MuiLink>
              </Link>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                bgcolor: '#ff5e62',
                '&:hover': {
                  bgcolor: '#ff4b50'
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
            </Button>
          </Box>
          
          <Box sx={{ width: '100%', mb: 4 }}>
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                또는
              </Typography>
            </Divider>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Paper
                elevation={0}
                sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer'
                }}
                onClick={() => handleSocialLogin('google')}
              >
                <GoogleIcon sx={{ color: '#DB4437' }} />
              </Paper>
              
              <Paper
                elevation={0}
                sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer'
                }}
                onClick={() => handleSocialLogin('apple')}
              >
                <AppleIcon sx={{ color: '#000' }} />
              </Paper>
              
              <Paper
                elevation={0}
                sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer'
                }}
                onClick={() => handleSocialLogin('facebook')}
              >
                <FacebookIcon sx={{ color: '#4267B2' }} />
              </Paper>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              계정이 없으신가요?{' '}
              <Link href="/register" passHref>
                <MuiLink variant="body2" underline="hover" fontWeight="medium" color="#ff5e62">
                  회원가입
                </MuiLink>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
} 