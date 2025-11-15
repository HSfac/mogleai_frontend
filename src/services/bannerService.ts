import api from '@/lib/api';

export interface Banner {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerDto {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
  order?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {}

export const bannerService = {
  // 모든 배너 조회
  async getAllBanners(): Promise<Banner[]> {
    const response = await api.get('/banners');
    return response.data;
  },

  // 활성화된 배너만 조회
  async getActiveBanners(): Promise<Banner[]> {
    const response = await api.get('/banners/active');
    return response.data;
  },

  // 배너 생성 (관리자)
  async createBanner(data: CreateBannerDto): Promise<Banner> {
    const response = await api.post('/banners', data);
    return response.data;
  },

  // 배너 수정 (관리자)
  async updateBanner(id: string, data: UpdateBannerDto): Promise<Banner> {
    const response = await api.put(`/banners/${id}`, data);
    return response.data;
  },

  // 배너 삭제 (관리자)
  async deleteBanner(id: string): Promise<void> {
    await api.delete(`/banners/${id}`);
  },
};
