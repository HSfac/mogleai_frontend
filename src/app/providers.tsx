'use client';

import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { initSentry } from '@/lib/sentry';

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
    fontFamily: [
      '"Pretendard"',
      '"Noto Sans KR"',
      '-apple-system',
      'BlinkMacSystemFont',
      'system-ui',
      'sans-serif',
    ].join(','),
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
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          textTransform: 'none',
          padding: '10px 18px',
          fontWeight: 700,
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
          borderRadius: 14,
        },
        elevation8: {
          boxShadow: '0 16px 42px rgba(255, 96, 155, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 12px 38px rgba(255, 96, 155, 0.18)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '10px !important',
          fontWeight: 600,
          borderColor: 'rgba(255, 96, 155, 0.22)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px !important',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: '10px !important',
          textTransform: 'none',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          overflow: 'hidden',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
  },
});

const theme = responsiveFontSizes(baseTheme);

export function Providers({ children }: { children: ReactNode }) {
  const [emotionCache] = useState(createEmotionCache());

  useEffect(() => {
    initSentry();
  }, []);

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
