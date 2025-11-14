'use client';

import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ReactNode, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

const createEmotionCache = () => {
  return createCache({ key: 'css', prepend: true });
};

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff5f9b',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ffbbd3',
      contrastText: '#381240',
    },
    background: {
      default: '#fff5fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c0f22',
      secondary: '#6e4a60',
    },
  },
  typography: {
    fontFamily: ['"Inter"', 'Roboto', '"Noto Sans KR"', 'sans-serif'].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          padding: '10px 22px',
          fontWeight: 600,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#fff',
        },
        elevation8: {
          boxShadow: '0 20px 60px rgba(255, 96, 155, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'rgba(255,255,255,0.9)',
          boxShadow: '0 12px 45px rgba(255, 96, 155, 0.25)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 600,
          borderColor: 'rgba(255, 96, 155, 0.25)',
        },
      },
    },
  },
});

const theme = responsiveFontSizes(baseTheme);

export function Providers({ children }: { children: ReactNode }) {
  const [emotionCache] = useState(createEmotionCache());

  return (
    <CacheProvider value={emotionCache}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </CacheProvider>
  );
}
