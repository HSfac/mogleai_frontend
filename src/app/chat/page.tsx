'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PageLayout from '@/components/PageLayout';
import axios from 'axios';

export default function ChatPage() {
  const router = useRouter();
  const theme = useTheme();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    // 로그인 확인
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/chat');
      return;
    }
    
    // 데이터 로드
    const fetchData = async () => {
      setLoading(true);
      try {
        // 캐릭터 목록 가져오기
        const charactersResponse = await axios.get('/api/characters/popular');
        setCharacters(charactersResponse.data);
        
        // 최근 대화 가져오기
        const chatsResponse = await axios.get('/api/chats/recent');
        setRecentChats(chatsResponse.data);
        
        // 즐겨찾기 가져오기
        const favoritesResponse = await axios.get('/api/users/me/favorites');
        setFavorites(favoritesResponse.data);
      } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);
  
  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          대화하기
        </Typography>
        
        {/* 최근 대화 섹션 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            최근 대화
          </Typography>
          
          {recentChats.length > 0 ? (
            <List>
              {recentChats.map((chat) => (
                <ListItem
                  key={chat._id}
                  button
                  onClick={() => router.push(`/chat/${chat._id}`)}
                  divider
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={chat.characterInfo?.imageUrl} 
                      alt={chat.characterInfo?.name}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={chat.characterInfo?.name}
                    secondary={`마지막 대화: ${new Date(chat.lastActivity).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                아직 대화 내역이 없습니다.
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/chat/history')}
            >
              모든 대화 보기
            </Button>
          </Box>
        </Paper>
        
        {/* 인기 캐릭터 섹션 */}
        <Typography variant="h6" gutterBottom>
          인기 캐릭터와 대화하기
        </Typography>
        
        <Grid container spacing={3}>
          {characters.map((character) => (
            <Grid item xs={12} sm={6} md={4} key={character._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={character.imageUrl}
                    alt={character.name}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      border: `3px solid ${theme.palette.background.paper}`,
                      boxShadow: 1
                    }}
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      right: 16,
                      zIndex: 1
                    }}
                  >
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        // 즐겨찾기 토글 로직
                      }}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                      }}
                    >
                      {favorites.some(fav => fav._id === character._id) ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Box>
                </Box>
                
                <CardContent sx={{ pt: 8, pb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {character.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {character.description}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {character.tags?.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Stack>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => router.push(`/chat/new?character=${character._id}`)}
                    startIcon={<SendIcon />}
                  >
                    대화하기
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/characters')}
          >
            더 많은 캐릭터 보기
          </Button>
        </Box>
      </Container>
    </PageLayout>
  );
} 