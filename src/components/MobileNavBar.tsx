'use client';

import { useMemo } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function MobileNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  const t = useTranslations();

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'ko';
  const getLocalePath = (path: string) => `/${locale}${path}`;

  const value = useMemo(() => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    if (pathWithoutLocale === '/') return 0;
    if (pathWithoutLocale === '/chats') return 1;
    if (pathWithoutLocale?.startsWith('/characters/create')) return 2;
    if (pathWithoutLocale?.startsWith('/characters')) return 3;
    if (pathWithoutLocale?.startsWith('/profile')) return 4;
    return 0;
  }, [pathname, locale]);

  const handleNavigate = (index: number) => {
    switch (index) {
      case 0:
        router.push(getLocalePath('/'));
        break;
      case 1:
        router.push(getLocalePath('/chats'));
        break;
      case 2:
        router.push(getLocalePath('/characters/create'));
        break;
      case 3:
        router.push(getLocalePath('/characters'));
        break;
      case 4:
        if (isAuthenticated) {
          router.push(getLocalePath('/profile'));
        } else {
          router.push(getLocalePath('/login'));
        }
        break;
    }
  };

  if (!isMdDown) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: '#1f1f1f',
        borderTop: '1px solid #333',
        zIndex: 1200,
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue) => handleNavigate(newValue)}
        sx={{
          bgcolor: 'transparent',
          height: 70,
          '& .MuiBottomNavigationAction-root': {
            color: '#666',
            minWidth: 'auto',
            '&.Mui-selected': {
              color: '#ff3366',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 500,
            '&.Mui-selected': {
              fontSize: '0.7rem',
              fontWeight: 700,
            },
          },
        }}
      >
        <BottomNavigationAction label={t('nav.home')} icon={<HomeIcon />} />
        <BottomNavigationAction label={t('nav.chat')} icon={<ChatIcon />} />
        <BottomNavigationAction
          label={t('nav.create')}
          icon={<AddCircleIcon sx={{ fontSize: 32 }} />}
        />
        <BottomNavigationAction label={t('nav.bonly')} icon={<LocalOfferIcon />} />
        <BottomNavigationAction label={t('nav.mypage')} icon={<PersonIcon />} />
      </BottomNavigation>
    </Box>
  );
}
