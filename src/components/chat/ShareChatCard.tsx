'use client';

import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  Stack,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

interface ShareMessage {
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ShareChatCardProps {
  open: boolean;
  onClose: () => void;
  messages: ShareMessage[];
  characterName: string;
  characterImage?: string;
  userName?: string;
}

export default function ShareChatCard({
  open,
  onClose,
  messages,
  characterName,
  characterImage,
  userName = '나',
}: ShareChatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 최근 6개 메시지만 표시
  const displayMessages = messages.slice(-6);

  const captureCard = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;
    const html2canvas = (await import('html2canvas')).default;
    return html2canvas(cardRef.current, {
      backgroundColor: '#0d0d1a',
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `monglai-${characterName}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('캡처 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyImage = async () => {
    setLoading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // 클립보드 API 미지원 시 다운로드로 대체
          handleDownload();
        }
      });
    } catch (e) {
      console.error('복사 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { bgcolor: '#111122', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' },
      }}
    >
      {/* 툴바 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} color="#fff">
          대화 공유
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title={copied ? '복사됨!' : '이미지 복사'}>
            <IconButton onClick={handleCopyImage} disabled={loading} size="small" sx={{ color: '#fff' }}>
              {copied ? <CheckIcon sx={{ color: '#4caf50' }} /> : <ContentCopyIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="이미지 저장">
            <IconButton onClick={handleDownload} disabled={loading} size="small" sx={{ color: '#fff' }}>
              {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <DownloadIcon />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* 캡처 대상 카드 */}
      <Box sx={{ p: 2 }}>
        <Box
          ref={cardRef}
          sx={{
            bgcolor: '#0d0d1a',
            borderRadius: 3,
            p: 3,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* 헤더 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Avatar
              src={characterImage}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'rgba(255,95,155,0.2)',
                border: '2px solid rgba(255,95,155,0.4)',
              }}
            >
              {characterName[0]}
            </Avatar>
            <Box>
              <Typography fontWeight={700} color="#fff" fontSize={15}>
                {characterName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                몽글AI
              </Typography>
            </Box>
          </Box>

          {/* 메시지 목록 */}
          <Stack spacing={1.2}>
            {displayMessages.map((msg, i) => {
              const isUser = msg.sender === 'user';
              return (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 1,
                  }}
                >
                  {!isUser && (
                    <Avatar
                      src={characterImage}
                      sx={{ width: 28, height: 28, bgcolor: 'rgba(255,95,155,0.2)', flexShrink: 0 }}
                    >
                      {characterName[0]}
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: '72%',
                      px: 2,
                      py: 1.2,
                      borderRadius: isUser
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      bgcolor: isUser
                        ? 'rgba(255,95,155,0.25)'
                        : 'rgba(255,255,255,0.07)',
                      border: isUser
                        ? '1px solid rgba(255,95,155,0.3)'
                        : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Typography
                      fontSize={13}
                      color="#fff"
                      sx={{ lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      {msg.content}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>

          {/* 푸터 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
            <Chip
              label="monglai.com"
              size="small"
              sx={{
                bgcolor: 'rgba(255,95,155,0.12)',
                color: 'rgba(255,95,155,0.8)',
                border: '1px solid rgba(255,95,155,0.2)',
                fontSize: 11,
                height: 22,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
