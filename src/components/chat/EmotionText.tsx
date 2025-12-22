'use client';

import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { useMood } from './MoodSystem';

// 텍스트 애니메이션
const tremble = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
`;

const breathe = keyframes`
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
`;

const fadeInOut = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const heartPulse = keyframes`
  0%, 100% { transform: scale(1); color: #ff1493; }
  50% { transform: scale(1.3); color: #ff69b4; }
`;

// 감정 표현 타입
type EmotionType =
  | 'whisper'      // *속삭이며*
  | 'action'       // *행동 묘사*
  | 'emphasis'     // **강조**
  | 'tremble'      // ~떨리는~
  | 'fade'         // ...말끝 흐림...
  | 'heart'        // <3 또는 ♥
  | 'moan'         // 신음 표현
  | 'intense'      // !!!
  | 'normal';

// 텍스트 세그먼트
interface TextSegment {
  type: EmotionType;
  text: string;
}

// 텍스트 파싱 함수
const parseEmotionText = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  let remaining = text;

  // 정규표현식 패턴들
  const patterns: { regex: RegExp; type: EmotionType }[] = [
    // *속삭이며* 또는 *행동*
    { regex: /\*([^*]+)\*/g, type: 'action' },
    // **강조**
    { regex: /\*\*([^*]+)\*\*/g, type: 'emphasis' },
    // ~떨리는 목소리~
    { regex: /~([^~]+)~/g, type: 'tremble' },
    // ...말끝흐림...
    { regex: /\.\.\.([^.]+)\.\.\./g, type: 'fade' },
    // 하트 표현
    { regex: /(<3|♥|💕|💓|❤️)/g, type: 'heart' },
    // 신음 표현 (아, 으, 하, 음 등의 반복)
    { regex: /(아+\.{0,3}|으+\.{0,3}|하+\.{0,3}|음+\.{0,3}|응+\.{0,3})/gi, type: 'moan' },
    // 강한 감정 !!!
    { regex: /([^!]+!!+)/g, type: 'intense' },
  ];

  // 간단한 파싱 로직 (순차적)
  // 실제로는 더 복잡한 파싱이 필요할 수 있음

  // 먼저 ** 강조 처리 (** 가 * 보다 우선)
  const emphasisRegex = /\*\*([^*]+)\*\*/g;
  const actionRegex = /\*([^*]+)\*/g;
  const trembleRegex = /~([^~]+)~/g;
  const fadeRegex = /\.\.\.([^.]{1,30})\.\.\./g;
  const heartRegex = /(<3|♥|💕|💓|❤️|💗)/g;
  const moanRegex = /\b(아+\.{0,3}|으+\.{0,3}|하+\.{0,3}|음+\.{0,3}|응+\.{0,3}|흐+\.{0,3})/gi;

  // 모든 매치 찾기
  interface Match {
    index: number;
    length: number;
    text: string;
    type: EmotionType;
    fullMatch: string;
  }

  const matches: Match[] = [];

  // ** 강조
  let match;
  const emphasisMatches = text.matchAll(/\*\*([^*]+)\*\*/g);
  for (const m of emphasisMatches) {
    matches.push({
      index: m.index!,
      length: m[0].length,
      text: m[1],
      type: 'emphasis',
      fullMatch: m[0],
    });
  }

  // * 행동 (** 와 겹치지 않는 것만)
  const actionMatches = text.matchAll(/(?<!\*)\*([^*]+)\*(?!\*)/g);
  for (const m of actionMatches) {
    const overlaps = matches.some(
      existing => m.index! >= existing.index && m.index! < existing.index + existing.length
    );
    if (!overlaps) {
      matches.push({
        index: m.index!,
        length: m[0].length,
        text: m[1],
        type: 'action',
        fullMatch: m[0],
      });
    }
  }

  // ~ 떨림
  const trembleMatches = text.matchAll(/~([^~]+)~/g);
  for (const m of trembleMatches) {
    matches.push({
      index: m.index!,
      length: m[0].length,
      text: m[1],
      type: 'tremble',
      fullMatch: m[0],
    });
  }

  // ... 페이드
  const fadeMatches = text.matchAll(/\.\.\.([^.]{1,50})\.\.\./g);
  for (const m of fadeMatches) {
    matches.push({
      index: m.index!,
      length: m[0].length,
      text: m[1],
      type: 'fade',
      fullMatch: m[0],
    });
  }

  // 하트
  const heartMatches = text.matchAll(/(<3|♥|💕|💓|❤️|💗)/g);
  for (const m of heartMatches) {
    matches.push({
      index: m.index!,
      length: m[0].length,
      text: m[1],
      type: 'heart',
      fullMatch: m[0],
    });
  }

  // 정렬
  matches.sort((a, b) => a.index - b.index);

  // 세그먼트 생성
  let currentIndex = 0;
  for (const match of matches) {
    // 매치 전 일반 텍스트
    if (match.index > currentIndex) {
      const normalText = text.slice(currentIndex, match.index);
      if (normalText) {
        segments.push({ type: 'normal', text: normalText });
      }
    }

    // 매치된 텍스트
    segments.push({ type: match.type, text: match.text });
    currentIndex = match.index + match.length;
  }

  // 남은 텍스트
  if (currentIndex < text.length) {
    segments.push({ type: 'normal', text: text.slice(currentIndex) });
  }

  // 매치가 없으면 전체를 normal로
  if (segments.length === 0) {
    segments.push({ type: 'normal', text });
  }

  return segments;
};

// 세그먼트 렌더링 컴포넌트
interface SegmentRendererProps {
  segment: TextSegment;
}

const SegmentRenderer: React.FC<SegmentRendererProps> = ({ segment }) => {
  const { theme, mood } = useMood();

  const baseStyle = {
    display: 'inline',
    lineHeight: 1.8,
  };

  switch (segment.type) {
    case 'action':
      // *행동 묘사* - 이탤릭, 다른 색상
      return (
        <Box
          component="span"
          sx={{
            ...baseStyle,
            fontStyle: 'italic',
            color: theme.accentColor,
            opacity: 0.9,
            fontSize: '0.95em',
          }}
        >
          {segment.text}
        </Box>
      );

    case 'emphasis':
      // **강조** - 굵게, 약간 크게, 글로우
      return (
        <Box
          component="span"
          sx={{
            ...baseStyle,
            fontWeight: 700,
            fontSize: '1.05em',
            color: '#fff',
            textShadow: theme.textGlow,
            animation: mood !== 'normal' ? `${pulse} 2s ease-in-out infinite` : 'none',
          }}
        >
          {segment.text}
        </Box>
      );

    case 'tremble':
      // ~떨리는~ - 흔들림 애니메이션
      return (
        <Box
          component="span"
          sx={{
            ...baseStyle,
            animation: `${tremble} 0.1s linear infinite`,
            color: theme.accentColor,
          }}
        >
          {segment.text}
        </Box>
      );

    case 'fade':
      // ...흐림... - 페이드 효과
      return (
        <Box
          component="span"
          sx={{
            ...baseStyle,
            animation: `${breathe} 2s ease-in-out infinite`,
            opacity: 0.7,
            fontStyle: 'italic',
          }}
        >
          ...{segment.text}...
        </Box>
      );

    case 'heart':
      // 하트 - 두근두근 애니메이션
      return (
        <Box
          component="span"
          sx={{
            ...baseStyle,
            display: 'inline-block',
            animation: `${heartPulse} 1s ease-in-out infinite`,
            mx: 0.3,
          }}
        >
          {segment.text === '<3' ? '❤️' : segment.text}
        </Box>
      );

    case 'moan':
      // 신음 - 특별한 스타일링
      return (
        <Box
          component="span"
          sx={{
            ...baseStyle,
            fontStyle: 'italic',
            color: theme.accentColor,
            fontWeight: 500,
            letterSpacing: '0.05em',
            textShadow: mood === 'climax' ? theme.textGlow : 'none',
          }}
        >
          {segment.text}
        </Box>
      );

    case 'intense':
      // !!! 강한 감정
      return (
        <Box
          component="span"
          sx={{
            ...baseStyle,
            fontWeight: 700,
            fontSize: '1.08em',
            color: '#fff',
            textShadow: theme.textGlow,
          }}
        >
          {segment.text}
        </Box>
      );

    default:
      return (
        <Box component="span" sx={baseStyle}>
          {segment.text}
        </Box>
      );
  }
};

// 메인 EmotionText 컴포넌트
interface EmotionTextProps {
  text: string;
  sx?: object;
}

export const EmotionText: React.FC<EmotionTextProps> = ({ text, sx = {} }) => {
  const segments = parseEmotionText(text);

  return (
    <Typography
      component="div"
      sx={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...sx,
      }}
    >
      {segments.map((segment, index) => (
        <SegmentRenderer key={index} segment={segment} />
      ))}
    </Typography>
  );
};

export default EmotionText;
