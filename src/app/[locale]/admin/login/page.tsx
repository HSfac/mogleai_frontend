'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { adminService } from '@/services/adminService';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

export default function AdminLoginPage() {
  const { push } = useLocaleNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminService.login(email, password);
      push('/admin/dashboard');
    } catch (err: any) {
      console.error('로그인 실패:', err);
      const message = err.response?.data?.message || '로그인에 실패했습니다.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 80, color: '#ff5e62', mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              관리자 로그인
            </Typography>
            <Typography variant="body1" color="text.secondary">
              몽글AI 관리자 페이지
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@monglai.com"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              required
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: '#ff5e62',
                '&:hover': { bgcolor: '#ff4b50' },
                py: 1.5,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
            </Button>
          </form>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#fff9e6', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>참고:</strong> 관리자 권한이 있는 계정으로만 로그인할 수 있습니다.
              관리자 권한이 필요하면 기존 관리자에게 문의하세요.
            </Typography>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
