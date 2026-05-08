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
  FormControlLabel,
  Checkbox,
  alpha,
  keyframes,
} from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import GoogleIcon from '@mui/icons-material/Google';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

const rotateAnim = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const rotateReverse = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;
const softGlow = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const socialPlatforms = [
  { name: 'google', icon: <GoogleIcon />, color: '#DB4437' },
  { name: 'kakao', icon: <ChatBubbleIcon />, color: '#FEE500' },
];

const initialForm = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const { getLocalePath } = useLocaleNavigation();
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      await register(formData.email, formData.password, formData.username);
      setSuccess('회원가입이 완료되었습니다!');
    } catch (error: any) {
      console.error('회원가입 중 오류가 발생했습니다:', error);
      setError(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'google') {
      authService.loginWithGoogle();
    } else if (provider === 'kakao') {
      authService.loginWithKakao();
    } else {
      setError(`${provider} 로그인은 현재 준비 중입니다.`);
    }
  };

  const handleCloseError = () => setError('');
  const handleCloseSuccess = () => setSuccess('');

  return (
    <PageLayout showHeader={false}>
      <Box sx={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', position: 'relative' }}>
        {/* Navigation Button */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 20, md: 32 },
            left: { xs: 20, md: 32 },
            zIndex: 10,
          }}
        >
          <Link href={getLocalePath('/')} style={{ textDecoration: 'none' }}>
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
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 4, md: 6 }, pt: { xs: 10, md: 6 } }}>
          <Container maxWidth="sm">
          <Box sx={{ maxWidth: 480, width: '100%' }}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', mb: 2 }}>
                회원가입
              </Typography>
              <Typography variant="body1" sx={{ color: '#555', letterSpacing: '0.02em' }}>
                처음 뵙겠습니다.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="사용자 이름"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
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
                label="이메일"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
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
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                fullWidth
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

              <TextField
                label="비밀번호 확인"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
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

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    sx={{ color: '#666', '&.Mui-checked': { color: '#ff3366' } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    <MuiLink component={Link} href={getLocalePath('/terms')} sx={{ color: '#ff3366', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      이용약관
                    </MuiLink>{' '}및{' '}
                    <MuiLink component={Link} href={getLocalePath('/privacy')} sx={{ color: '#ff3366', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      개인정보처리방침
                    </MuiLink>에 동의합니다.
                  </Typography>
                }
              />

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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : '회원가입'}
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
                이미 계정이 있으신가요?{' '}
                <MuiLink component={Link} href={getLocalePath('/login')} sx={{ color: '#ff3366', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  로그인하기
                </MuiLink>
              </Typography>
            </Box>
          </Box>
          </Container>
        </Box>

        {/* Right Side - Abstract Visual */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: '#060610',
            borderLeft: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {/* Dot grid */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
          }} />

          {/* Ambient glow */}
          <Box sx={{
            position: 'absolute',
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,51,102,0.07) 0%, transparent 65%)',
            filter: 'blur(30px)',
            animation: `${softGlow} 5s ease-in-out infinite`,
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: '12%',
            right: '10%',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(80,40,160,0.07) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />

          {/* Outer static ring */}
          <Box sx={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.03)',
          }} />

          {/* Middle ring — clockwise */}
          <Box sx={{
            position: 'absolute',
            width: 350,
            height: 350,
            borderRadius: '50%',
            border: '1px solid rgba(255,51,102,0.11)',
            animation: `${rotateAnim} 40s linear infinite`,
          }}>
            <Box sx={{
              position: 'absolute',
              top: -3,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'rgba(255,51,102,0.55)',
              boxShadow: '0 0 8px rgba(255,51,102,0.4)',
            }} />
            {/* Second satellite at 180° */}
            <Box sx={{
              position: 'absolute',
              bottom: -3,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 4,
              height: 4,
              borderRadius: '50%',
              bgcolor: 'rgba(255,51,102,0.3)',
            }} />
          </Box>

          {/* Inner ring — counter-clockwise */}
          <Box sx={{
            position: 'absolute',
            width: 210,
            height: 210,
            borderRadius: '50%',
            border: '1px solid rgba(255,51,102,0.22)',
            animation: `${rotateReverse} 24s linear infinite`,
          }}>
            <Box sx={{
              position: 'absolute',
              top: -5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#ff3366',
              boxShadow: '0 0 14px #ff3366, 0 0 28px rgba(255,51,102,0.35)',
            }} />
          </Box>

          {/* Core */}
          <Box sx={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: '#fff',
            boxShadow: '0 0 18px rgba(255,255,255,0.5), 0 0 36px rgba(255,51,102,0.25)',
            animation: `${softGlow} 3s ease-in-out infinite`,
          }} />

          {/* Wordmark */}
          <Box sx={{ position: 'absolute', bottom: 36, left: 0, right: 0, textAlign: 'center' }}>
            <Typography sx={{
              color: 'rgba(255,255,255,0.13)',
              fontSize: '0.62rem',
              letterSpacing: 9,
              textTransform: 'uppercase',
              fontWeight: 300,
            }}>
              monglai
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSuccess} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSuccess} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
