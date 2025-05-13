'use client';

import { useState } from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MobileNavBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    
    switch(newValue) {
      case 0:
        router.push('/');
        break;
      case 1:
        router.push('/characters');
        break;
      case 2:
        router.push('/characters/create');
        break;
      case 3:
        router.push('/chat');
        break;
      case 4:
        if (session) {
          router.push('/profile');
        } else {
          router.push('/login');
        }
        break;
      default:
        break;
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '520px', // PageLayout과 동일한 너비로 설정
        zIndex: 1000,
        borderRadius: '0'
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{ 
          height: '60px',
          '& .MuiBottomNavigationAction-root': {
            color: '#999',
            '&.Mui-selected': {
              color: '#ff5e62'
            }
          }
        }}
      >
        <BottomNavigationAction label="홈" icon={<HomeIcon />} />
        <BottomNavigationAction label="탐색" icon={<SearchIcon />} />
        <BottomNavigationAction 
          label="생성" 
          icon={
            <AddCircleIcon 
              sx={{ 
                fontSize: '32px', 
                color: '#ff5e62'
              }} 
            />
          } 
        />
        <BottomNavigationAction label="대화" icon={<ChatIcon />} />
        <BottomNavigationAction label="프로필" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
} 