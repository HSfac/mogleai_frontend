'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  IconButton,
  InputAdornment,
  Chip,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import PageLayout from '@/components/PageLayout';
import { Character } from '@/types/character';
import Image from 'next/image';
import Link from 'next/link';

export default function CharactersPage() {
  const router = useRouter();
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [popularCharacters, setPopularCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchCharacters();
    fetchPopularCharacters();
    fetchFavorites();
  }, []);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/characters`);
      setCharacters(response.data);
    } catch (error) {
      console.error('캐릭터 목록을 가져오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularCharacters = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/characters/popular`);
      setPopularCharacters(response.data);
    } catch (error) {
      console.error('인기 캐릭터 목록을 가져오는데 실패했습니다:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/favorites`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setFavorites(response.data);
    } catch (error) {
      console.error('즐겨찾기 목록을 가져오는데 실패했습니다:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCharacters();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/characters/search?q=${searchQuery}`
      );
      setCharacters(response.data);
      setTabValue(0);
    } catch (error) {
      console.error('캐릭터 검색에 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleFavorite = async (characterId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/characters');
      return;
    }
    
    try {
      if (favorites.includes(characterId)) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me/favorites/${characterId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setFavorites(favorites.filter(id => id !== characterId));
      } else {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me/favorites/${characterId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setFavorites([...favorites, characterId]);
      }
    } catch (error) {
      console.error('즐겨찾기 업데이트에 실패했습니다:', error);
    }
  };

  // 현재 탭에 따라 표시할 캐릭터 목록 결정
  const displayedCharacters = tabValue === 0 ? characters : popularCharacters;

  return (
    <PageLayout>
      <div className="characters-container">
        <div className="characters-header">
          <h1 className="characters-title">캐릭터 갤러리</h1>
          <p className="characters-subtitle">당신의 이야기를 함께할 캐릭터들을 만나보세요</p>
        </div>

        {loading ? (
          <div className="characters-loading">
            <div className="spinner"></div>
            <p>캐릭터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="characters-grid">
            {displayedCharacters.map((character) => (
              <Link href={`/characters/${character._id}`} key={character._id}>
                <div className="character-card">
                  <div className="character-image-container">
                    {character.imageUrl ? (
                      <Image 
                        src={character.imageUrl} 
                        alt={character.name} 
                        width={200} 
                        height={200}
                        className="character-image"
                      />
                    ) : (
                      <div className="character-image-placeholder">
                        <span>{character.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="character-info">
                    <h2 className="character-name">{character.name}</h2>
                    <p className="character-description">{character.description?.substring(0, 100)}...</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
} 