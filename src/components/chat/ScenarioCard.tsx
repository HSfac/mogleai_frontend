'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Fade, Backdrop, keyframes } from '@mui/material';
import { useMood } from './MoodSystem';

// 애니메이션
const fadeInScale = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 20, 147, 0.3); }
  50% { box-shadow: 0 0 40px rgba(255, 20, 147, 0.6), 0 0 60px rgba(255, 20, 147, 0.3); }
`;

interface ScenarioCardProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  imageUrl?: string;
  choices?: {
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }[];
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  open,
  onClose,
  title,
  description,
  imageUrl,
  choices = [],
}) => {
  const { theme, mood } = useMood();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
    }
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!open && !visible) return null;

  return (
    <Backdrop
      open={visible}
      sx={{
        zIndex: 9999,
        bgcolor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={choices.length === 0 ? handleClose : undefined}
    >
      <Fade in={visible} timeout={500}>
        <Box
          sx={{
            position: 'relative',
            width: '90%',
            maxWidth: 500,
            borderRadius: 4,
            overflow: 'hidden',
            animation: `${fadeInScale} 0.5s ease-out`,
          }}
        >
          {/* 배경 이미지 또는 그라데이션 */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: imageUrl
                ? `url(${imageUrl}) center/cover`
                : `linear-gradient(135deg, ${theme.accentColor}40 0%, #1a0a1a 100%)`,
              filter: 'brightness(0.4)',
            }}
          />

          {/* 오버레이 그라데이션 */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)',
            }}
          />

          {/* 테두리 글로우 */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: 4,
              border: `2px solid ${theme.accentColor}50`,
              animation: mood !== 'normal' ? `${pulseGlow} 2s ease-in-out infinite` : 'none',
              pointerEvents: 'none',
            }}
          />

          {/* 컨텐츠 */}
          <Box
            sx={{
              position: 'relative',
              p: 4,
              pt: 6,
              pb: 4,
              textAlign: 'center',
            }}
          >
            {/* 장식 요소 */}
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 3,
                borderRadius: 2,
                background: `linear-gradient(90deg, transparent, ${theme.accentColor}, transparent)`,
              }}
            />

            {/* 타이틀 */}
            <Typography
              variant="h5"
              sx={{
                color: '#fff',
                fontWeight: 700,
                mb: 2,
                textShadow: theme.textGlow,
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </Typography>

            {/* 설명 */}
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                mb: 4,
                lineHeight: 1.8,
                whiteSpace: 'pre-line',
              }}
            >
              {description}
            </Typography>

            {/* 선택지 버튼들 */}
            {choices.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {choices.map((choice, idx) => (
                  <Button
                    key={idx}
                    variant={choice.variant === 'secondary' ? 'outlined' : 'contained'}
                    onClick={() => {
                      choice.action();
                      handleClose();
                    }}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      ...(choice.variant === 'secondary'
                        ? {
                            borderColor: `${theme.accentColor}80`,
                            color: theme.accentColor,
                            '&:hover': {
                              borderColor: theme.accentColor,
                              bgcolor: `${theme.accentColor}20`,
                            },
                          }
                        : {
                            background: `linear-gradient(135deg, ${theme.accentColor} 0%, ${theme.accentColor}cc 100%)`,
                            boxShadow: `0 4px 20px ${theme.accentColor}50`,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${theme.accentColor}ee 0%, ${theme.accentColor} 100%)`,
                            },
                          }),
                    }}
                  >
                    {choice.label}
                  </Button>
                ))}
              </Box>
            ) : (
              <Button
                variant="text"
                onClick={handleClose}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': {
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                계속하기
              </Button>
            )}

            {/* 하단 장식 */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 0.5,
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: i === 1 ? theme.accentColor : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Fade>
    </Backdrop>
  );
};

export default ScenarioCard;
