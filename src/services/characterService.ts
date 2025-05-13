import { Character } from '@/types/character';
import { api } from '@/lib/api';

export async function fetchCharacters(): Promise<Character[]> {
  try {
    const response = await api.get('/characters');
    return response.data;
  } catch (error) {
    console.error('캐릭터 데이터를 가져오는 중 오류가 발생했습니다:', error);
    throw error;
  }
}

export async function fetchCharacterById(id: string): Promise<Character> {
  try {
    const response = await api.get(`/characters/${id}`);
    return response.data;
  } catch (error) {
    console.error(`ID ${id}의 캐릭터를 가져오는 중 오류가 발생했습니다:`, error);
    throw error;
  }
} 