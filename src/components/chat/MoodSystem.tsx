'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Box, keyframes } from '@mui/material';

// 분위기 타입 정의
export type MoodType = 'normal' | 'romantic' | 'tension' | 'intimate' | 'climax';

// 분위기별 테마 설정
export const MOOD_THEMES: Record<MoodType, {
  background: string;
  particleColor: string;
  accentColor: string;
  textGlow: string;
  bubbleBg: string;
  bubbleUserBg: string;
  intensity: number;
}> = {
  normal: {
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    particleColor: 'rgba(255, 95, 155, 0.3)',
    accentColor: '#ff5f9b',
    textGlow: 'none',
    bubbleBg: 'rgba(255, 255, 255, 0.08)',
    bubbleUserBg: 'linear-gradient(135deg, #ff5f9b 0%, #ff8fab 100%)',
    intensity: 0,
  },
  romantic: {
    background: 'linear-gradient(180deg, #2d1b3d 0%, #1a1a2e 100%)',
    particleColor: 'rgba(255, 105, 180, 0.4)',
    accentColor: '#ff69b4',
    textGlow: '0 0 10px rgba(255, 105, 180, 0.3)',
    bubbleBg: 'rgba(255, 105, 180, 0.1)',
    bubbleUserBg: 'linear-gradient(135deg, #ff69b4 0%, #ff8fab 100%)',
    intensity: 1,
  },
  tension: {
    background: 'linear-gradient(180deg, #2a1a3a 0%, #1a0a2a 100%)',
    particleColor: 'rgba(186, 85, 211, 0.5)',
    accentColor: '#ba55d3',
    textGlow: '0 0 15px rgba(186, 85, 211, 0.4)',
    bubbleBg: 'rgba(186, 85, 211, 0.12)',
    bubbleUserBg: 'linear-gradient(135deg, #ba55d3 0%, #da70d6 100%)',
    intensity: 2,
  },
  intimate: {
    background: 'linear-gradient(180deg, #3a1a2a 0%, #2a0a1a 100%)',
    particleColor: 'rgba(255, 20, 147, 0.5)',
    accentColor: '#ff1493',
    textGlow: '0 0 20px rgba(255, 20, 147, 0.5)',
    bubbleBg: 'rgba(255, 20, 147, 0.15)',
    bubbleUserBg: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
    intensity: 3,
  },
  climax: {
    background: 'linear-gradient(180deg, #4a0a1a 0%, #2a0510 100%)',
    particleColor: 'rgba(255, 0, 100, 0.6)',
    accentColor: '#ff0064',
    textGlow: '0 0 25px rgba(255, 0, 100, 0.6)',
    bubbleBg: 'rgba(255, 0, 100, 0.18)',
    bubbleUserBg: 'linear-gradient(135deg, #ff0064 0%, #ff1493 100%)',
    intensity: 4,
  },
};

// 파티클 애니메이션
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
`;

const heartbeat = keyframes`
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1); }
  75% { transform: scale(1.15); }
`;

// Context 생성
interface MoodContextType {
  mood: MoodType;
  setMood: (mood: MoodType) => void;
  intimacyLevel: number;
  setIntimacyLevel: (level: number) => void;
  excitementLevel: number;
  setExcitementLevel: (level: number) => void;
  theme: typeof MOOD_THEMES.normal;
}

const MoodContext = createContext<MoodContextType | null>(null);

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within MoodProvider');
  }
  return context;
};

// 파티클 컴포넌트
const Particle = ({ delay, size, left, color }: { delay: number; size: number; left: number; color: string }) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: -20,
      left: `${left}%`,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: 'blur(2px)',
      animation: `${floatAnimation} ${8 + Math.random() * 4}s linear infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none',
    }}
  />
);

