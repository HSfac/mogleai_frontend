'use client';

import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Step,
  Stepper,
  StepLabel,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '@/lib/api';

const steps = ['이메일 입력', '인증 코드 입력', '새 비밀번호 설정'];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await api.post('/auth/password-reset/request', { email });
      setSuccess(response.data.message);
      setActiveStep(1);
    } catch (error: any) {
      console.error('비밀번호 재설정 요청 중 오류:', error);
      setError(error.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await api.post('/auth/password-reset/confirm', {
        email,
        token,
        newPassword,
      });
      setSuccess(response.data.message);
      setActiveStep(2);

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('비밀번호 재설정 중 오류:', error);
      setError(error.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => setError('');
  const handleCloseSuccess = () => setSuccess('');

  return (
    <PageLayout showHeader={false}>
      <Box
        sx={{
          minHeight: '100vh',
          background: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ mb: 4 }}>
            <Link href="/login" passHref>
              <Button
                startIcon={<ArrowBackIcon />}
                sx={{ color: '#999', mb: 3, '&:hover': { color: '#ff3366' } }}
              >
                로그인으로 돌아가기
              </Button>
            </Link>

            <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', mb: 2 }}>
              비밀번호 찾기
            </Typography>
            <Typography variant="body1" sx={{ color: '#999', mb: 4 }}>
              등록된 이메일로 인증 코드를 발송해드립니다
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': { color: '#666' },
                      '& .MuiStepLabel-label.Mui-active': { color: '#ff3366' },
                      '& .MuiStepLabel-label.Mui-completed': { color: '#4caf50' },
                      '& .MuiStepIcon-root': { color: '#333' },
                      '& .MuiStepIcon-root.Mui-active': { color: '#ff3366' },
                      '& .MuiStepIcon-root.Mui-completed': { color: '#4caf50' },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {activeStep === 0 && (
            <Box component="form" onSubmit={handleRequestReset}>
              <TextField
                label="이메일"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 3,
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

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : '인증 코드 받기'}
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box component="form" onSubmit={handleResetPassword}>
              <Alert severity="info" sx={{ mb: 3, bgcolor: '#1a3a52', color: '#90caf9' }}>
                이메일로 전송된 6자리 인증 코드를 입력해주세요. (개발 중이므로 콘솔을 확인하세요)
              </Alert>

              <TextField
                label="인증 코드"
                fullWidth
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="6자리 숫자"
                sx={{
                  mb: 3,
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
                label="새 비밀번호"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{
                  mb: 3,
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
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{
                  mb: 3,
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

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : '비밀번호 재설정'}
              </Button>
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" sx={{ color: '#4caf50', mb: 2, fontWeight: 700 }}>
                비밀번호가 재설정되었습니다!
              </Typography>
              <Typography sx={{ color: '#999', mb: 3 }}>
                잠시 후 로그인 페이지로 이동합니다...
              </Typography>
              <CircularProgress sx={{ color: '#ff3366' }} />
            </Box>
          )}
        </Container>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
