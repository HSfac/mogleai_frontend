// AI 모델 타입 정의
export enum AIModel {
  GPT4 = 'gpt4',
  CLAUDE3 = 'claude3',
  MISTRAL = 'mistral',
  CUSTOM = 'custom',
}

// 캐릭터 인터페이스 정의
export interface Character {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  profileImage?: string;
  imageUrl?: string;
  personality?: string;
  speakingStyle?: string;
  greeting?: string;
  tags?: string[];
  likes?: number;
  usageCount?: number;
  creator?: {
    _id?: string;
    username?: string;
  };
  isPublic?: boolean;
  isAdultContent?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 캐릭터 생성 DTO 인터페이스
export interface CreateCharacterDto {
  name: string;
  description: string;
  longDescription?: string;
  personality: string;
  speakingStyle: string;
  exampleDialogs?: string;
  tags: string[];
  defaultAIModel: AIModel;
  isPublic: boolean;
} 