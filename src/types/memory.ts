// 메모리 요약 인터페이스
export interface MemorySummary {
  _id: string;
  sessionId: string;
  messageRange: {
    start: number;
    end: number;
  };
  summaryText: string;
  keyEvents: string[];
  emotionalTone?: string;
  characterMentions: Record<string, number>;
  importantFacts: string[];
  createdAt: string;
  updatedAt: string;
}

// 메모리 통계
export interface MemoryStats {
  summaryCount: number;
  latestSummaryRange: { start: number; end: number } | null;
}

// 노트 대상 타입
export enum NoteTargetType {
  SESSION = 'session',
  CHARACTER = 'character',
}

// 노트 카테고리
export enum NoteCategory {
  RULE = 'rule',
  MEMORY = 'memory',
  PREFERENCE = 'preference',
  BOOKMARK = 'bookmark',
}

// 노트 카테고리 레이블
export const NoteCategoryLabels: Record<NoteCategory, string> = {
  [NoteCategory.RULE]: '규칙',
  [NoteCategory.MEMORY]: '기억',
  [NoteCategory.PREFERENCE]: '선호',
  [NoteCategory.BOOKMARK]: '북마크',
};

// 유저 노트 인터페이스
export interface UserNote {
  _id: string;
  userId: string;
  targetType: NoteTargetType;
  targetId: string;
  content: string;
  category: NoteCategory;
  isPinned: boolean;
  includeInContext: boolean;
  createdAt: string;
  updatedAt: string;
}

// 노트 생성 DTO
export interface CreateNoteDto {
  targetType: NoteTargetType;
  targetId: string;
  content: string;
  category?: NoteCategory;
  isPinned?: boolean;
  includeInContext?: boolean;
}

// 노트 수정 DTO
export interface UpdateNoteDto {
  content?: string;
  category?: NoteCategory;
  isPinned?: boolean;
  includeInContext?: boolean;
}