// 하트 파티클
const HeartParticle = ({ delay, left, color }: { delay: number; left: number; color: string }) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: -20,
      left: `${left}%`,
      fontSize: '16px',
      color: color,
      filter: 'blur(0.5px)',
      animation: `${floatAnimation} ${10 + Math.random() * 5}s linear infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none',
      opacity: 0.7,
    }}
  >
    ❤
  </Box>
);

// Provider 컴포넌트
interface MoodProviderProps {
  children: ReactNode;
  initialMood?: MoodType;
}

export const MoodProvider: React.FC<MoodProviderProps> = ({ children, initialMood = 'normal' }) => {
  const [mood, setMood] = useState<MoodType>(initialMood);
  const [intimacyLevel, setIntimacyLevel] = useState(0);
  const [excitementLevel, setExcitementLevel] = useState(0);

  // 흥분도/친밀도에 따라 자동으로 분위기 변경
  useEffect(() => {
    const avgLevel = (intimacyLevel + excitementLevel) / 2;

    if (avgLevel >= 90) {
      setMood('climax');
    } else if (avgLevel >= 70) {
      setMood('intimate');
    } else if (avgLevel >= 50) {
      setMood('tension');
    } else if (avgLevel >= 30) {
      setMood('romantic');
    } else {
      setMood('normal');
    }
  }, [intimacyLevel, excitementLevel]);

  const theme = MOOD_THEMES[mood];

  return (
    <MoodContext.Provider value={{ mood, setMood, intimacyLevel, setIntimacyLevel, excitementLevel, setExcitementLevel, theme }}>
      {children}
    </MoodContext.Provider>
  );
};

// 분위기 배경 컴포넌트
interface MoodBackgroundProps {
  children: ReactNode;
}

export const MoodBackground: React.FC<MoodBackgroundProps> = ({ children }) => {
  const { mood, theme } = useMood();
  const particleCount = MOOD_THEMES[mood].intensity * 5;

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100%',
        background: theme.background,
        transition: 'background 1s ease-in-out',
        overflow: 'hidden',
      }}
    >
      {/* 글로우 오버레이 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${theme.particleColor} 0%, transparent 70%)`,
          opacity: theme.intensity * 0.15,
          animation: mood !== 'normal' ? `${pulseGlow} 3s ease-in-out infinite` : 'none',
          pointerEvents: 'none',
          transition: 'opacity 1s ease-in-out',
        }}
      />

      {/* 파티클들 */}
      {mood !== 'normal' && (
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(particleCount)].map((_, i) => (
            <Particle
              key={`particle-${i}`}
              delay={i * 0.5}
              size={4 + Math.random() * 8}
              left={Math.random() * 100}
              color={theme.particleColor}
            />
          ))}
          {mood === 'romantic' || mood === 'intimate' || mood === 'climax' ? (
            [...Array(Math.floor(particleCount / 2))].map((_, i) => (
              <HeartParticle
                key={`heart-${i}`}
                delay={i * 1.2}
                left={Math.random() * 100}
                color={theme.accentColor}
              />
            ))
          ) : null}
        </Box>
      )}

      {/* 비네트 효과 */}
      {mood !== 'normal' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none',
            opacity: theme.intensity * 0.2,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      )}

      {/* 컨텐츠 */}
      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100%' }}>
        {children}
      </Box>
    </Box>
  );
};

// 분위기에 맞는 메시지 버블 스타일 반환
export const useMoodBubbleStyle = (isUser: boolean) => {
  const { theme, mood } = useMood();

  if (isUser) {
    return {
      background: theme.bubbleUserBg,
      boxShadow: mood !== 'normal'
        ? `0 4px 20px ${theme.accentColor}40, 0 0 30px ${theme.accentColor}20`
        : '0 4px 15px rgba(255, 95, 155, 0.25)',
    };
  }

  return {
    background: theme.bubbleBg,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.accentColor}30`,
    boxShadow: mood !== 'normal'
      ? `0 4px 20px ${theme.accentColor}20`
      : 'none',
  };
};

export default MoodProvider;
