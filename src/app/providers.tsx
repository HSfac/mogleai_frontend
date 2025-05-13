'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

// 기본 테마 정의
const theme = createTheme({
  palette: {
    primary: {
      main: '#5a01e5', // 원래 brand.500 색상과 비슷한 색상
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 