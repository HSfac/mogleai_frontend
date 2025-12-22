export enum ImageAssetType {
  PROFILE = 'profile',
  ILLUSTRATION = 'illustration',
  BACKGROUND = 'background',
  PRESET = 'preset',
  WORLD_COVER = 'world_cover',
  OTHER = 'other',
}

export const ImageAssetTypeLabels: Record<ImageAssetType, string> = {
  [ImageAssetType.PROFILE]: '프로필',
  [ImageAssetType.ILLUSTRATION]: '일러스트',
  [ImageAssetType.BACKGROUND]: '배경',
  [ImageAssetType.PRESET]: '프리셋',
  [ImageAssetType.WORLD_COVER]: '세계관 커버',
  [ImageAssetType.OTHER]: '기타',
};

export interface ImageAsset {
  _id: string;
  ownerId: string;
  worldId?: string;
  characterId?: string;
  presetId?: string;
  type: ImageAssetType;
  url: string;
  fileName: string;
  fileSize: number;
  tags: string[];
  description?: string;
  isAdultContent: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImageSlotUsage {
  characterSlots: {
    used: number;
    total: number;
    remaining: number;
  };
  worldSlots?: {
    used: number;
    total: number;
    remaining: number;
  };
}

export interface CreateImageAssetDto {
  worldId?: string;
  characterId?: string;
  presetId?: string;
  type: ImageAssetType;
  tags?: string[];
  description?: string;
  isAdultContent?: boolean;
}

export interface UpdateImageAssetDto {
  tags?: string[];
  description?: string;
  type?: ImageAssetType;
}
