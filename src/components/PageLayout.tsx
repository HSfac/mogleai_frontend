'use client';

import { Box } from '@mui/material';
import MobileNavBar from './MobileNavBar';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';
import { ReactNode, useState } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export default function PageLayout({ children, showHeader = true }: PageLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(240);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#1a1a1a',
        display: 'flex',
      }}
    >
      {showHeader && <Sidebar onWidthChange={setSidebarWidth} />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: showHeader ? { xs: 0, md: `${sidebarWidth}px` } : 0,
          minHeight: '100vh',
          pb: showHeader ? { xs: 10, md: 0 } : 0,
          transition: 'margin-left 0.3s ease',
        }}
      >
        {showHeader && <MobileHeader />}
        {children}
      </Box>

      {showHeader && <MobileNavBar />}
    </Box>
  );
}
