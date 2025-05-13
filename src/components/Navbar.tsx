'use client';

import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleSignOut = () => {
    signOut();
    handleProfileMenuClose();
  };
  
  const navItems = [
    { name: '홈', path: '/' },
    { name: '캐릭터 탐색', path: '/characters' },
    { name: '인기 캐릭터', path: '/characters/popular' },
    { name: '내 캐릭터', path: '/characters/my', auth: true },
    { name: '캐릭터 만들기', path: '/characters/create', auth: true },
  ];
  
  const filteredNavItems = navItems.filter(item => !item.auth || (item.auth && session));
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            몽글AI
          </Typography>
          
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={isDrawerOpen}
                onClose={handleDrawerToggle}
              >
                <Box
                  sx={{ width: 250 }}
                  role="presentation"
                  onClick={handleDrawerToggle}
                >
                  <List>
                    {filteredNavItems.map((item) => (
                      <ListItem key={item.name} disablePadding>
                        <ListItemButton 
                          component={Link} 
                          href={item.path}
                        >
                          <ListItemText primary={item.name} />
                          <ChevronRightIcon />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    {session ? (
                      <>
                        <ListItem disablePadding>
                          <ListItemButton component={Link} href="/profile">
                            <ListItemText primary="프로필" />
                          </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemButton onClick={handleSignOut}>
                            <ListItemText primary="로그아웃" />
                          </ListItemButton>
                        </ListItem>
                      </>
                    ) : (
                      <>
                        <ListItem disablePadding>
                          <ListItemButton component={Link} href="/login">
                            <ListItemText primary="로그인" />
                          </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemButton component={Link} href="/register">
                            <ListItemText primary="회원가입" />
                          </ListItemButton>
                        </ListItem>
                      </>
                    )}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {filteredNavItems.map((item) => (
                  <Button
                    key={item.name}
                    component={Link}
                    href={item.path}
                    sx={{ mx: 1 }}
                  >
                    {item.name}
                  </Button>
                ))}
                
                {session ? (
                  <>
                    <IconButton
                      onClick={handleProfileMenuOpen}
                      sx={{ ml: 2 }}
                    >
                      <Avatar 
                        sx={{ width: 32, height: 32 }}
                        alt={session.user?.name || '사용자'}
                        src={session.user?.image || ''}
                      />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleProfileMenuClose}
                    >
                      <MenuItem 
                        component={Link} 
                        href="/profile"
                        onClick={handleProfileMenuClose}
                      >
                        프로필
                      </MenuItem>
                      <MenuItem onClick={handleSignOut}>
                        로그아웃
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button 
                      component={Link} 
                      href="/login"
                      sx={{ mx: 1 }}
                    >
                      로그인
                    </Button>
                    <Button 
                      component={Link} 
                      href="/register"
                      variant="contained" 
                      color="primary"
                      sx={{ mx: 1 }}
                    >
                      회원가입
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
} 