'use client';

import {
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function TopHeader({ title = '몽글AI' }) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        bgcolor: '#000',
        color: 'white'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#ff5e62',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Box 
            component="span" 
            sx={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%', 
              bgcolor: '#ff5e62', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mr: 1,
              fontSize: '16px'
            }}
          >
            B
          </Box>
          {title}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          color="inherit" 
          sx={{ mr: 1 }}
          onClick={() => router.push('/download')}
        >
          <CloudDownloadIcon sx={{ color: 'white' }} />
        </IconButton>
        
        <IconButton 
          color="inherit" 
          sx={{ mr: 1 }}
          onClick={() => router.push('/search')}
        >
          <SearchIcon sx={{ color: 'white' }} />
        </IconButton>
        
        <IconButton 
          color="inherit"
          onClick={() => router.push('/notifications')}
        >
          <Badge badgeContent={3} color="error">
            <NotificationsIcon sx={{ color: 'white' }} />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  );
} 