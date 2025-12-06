import api from '@/lib/api';
import {
  World,
  CreateWorldDto,
  UpdateWorldDto,
  WorldQueryOptions,
  WorldListResponse,
  PopularTag,
} from '@/types/world';

export const worldService = {
  // 세계관 목록 조회
  async getWorlds(options?: WorldQueryOptions): Promise<WorldListResponse> {
    const params: Record<string, any> = {};
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;
    if (options?.search) params.search = options.search;
    if (options?.tags && options.tags.length > 0) {
      params.tags = options.tags.join(',');
    }

    const response = await api.get('/worlds', { params });
    return response.data;
  },

  // 인기 세계관 조회
  async getPopularWorlds(limit?: number): Promise<World[]> {
    const response = await api.get('/worlds/popular', {
      params: { limit },
    });
    return response.data;
  },

  // 인기 태그 조회
  async getPopularTags(limit?: number): Promise<PopularTag[]> {
    const response = await api.get('/worlds/tags/popular', {
      params: { limit },
    });
    return response.data;
  },

  // 내가 만든 세계관 조회
  async getMyWorlds(): Promise<World[]> {
    const response = await api.get('/worlds/my');
    return response.data;
  },

  // 세계관 상세 조회
  async getWorld(id: string): Promise<World> {
    const response = await api.get(`/worlds/${id}`);
    return response.data;
  },

  // 세계관 생성
  async createWorld(data: CreateWorldDto): Promise<World> {
    const response = await api.post('/worlds', data);
    return response.data;
  },

  // 세계관 수정
  async updateWorld(id: string, data: UpdateWorldDto): Promise<World> {
    const response = await api.put(`/worlds/${id}`, data);
    return response.data;
  },

  // 세계관 삭제
  async deleteWorld(id: string): Promise<void> {
    await api.delete(`/worlds/${id}`);
  },

  // 세계관 좋아요
  async likeWorld(id: string): Promise<World> {
    const response = await api.post(`/worlds/${id}/like`);
    return response.data;
  },
};
