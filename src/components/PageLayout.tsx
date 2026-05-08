'use client';

import { Box } from '@mui/material';
import MobileNavBar from './MobileNavBar';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';
import { ReactNode, useState } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  hideBottomNav?: boolean;
  hideFooter?: boolean;
}

export default function PageLayout({
  children,
  showHeader = true,
  hideBottomNav,
  hideFooter,
}: PageLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const shouldHideBottomNav = hideBottomNav ?? hideFooter ?? false;

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
        style={{ '--sidebar-width': showHeader ? `${sidebarWidth}px` : '0px' } as React.CSSProperties}
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: showHeader ? { xs: 0, md: `${sidebarWidth}px` } : 0,
          minHeight: '100vh',
          pb: showHeader && !shouldHideBottomNav ? { xs: 10, md: 0 } : 0,
          transition: 'margin-left 0.3s ease',
        }}
      >
        {showHeader && <MobileHeader />}
        {children}
      </Box>

      {showHeader && !shouldHideBottomNav && <MobileNavBar />}
    </Box>
  );
}
