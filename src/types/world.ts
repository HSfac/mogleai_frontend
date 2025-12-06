// 공개 범위 enum
export enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FOLLOWERS_ONLY = 'followers_only',
}

// 세계관 인터페이스
export interface World {
  _id: string;
  name: string;
  description: string;
  setting?: string;
  rules: string[];
  tags: string[];
  coverImage?: string;
  creator: {
    _id: string;
    username: string;
  };
  visibility: Visibility;
  isAdultContent: boolean;
  characterCount: number;
  usageCount: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

// 세계관 생성 DTO
export interface CreateWorldDto {
  name: string;
  description: string;
  setting?: string;
  rules?: string[];
  tags?: string[];
  coverImage?: string;
  visibility?: Visibility;
  isAdultContent?: boolean;
}

// 세계관 수정 DTO
export interface UpdateWorldDto extends Partial<CreateWorldDto> {}

// 세계관 목록 조회 옵션
export interface WorldQueryOptions {
  page?: number;
  limit?: number;
  tags?: string[];
  search?: string;
}

// 페이지네이션 응답
export interface WorldListResponse {
  worlds: World[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 인기 태그 응답
export interface PopularTag {
  tag: string;
  count: number;
}
