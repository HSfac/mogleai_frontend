// AI 모델 타입 정의
export enum AIModel {
  GPT4 = 'gpt4',
  CLAUDE3 = 'claude3',
  MISTRAL = 'mistral',
  CUSTOM = 'custom',
}

// 캐릭터 인터페이스 정의
export interface Character {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  // 필요한 다른 속성들을 추가하세요
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