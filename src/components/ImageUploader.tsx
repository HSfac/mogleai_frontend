'use client';

import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';
import api from '@/lib/api';

interface ImageUploaderProps {
  initialImage?: string;
  onImageUpload: (imageUrl: string) => void;
}

export default function ImageUploader({ initialImage, onImageUpload }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState(initialImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('파일 크기는 5MB 이하여야 합니다.');
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.imageUrl || response.data;
      setImagePreview(imageUrl);
      onImageUpload(imageUrl);
    } catch (uploadError: any) {
      console.error('이미지 업로드 실패:', uploadError);
      setError(uploadError?.response?.data?.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFile = async (file: File) => {
    try {
      validateFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview((event.target?.result as string) || '');
      };
      reader.readAsDataURL(file);
      await uploadImage(file);
    } catch (validationError: any) {
      setError(validationError.message || '이미지 처리에 실패했습니다.');
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleFile(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setError('');
    onImageUpload('');
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        캐릭터 이미지
      </Typography>

      <Box
        sx={{
          border: '1px dashed rgba(255, 95, 155, 0.4)',
          borderRadius: 3,
          p: 3,
          bgcolor: '#fff',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {isUploading ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
            <CircularProgress sx={{ color: '#ff5f9b' }} />
            <Typography variant="body2" color="text.secondary">
              이미지 업로드 중...
            </Typography>
          </Stack>
        ) : imagePreview ? (
          <Stack spacing={2}>
            <Box
              component="img"
              src={imagePreview}
              alt="업로드 이미지"
              sx={{
                width: '100%',
                maxHeight: 280,
                objectFit: 'cover',
                borderRadius: 2,
                bgcolor: '#f5f5f5',
              }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => inputRef.current?.click()}
              >
                변경
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteOutlineIcon />}
                onClick={handleRemoveImage}
              >
                삭제
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
            <ImageIcon sx={{ fontSize: 56, color: 'rgba(0,0,0,0.3)' }} />
            <Typography variant="body2" color="text.secondary">
              이미지를 선택해 업로드하세요.
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => inputRef.current?.click()}
              sx={{ bgcolor: '#ff5f9b' }}
            >
              이미지 선택
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
