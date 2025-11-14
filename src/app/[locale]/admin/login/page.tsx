'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminToken.trim()) {
      setError('관리자 토큰을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 토큰을 localStorage에 저장
      localStorage.setItem('adminToken', adminToken);

      // 대시보드로 이동
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('로그인 실패:', error);
      setError('로그인에 실패했습니다.');
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
              label="관리자 토큰"
              type={showToken ? 'text' : 'password'}
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="ADMIN_TOKEN 환경변수 값을 입력하세요"
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowToken(!showToken)} edge="end">
                      {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
              <strong>참고:</strong> 관리자 토큰은 백엔드 .env 파일의 ADMIN_TOKEN 값입니다.
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
