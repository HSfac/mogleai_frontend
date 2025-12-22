'use client';

import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, Collapse, IconButton, keyframes } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useMood, MoodType } from './MoodSystem';

// 애니메이션
const pulseHeart = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

const fireFlicker = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
`;

// 게이지 바 컴포넌트
interface GaugeBarProps {
  value: number;
  maxValue?: number;
  color: string;
  glowColor: string;
  showPulse?: boolean;
}

const GaugeBar: React.FC<GaugeBarProps> = ({
  value,
  maxValue = 100,
  color,
  glowColor,
  showPulse = false,
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <Box
      sx={{
        position: 'relative',
        height: 8,
        borderRadius: 4,
        bgcolor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}
    >
      {/* 배경 그리드 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 10%,
            rgba(255,255,255,0.05) 10%,
            rgba(255,255,255,0.05) 10.5%
          )`,
        }}
      />

      {/* 게이지 바 */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 4,
          transition: 'width 0.5s ease-out',
          boxShadow: percentage > 70 ? `0 0 10px ${glowColor}, 0 0 20px ${glowColor}50` : 'none',
          animation: showPulse && percentage > 80 ? `${glowPulse} 1.5s ease-in-out infinite` : 'none',
        }}
      />

      {/* 시머 효과 */}
      {percentage > 50 && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${percentage}%`,
            background: `linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,255,255,0.3) 50%,
              transparent 100%
            )`,
            backgroundSize: '200% 100%',
            animation: `${shimmer} 2s linear infinite`,
            borderRadius: 4,
          }}
        />
      )}
    </Box>
  );
};

// 분위기 인디케이터
interface MoodIndicatorProps {
  mood: MoodType;
}

const MoodIndicator: React.FC<MoodIndicatorProps> = ({ mood }) => {
  const moodLabels: Record<MoodType, { label: string; emoji: string; color: string }> = {
    normal: { label: '평온', emoji: '😊', color: '#888' },
    romantic: { label: '설렘', emoji: '💕', color: '#ff69b4' },
    tension: { label: '긴장', emoji: '💜', color: '#ba55d3' },
    intimate: { label: '친밀', emoji: '💗', color: '#ff1493' },
    climax: { label: '절정', emoji: '🔥', color: '#ff0064' },
  };

  const { label, emoji, color } = moodLabels[mood];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: `${color}20`,
        border: `1px solid ${color}50`,
        transition: 'all 0.3s ease',
      }}
    >
      <Typography sx={{ fontSize: '1rem' }}>{emoji}</Typography>
      <Typography
        variant="caption"
        sx={{
          color: color,
          fontWeight: 600,
          textShadow: mood !== 'normal' ? `0 0 10px ${color}` : 'none',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// 메인 IntimacyGauge 컴포넌트
interface IntimacyGaugeProps {
  compact?: boolean;
  showMood?: boolean;
}

export const IntimacyGauge: React.FC<IntimacyGaugeProps> = ({
  compact = false,
  showMood = true,
}) => {
  const { mood, intimacyLevel, excitementLevel, setIntimacyLevel, setExcitementLevel } = useMood();
  const [expanded, setExpanded] = useState(!compact);

  // 게이지가 높을 때 아이콘 애니메이션
  const heartAnimation = intimacyLevel > 70 ? `${pulseHeart} 1s ease-in-out infinite` : 'none';
  const fireAnimation = excitementLevel > 70 ? `${fireFlicker} 0.5s ease-in-out infinite` : 'none';

  if (compact && !expanded) {
    // 컴팩트 모드: 미니 게이지만 표시
    return (
      <Box
        onClick={() => setExpanded(true)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 3,
          bgcolor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.4)',
          },
        }}
      >
        <FavoriteIcon
          sx={{
            fontSize: 16,
            color: '#ff1493',
            animation: heartAnimation,
          }}
        />
        <Box sx={{ width: 60 }}>
          <GaugeBar value={intimacyLevel} color="#ff1493" glowColor="#ff1493" />
        </Box>
        <LocalFireDepartmentIcon
          sx={{
            fontSize: 16,
            color: '#ff4500',
            animation: fireAnimation,
          }}
        />
        <Box sx={{ width: 60 }}>
          <GaugeBar value={excitementLevel} color="#ff4500" glowColor="#ff4500" showPulse />
        </Box>
        <ExpandMoreIcon sx={{ fontSize: 16, color: '#888' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* 헤더 */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <AutoAwesomeIcon sx={{ fontSize: 18, color: '#ff69b4' }} />
          <Typography variant="body2" fontWeight={600} sx={{ color: '#fff' }}>
            캐릭터 상태
          </Typography>
        </Stack>
        {showMood && <MoodIndicator mood={mood} />}
        {compact && (
          <IconButton size="small" onClick={() => setExpanded(false)}>
            <ExpandLessIcon sx={{ fontSize: 18, color: '#888' }} />
          </IconButton>
        )}
      </Stack>

      {/* 게이지들 */}
      <Stack spacing={2}>
        {/* 친밀도 */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <FavoriteIcon
                sx={{
                  fontSize: 16,
                  color: '#ff1493',
                  animation: heartAnimation,
                }}
              />
              <Typography variant="caption" sx={{ color: '#ff1493', fontWeight: 600 }}>
                친밀도
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>
              {intimacyLevel}%
            </Typography>
          </Stack>
          <GaugeBar value={intimacyLevel} color="#ff1493" glowColor="#ff1493" />
        </Box>

        {/* 흥분도 */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <LocalFireDepartmentIcon
                sx={{
                  fontSize: 16,
                  color: '#ff4500',
                  animation: fireAnimation,
                }}
              />
              <Typography variant="caption" sx={{ color: '#ff4500', fontWeight: 600 }}>
                흥분도
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>
              {excitementLevel}%
            </Typography>
          </Stack>
          <GaugeBar value={excitementLevel} color="#ff4500" glowColor="#ff4500" showPulse />
        </Box>

        {/* 분위기 레벨 */}
        <Box
          sx={{
            mt: 1,
            pt: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Stack direction="row" spacing={0.5} justifyContent="center">
            {(['normal', 'romantic', 'tension', 'intimate', 'climax'] as MoodType[]).map((m, idx) => {
              const isActive = mood === m;
              const isPassed = ['normal', 'romantic', 'tension', 'intimate', 'climax'].indexOf(mood) >= idx;

              return (
                <Box
                  key={m}
                  sx={{
                    width: isActive ? 24 : 16,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: isPassed
                      ? isActive
                        ? '#ff1493'
                        : '#ff149380'
                      : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 0 10px #ff1493' : 'none',
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default IntimacyGauge;
