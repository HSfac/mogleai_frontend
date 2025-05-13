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
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useState } from 'react';
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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (!agreeTerms) {
      setError('이용약관에 동의해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      await register(formData.username, formData.email, formData.password);
      
      setSuccess('회원가입이 완료되었습니다.');
    } catch (error) {
      console.error('회원가입 중 오류가 발생했습니다:', error);
      setError(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    // 소셜 로그인 구현
    // 실제 구현은 백엔드와 연동 필요
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleCloseSuccess = () => {
    setSuccess('');
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
            pt: 2,
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
            회원가입
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            베이비챗에서 AI 캐릭터와 대화를 시작하세요!
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mb: 4 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="사용자 이름"
              name="username"
              autoComplete="name"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
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
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="비밀번호 확인"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              size="small"
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={agreeTerms} 
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  <Link href="/terms" passHref>
                    <MuiLink variant="body2" underline="hover" color="#ff5e62">
                      이용약관
                    </MuiLink>
                  </Link>
                  과{' '}
                  <Link href="/privacy" passHref>
                    <MuiLink variant="body2" underline="hover" color="#ff5e62">
                      개인정보 처리방침
                    </MuiLink>
                  </Link>
                  에 동의합니다.
                </Typography>
              }
              sx={{ mt: 2 }}
            />
            
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : '회원가입'}
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
              이미 계정이 있으신가요?{' '}
              <Link href="/login" passHref>
                <MuiLink variant="body2" underline="hover" fontWeight="medium" color="#ff5e62">
                  로그인
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
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSuccess} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
} 