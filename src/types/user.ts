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
}

// 메시지 인터페이스 정의
export interface Message {
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  tokensUsed?: number;
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