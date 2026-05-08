'use client';

import { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => Promise<void>;
  characterName: string;
  accentColor: string;
}

export default function ReviewDialog({ open, onClose, onSubmit, characterName, accentColor }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await onSubmit(rating, content.trim());
      setRating(0);
      setContent('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { bgcolor: '#1e1e2e', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', minWidth: 360 } }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="#fff">
            {characterName} 리뷰
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* 별점 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 2 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <IconButton
              key={star}
              size="small"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              sx={{ p: 0.3 }}
            >
              {star <= (hoverRating || rating)
                ? <StarIcon sx={{ fontSize: 36, color: '#ffd700' }} />
                : <StarBorderIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.3)' }} />
              }
            </IconButton>
          ))}
        </Box>
        {rating > 0 && (
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'rgba(255,255,255,0.5)', mb: 2 }}>
            {['', '별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요'][rating]}
          </Typography>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="리뷰를 남겨주세요 (선택)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          inputProps={{ maxLength: 500 }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
            '& .MuiInputBase-input': { '&::placeholder': { color: 'rgba(255,255,255,0.4)' } },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            sx={{ bgcolor: accentColor, '&:hover': { bgcolor: accentColor, filter: 'brightness(1.1)' } }}
          >
            리뷰 등록
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
