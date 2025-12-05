import api from '@/lib/api';
import {
  PersonaPreset,
  CreatePresetDto,
  UpdatePresetDto,
} from '@/types/preset';

export const presetService = {
  // 캐릭터의 프리셋 목록 조회
  async getPresetsByCharacter(characterId: string): Promise<PersonaPreset[]> {
    const response = await api.get(`/characters/${characterId}/presets`);
    return response.data;
  },

  // 프리셋 상세 조회
  async getPreset(presetId: string): Promise<PersonaPreset> {
    const response = await api.get(`/presets/${presetId}`);
    return response.data;
  },

  // 프리셋 생성
  async createPreset(characterId: string, data: CreatePresetDto): Promise<PersonaPreset> {
    const response = await api.post(`/characters/${characterId}/presets`, data);
    return response.data;
  },

  // 프리셋 수정
  async updatePreset(presetId: string, data: UpdatePresetDto): Promise<PersonaPreset> {
    const response = await api.put(`/presets/${presetId}`, data);
    return response.data;
  },

  // 프리셋 삭제
  async deletePreset(presetId: string): Promise<void> {
    await api.delete(`/presets/${presetId}`);
  },

  // 기본 프리셋으로 설정
  async setDefaultPreset(presetId: string): Promise<PersonaPreset> {
    const response = await api.post(`/presets/${presetId}/set-default`);
    return response.data;
  },

  // 프리셋 복제
  async duplicatePreset(presetId: string, title: string): Promise<PersonaPreset> {
    const response = await api.post(`/presets/${presetId}/duplicate`, { title });
    return response.data;
  },
};
