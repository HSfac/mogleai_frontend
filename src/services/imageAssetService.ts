import { api } from '@/lib/api';
import {
  ImageAsset,
  ImageSlotUsage,
  ImageAssetType,
  UpdateImageAssetDto,
} from '@/types/imageAsset';

export const imageAssetService = {
  /**
   * 이미지 업로드 및 자산 등록
   */
  async uploadAsset(
    file: File,
    options: {
      worldId?: string;
      characterId?: string;
      presetId?: string;
      type: ImageAssetType;
      tags?: string[];
      description?: string;
      isAdultContent?: boolean;
    },
  ): Promise<ImageAsset> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', options.type);

    if (options.worldId) formData.append('worldId', options.worldId);
    if (options.characterId) formData.append('characterId', options.characterId);
    if (options.presetId) formData.append('presetId', options.presetId);
    if (options.description) formData.append('description', options.description);
    if (options.isAdultContent !== undefined) {
      formData.append('isAdultContent', String(options.isAdultContent));
    }
    if (options.tags) {
      options.tags.forEach((tag) => formData.append('tags', tag));
    }

    const response = await api.post('/image-assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * 이미지 슬롯 사용량 조회
   */
  async getSlotUsage(characterId?: string, worldId?: string): Promise<ImageSlotUsage> {
    const params = new URLSearchParams();
    if (characterId) params.append('characterId', characterId);
    if (worldId) params.append('worldId', worldId);

    const response = await api.get(`/image-assets/slot-usage?${params.toString()}`);
    return response.data;
  },

  /**
   * 내 이미지 자산 목록 조회
   */
  async getMyAssets(options?: {
    type?: ImageAssetType;
    limit?: number;
    offset?: number;
  }): Promise<{ assets: ImageAsset[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));

    const response = await api.get(`/image-assets/my?${params.toString()}`);
    return response.data;
  },

  /**
   * 캐릭터의 이미지 자산 목록 조회
   */
  async getCharacterAssets(characterId: string): Promise<ImageAsset[]> {
    const response = await api.get(`/image-assets/character/${characterId}`);
    return response.data;
  },

  /**
   * 세계관의 이미지 자산 목록 조회
   */
  async getWorldAssets(worldId: string): Promise<ImageAsset[]> {
    const response = await api.get(`/image-assets/world/${worldId}`);
    return response.data;
  },

  /**
   * 이미지 자산 상세 조회
   */
  async getAsset(assetId: string): Promise<ImageAsset> {
    const response = await api.get(`/image-assets/${assetId}`);
    return response.data;
  },

  /**
   * 이미지 자산 수정
   */
  async updateAsset(assetId: string, data: UpdateImageAssetDto): Promise<ImageAsset> {
    const response = await api.put(`/image-assets/${assetId}`, data);
    return response.data;
  },

  /**
   * 이미지 자산 삭제
   */
  async deleteAsset(assetId: string): Promise<void> {
    await api.delete(`/image-assets/${assetId}`);
  },
};
