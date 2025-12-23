'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  keyframes,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '@/contexts/AuthContext';

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 51, 102, 0.5); }
  50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(255, 51, 102, 0.8); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  redirectAfterLogin?: string;
}

type Mode = 'login' | 'register';

export const LoginModal: React.FC<LoginModalProps> = ({
  open,
  onClose,
  message = '이 기능을 이용하려면 로그인이 필요해요',
  redirectAfterLogin,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, username);
      }
      onClose();
      if (redirectAfterLogin) {
        window.location.href = redirectAfterLogin;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const redirectUrl = redirectAfterLogin ? `?redirect=${encodeURIComponent(redirectAfterLogin)}` : '';
    window.location.href = `${baseUrl}/auth/${provider}${redirectUrl}`;
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: '#0a0a0f',
          border: '1px solid rgba(255, 51, 102, 0.3)',
          boxShadow: '0 0 60px rgba(255, 51, 102, 0.2), 0 25px 50px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          position: 'relative',
        },
      }}
    >
      {/* 배경 글로우 효과 */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 51, 102, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          animation: `${glowPulse} 3s ease-in-out infinite`,
        }}
      />

      {/* 상단 네온 라인 */}
      <Box
        sx={{
          height: 3,
          background: 'linear-gradient(90deg, transparent, #ff3366, #ff6699, #ff3366, transparent)',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 2s linear infinite`,
          boxShadow: '0 0 20px #ff3366, 0 0 40px rgba(255, 51, 102, 0.5)',
        }}
      />

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* 닫기 버튼 */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'rgba(255,255,255,0.4)',
            bgcolor: 'rgba(255,255,255,0.05)',
            '&:hover': {
              color: '#ff3366',
              bgcolor: 'rgba(255, 51, 102, 0.1)',
            },
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ p: 4, pt: 5 }}>
          {/* 헤더 */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff3366 0%, #ff6699 100%)',
                mb: 2.5,
                animation: `${pulse} 2s ease-in-out infinite`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: -3,
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 51, 102, 0.5)',
                  animation: `${float} 3s ease-in-out infinite`,
                },
              }}
            >
              <FavoriteIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color: '#fff',
                mb: 1,
                textShadow: '0 0 30px rgba(255, 51, 102, 0.5)',
              }}
            >
              {mode === 'login' ? '로그인' : '회원가입'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.6)',
                maxWidth: 280,
                mx: 'auto',
              }}
            >
              {message}
            </Typography>
          </Box>

          {/* 에러 메시지 */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 2,
                bgcolor: 'rgba(255, 51, 102, 0.1)',
                border: '1px solid rgba(255, 51, 102, 0.3)',
                color: '#ff6699',
                '& .MuiAlert-icon': { color: '#ff3366' },
              }}
            >
              {error}
            </Alert>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {mode === 'register' && (
                <TextField
                  fullWidth
                  placeholder="닉네임"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#ff3366' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: 'rgba(255, 51, 102, 0.05)',
                      color: '#fff',
                      '& fieldset': { borderColor: 'rgba(255, 51, 102, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 51, 102, 0.4)' },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff3366',
                        boxShadow: '0 0 15px rgba(255, 51, 102, 0.3)',
                      },
                    },
                    '& input::placeholder': { color: 'rgba(255,255,255,0.4)' },
                  }}
                />
              )}

              <TextField
                fullWidth
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#ff3366' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255, 51, 102, 0.05)',
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 51, 102, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 51, 102, 0.4)' },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff3366',
                      boxShadow: '0 0 15px rgba(255, 51, 102, 0.3)',
                    },
                  },
                  '& input::placeholder': { color: 'rgba(255,255,255,0.4)' },
                }}
              />

              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#ff3366' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#ff3366' } }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255, 51, 102, 0.05)',
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 51, 102, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 51, 102, 0.4)' },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff3366',
                      boxShadow: '0 0 15px rgba(255, 51, 102, 0.3)',
                    },
                  },
                  '& input::placeholder': { color: 'rgba(255,255,255,0.4)' },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.8,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #ff3366 0%, #ff6699 100%)',
                  boxShadow: '0 0 30px rgba(255, 51, 102, 0.5), 0 8px 25px rgba(255, 51, 102, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff1a53 0%, #ff5588 100%)',
                    boxShadow: '0 0 40px rgba(255, 51, 102, 0.7), 0 12px 35px rgba(255, 51, 102, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.1)',
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={26} sx={{ color: '#fff' }} />
                ) : mode === 'login' ? (
                  '로그인'
                ) : (
                  '회원가입'
                )}
              </Button>
            </Stack>
          </form>

          {/* 구분선 */}
          <Divider
            sx={{
              my: 3.5,
              borderColor: 'rgba(255, 51, 102, 0.2)',
              '&::before, &::after': {
                borderColor: 'rgba(255, 51, 102, 0.2)',
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.4)',
                px: 2,
                fontSize: '0.8rem',
              }}
            >
              또는
            </Typography>
          </Divider>

          {/* 소셜 로그인 */}
          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleSocialLogin('google')}
              sx={{
                py: 1.4,
                borderRadius: 2.5,
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.03)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#ff3366',
                  bgcolor: 'rgba(255, 51, 102, 0.1)',
                  boxShadow: '0 0 20px rgba(255, 51, 102, 0.2)',
                },
              }}
            >
              Google로 계속하기
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ChatBubbleIcon />}
              onClick={() => handleSocialLogin('kakao')}
              sx={{
                py: 1.4,
                borderRadius: 2.5,
                borderColor: 'rgba(254, 229, 0, 0.3)',
                color: '#FEE500',
                bgcolor: 'rgba(254, 229, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#FEE500',
                  bgcolor: 'rgba(254, 229, 0, 0.15)',
                  boxShadow: '0 0 20px rgba(254, 229, 0, 0.2)',
                },
              }}
            >
              카카오로 계속하기
            </Button>
          </Stack>

          {/* 모드 전환 */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
              <Box
                component="span"
                onClick={toggleMode}
                sx={{
                  color: '#ff3366',
                  cursor: 'pointer',
                  fontWeight: 700,
                  textShadow: '0 0 10px rgba(255, 51, 102, 0.5)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#ff6699',
                    textShadow: '0 0 15px rgba(255, 51, 102, 0.8)',
                  },
                }}
              >
                {mode === 'login' ? '회원가입' : '로그인'}
              </Box>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
