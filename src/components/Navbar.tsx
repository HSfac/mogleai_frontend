'use client';

import { useState, type MouseEvent } from 'react';
import { Box, Button, Avatar, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const navItems = [
  { name: '홈', path: '/' },
  { name: '캐릭터 탐색', path: '/characters' },
  { name: '인기 캐릭터', path: '/characters/popular' },
  { name: '내 캐릭터', path: '/characters/my', auth: true },
  { name: '캐릭터 만들기', path: '/characters/create', auth: true },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const filteredItems = navItems.filter(item => !item.auth || (item.auth && isAuthenticated));

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    logout();
    handleCloseMenu();
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, md: 4 },
          py: 2,
          maxWidth: '1400px',
          mx: 'auto',
        }}
      >
        <Button
          component={Link}
          href="/"
          sx={{
            fontWeight: 800,
            fontSize: { xs: 18, md: 22 },
            textTransform: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #654593 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            },
          }}
        >
          몽글AI
        </Button>

        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}
          >
            {filteredItems.map(item => (
              <Button
                key={item.name}
                component={Link}
                href={item.path}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'rgba(102,126,234,0.08)',
                    color: '#667eea',
                  },
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isAuthenticated ? (
            <Avatar
              onClick={handleOpenMenu}
              alt={user?.username || '사용자'}
              src={user?.profileImage || ''}
              sx={{
                cursor: 'pointer',
                width: 40,
                height: 40,
                border: '2px solid',
                borderColor: '#667eea',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            />
          ) : (
            <>
              <Button
                component={Link}
                href="/login"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'text.primary',
                  '&:hover': {
                    color: '#667eea',
                  },
                }}
              >
                로그인
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#667eea',
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  '&:hover': {
                    bgcolor: '#5568d3',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                회원가입
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            minWidth: 160,
          },
        }}
      >
        <MenuItem
          component={Link}
          href="/profile"
          onClick={handleCloseMenu}
          sx={{
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'rgba(102,126,234,0.08)',
              color: '#667eea',
            },
          }}
        >
          프로필
        </MenuItem>
        <MenuItem
          onClick={handleSignOut}
          sx={{
            fontWeight: 500,
            color: '#f5576c',
            '&:hover': {
              bgcolor: 'rgba(245,87,108,0.08)',
            },
          }}
        >
          로그아웃
        </MenuItem>
      </Menu>
    </Box>
  );
}
