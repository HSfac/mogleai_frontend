'use client';

import {
  Box,
  Typography,
  IconButton,
  Badge,
  Chip,
  Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TokenIcon from '@mui/icons-material/Token';
import { useAuth } from '@/contexts/AuthContext';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

export default function TopHeader({ title = '몽글AI' }) {
  const { push } = useLocaleNavigation();
  const { user, loading } = useAuth();
  const { unreadCount } = useNotificationSocket();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        background: 'linear-gradient(120deg, rgba(255,111,169,0.95), rgba(255,182,217,0.85))',
        color: '#fff',
        boxShadow: '0 20px 45px rgba(255, 94, 155, 0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="span"
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          B
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ letterSpacing: 0.3 }}>
            캐릭터 기반 AI 챗봇
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => push('/notifications')}
          sx={{ color: 'inherit' }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={() => push('/search')} sx={{ color: 'inherit' }}>
          <SearchIcon />
        </IconButton>

        <IconButton onClick={() => push('/tokens')} sx={{ color: 'inherit' }}>
          <TokenIcon />
        </IconButton>

        {loading ? (
          <Skeleton variant="circular" width={36} height={36} />
        ) : (
          <Chip
            label={user?.username || '게스트'}
            variant="filled"
            color="secondary"
            sx={{ borderRadius: 99, fontSize: 13 }}
          />
        )}
      </Box>
    </Box>
  );
}
