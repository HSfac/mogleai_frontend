// 크리에이터 레벨 타입 정의
export enum CreatorLevel {
  LEVEL1 = 'level1',
  LEVEL2 = 'level2',
  LEVEL3 = 'level3',
}

// 사용자 인터페이스 정의
export interface User {
  _id: string;
  email: string;
  username: string;
  profileImage?: string;
  tokens: number;
  totalConversations: number;
  creatorLevel: CreatorLevel;
  popularCharacters: number;
  createdCharacters: string[];
  favoriteCharacters: string[];
  isSubscribed: boolean;
  subscriptionEndDate?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// 채팅 모드 enum
export enum ChatMode {
  STORY = 'story',           // 스토리 모드 (긴 서사, 묘사 비중 높음)
  CHAT = 'chat',             // 라이트 채팅 모드 (짧은 문장, 일상 대화)
  CREATOR_DEBUG = 'creator_debug', // 크리에이터 디버그 모드
}

// 세션 상태 인터페이스
export interface SessionState {
  mood: string;
  relationshipLevel: number;
  scene: string;
  progressCounter: number;
  lastSceneSummary?: string;
}

// 채팅 인터페이스 정의
export interface Chat {
  _id: string;
  user: string;
  character: string;
  characterInfo?: {
    name: string;
    imageUrl?: string;
  };
  aiModel: string;
  messages: Message[];
  totalTokensUsed: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  // 고도화 필드
  presetId?: string;
  mode?: ChatMode;
  sessionState?: SessionState;
  title?: string;
  memorySummaryCount?: number;
}

// 채팅 생성 옵션
export interface CreateChatOptions {
  characterId: string;
  aiModel?: string;
  presetId?: string;
  mode?: ChatMode;
  title?: string;
}

// 메시지 인터페이스 정의
export interface Message {
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  tokensUsed?: number;
  suggestedReplies?: string[]; // AI가 제안한 유저 응답 선택지
}

// 결제 내역 인터페이스 정의
export interface Payment {
  _id: string;
  user: string;
  type: 'token_purchase' | 'subscription';
  amount: number;
  tokens?: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
} 