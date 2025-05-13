'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Stack,
  CircularProgress,
  CardActionArea,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import axios from 'axios';

export default function PopularCharactersPage() {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchPopularCharacters = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/characters/popular`);
        setCharacters(response.data);
      } catch (error) {
        console.error('인기 캐릭터를 불러오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularCharacters();
  }, []);

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom fontWeight="bold">
          인기 캐릭터
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          사용자들이 가장 많이 대화한 AI 캐릭터들을 만나보세요
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {characters.map((character, index) => (
              <Grid item key={character._id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    },
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {index < 3 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        zIndex: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      {index + 1}
                    </Box>
                  )}
                  <CardActionArea onClick={() => router.push(`/characters/${character._id}`)}>
                    <CardMedia
                      component="img"
                      height={isMobile ? "180" : "220"}
                      image={character.imageUrl || '/images/default-character.png'}
                      alt={character.name}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography gutterBottom variant="h5" component="h2" fontWeight="medium">
                        {character.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                          height: '40px'
                        }}
                      >
                        {character.description}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar 
                          sx={{ width: 24, height: 24 }}
                          alt={character.creator?.username}
                          src={character.creator?.profileImage}
                        />
                        <Typography variant="caption" color="text.secondary">
                          by {character.creator?.username || '알 수 없음'}
                        </Typography>
                      </Stack>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 2,
                          color: 'text.secondary'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          대화 {character.conversationCount || 0}회
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </PageLayout>
  );
} 