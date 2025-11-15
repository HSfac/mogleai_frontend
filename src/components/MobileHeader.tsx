'use client';

import { Box, IconButton, Typography, Badge, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const t = useTranslations();

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'ko';
  const getLocalePath = (path: string) => `/${locale}${path}`;

  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        bgcolor: '#1a1a1a',
        borderBottom: '1px solid #333',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
        onClick={() => router.push(getLocalePath('/'))}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            background: 'linear-gradient(135deg, #ff3366 0%, #ff6699 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            color: '#fff',
          }}
        >
          몽
        </Box>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', fontSize: '1.1rem' }}>
          {t('common.appName')}
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          sx={{ color: '#999' }}
          onClick={() => router.push(getLocalePath('/search'))}
        >
          <SearchIcon />
        </IconButton>
        <IconButton
          size="small"
          sx={{ color: '#999' }}
          onClick={() => router.push(getLocalePath('/notifications'))}
        >
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Avatar
          onClick={() => router.push(getLocalePath(isAuthenticated ? '/profile' : '/login'))}
          sx={{
            width: 28,
            height: 28,
            bgcolor: '#ff3366',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          {isAuthenticated ? user?.username?.[0] || 'U' : '?'}
        </Avatar>
      </Box>
    </Box>
  );
}
