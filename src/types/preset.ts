// 프리셋 분위기 enum
export enum PresetMood {
  COMIC = 'comic',       // 코믹/유쾌
  CALM = 'calm',         // 잔잔/평온
  SERIOUS = 'serious',   // 진지/심각
  DARK = 'dark',         // 어두운/우울
  ROMANTIC = 'romantic', // 로맨틱
  TENSE = 'tense',       // 긴장감
}

// 프리셋 분위기 레이블
export const PresetMoodLabels: Record<PresetMood, string> = {
  [PresetMood.COMIC]: '코믹/유쾌',
  [PresetMood.CALM]: '잔잔/평온',
  [PresetMood.SERIOUS]: '진지/심각',
  [PresetMood.DARK]: '어두운/우울',
  [PresetMood.ROMANTIC]: '로맨틱',
  [PresetMood.TENSE]: '긴장감',
};

// 프리셋 인터페이스
export interface PersonaPreset {
  _id: string;
  characterId: string;
  title: string;
  relationshipToUser: string;
  mood: PresetMood;
  speakingTone?: string;
  scenarioIntro?: string;
  rules: string[];
  promptOverrides: Record<string, string>;
  thumbnailImage?: string;
  isDefault: boolean;
  usageCount: number;
  creator: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 프리셋 생성 DTO
export interface CreatePresetDto {
  title: string;
  relationshipToUser: string;
  mood?: PresetMood;
  speakingTone?: string;
  scenarioIntro?: string;
  rules?: string[];
  promptOverrides?: Record<string, string>;
  thumbnailImage?: string;
  isDefault?: boolean;
}

// 프리셋 수정 DTO
export interface UpdatePresetDto extends Partial<CreatePresetDto> {}
