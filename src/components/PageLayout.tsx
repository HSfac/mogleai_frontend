'use client';

import { Box } from '@mui/material';
import MobileNavBar from './MobileNavBar';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';
import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export default function PageLayout({ children, showHeader = true }: PageLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#1a1a1a',
        display: 'flex',
      }}
    >
      {showHeader && <Sidebar />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: showHeader ? { xs: 0, md: '240px' } : 0,
          minHeight: '100vh',
          pb: showHeader ? { xs: 10, md: 0 } : 0,
        }}
      >
        {showHeader && <MobileHeader />}
        {children}
      </Box>

      {showHeader && <MobileNavBar />}
    </Box>
  );
}
