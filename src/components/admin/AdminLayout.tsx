'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReportIcon from '@mui/icons-material/Report';
import CampaignIcon from '@mui/icons-material/Campaign';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HelpIcon from '@mui/icons-material/Help';
import ImageIcon from '@mui/icons-material/Image';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const DRAWER_WIDTH = 260;

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { label: '대시보드', path: '/admin/dashboard', icon: DashboardIcon },
  { label: '사용자 관리', path: '/admin/users', icon: PeopleIcon },
  { label: '캐릭터 관리', path: '/admin/characters', icon: SmartToyIcon },
  { label: '크리에이터', path: '/admin/creators', icon: HandshakeIcon },
  { label: '결제 관리', path: '/admin/payments', icon: AttachMoneyIcon },
  { label: '신고 관리', path: '/admin/reports', icon: ReportIcon },
  { divider: true },
  { label: '공지사항', path: '/admin/announcements', icon: CampaignIcon },
  { label: '쿠폰 관리', path: '/admin/coupons', icon: LocalOfferIcon },
  { label: '정산 관리', path: '/admin/settlements', icon: AccountBalanceIcon },
  { label: 'FAQ 관리', path: '/admin/faqs', icon: HelpIcon },
  { label: '배너 관리', path: '/admin/banners', icon: ImageIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  // 현재 로케일 추출
  const locale = pathname?.split('/')[1] || 'ko';

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push(`/${locale}/admin/login`);
  };

  const handleNavigate = (path: string) => {
    router.push(`/${locale}${path}`);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (path: string) => {
    const fullPath = `/${locale}${path}`;
    return pathname === fullPath || pathname?.startsWith(fullPath + '/');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 로고 */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src="/icon.png"
          sx={{ width: 40, height: 40, bgcolor: '#ff5e62' }}
        >
          M
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#fff">
            몽글AI
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.5)">
            관리자 패널
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* 메뉴 */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {menuItems.map((item, index) => {
          if ('divider' in item && item.divider) {
            return (
              <Divider
                key={`divider-${index}`}
                sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }}
              />
            );
          }

          const Icon = item.icon!;
          const active = isActive(item.path!);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path!)}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'rgba(255,94,98,0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: active
                      ? 'rgba(255,94,98,0.2)'
                      : 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Icon
                    sx={{
                      color: active ? '#ff5e62' : 'rgba(255,255,255,0.5)',
                      fontSize: 22,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#ff5e62' : 'rgba(255,255,255,0.8)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* 로그아웃 */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.03)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ExitToAppIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
          </ListItemIcon>
          <ListItemText
            primary="로그아웃"
            primaryTypographyProps={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#1a1a1a' }}>
      {/* 모바일 헤더 */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            bgcolor: '#1a1a1a',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'none',
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ color: '#fff', mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} color="#fff">
              관리자 패널
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* 사이드바 */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#141414',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 메인 컨텐츠 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: isMobile ? '64px' : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
