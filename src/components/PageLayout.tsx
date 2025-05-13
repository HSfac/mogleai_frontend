'use client';

import { Box } from '@mui/material';
import MobileNavBar from './MobileNavBar';
import TopHeader from './TopHeader';
import { usePathname } from 'next/navigation';

export default function PageLayout({ children, showHeader = true }) {
  const pathname = usePathname();
  
  // 페이지별 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (pathname === '/') return 'Babe Chat';
    if (pathname.startsWith('/characters')) return '캐릭터';
    if (pathname.startsWith('/chat')) return '대화';
    if (pathname.startsWith('/notifications')) return '알림';
    if (pathname.startsWith('/profile')) return '프로필';
    return 'Babe Chat';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        maxWidth: '520px',  // 모바일 앱 최대 너비를 더 넓게 조정
        mx: 'auto',        // 중앙 정렬
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {showHeader && <TopHeader title={getHeaderTitle()} />}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: '70px',  // 하단 네비게이션 바 공간 확보
          overflowY: 'auto',
          height: '100vh'
        }}
      >
        {children}
      </Box>
      <MobileNavBar />
    </Box>
  );
} 