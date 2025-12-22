'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  LinearProgress,
  Grid,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { imageAssetService } from '@/services/imageAssetService';
import {
  ImageAsset,
  ImageAssetType,
  ImageAssetTypeLabels,
  ImageSlotUsage,
} from '@/types/imageAsset';

interface ImageGalleryProps {
  characterId?: string;
  worldId?: string;
  isOwner: boolean;
  onSelectImage?: (imageUrl: string) => void;
}

export default function ImageGallery({
  characterId,
  worldId,
  isOwner,
  onSelectImage,
}: ImageGalleryProps) {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [slotUsage, setSlotUsage] = useState<ImageSlotUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [previewImage, setPreviewImage] = useState<ImageAsset | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageAsset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<ImageAssetType>(ImageAssetType.ILLUSTRATION);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadImages();
    loadSlotUsage();
  }, [characterId, worldId]);

  const loadImages = async () => {
    setLoading(true);
    try {
      let data: ImageAsset[];
      if (characterId) {
        data = await imageAssetService.getCharacterAssets(characterId);
      } else if (worldId) {
        data = await imageAssetService.getWorldAssets(worldId);
      } else {
        data = [];
      }
      setImages(data);
    } catch (err) {
      console.error('이미지를 불러오는데 실패했습니다:', err);
      setError('이미지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadSlotUsage = async () => {
    try {
      const usage = await imageAssetService.getSlotUsage(characterId, worldId);
      setSlotUsage(usage);
    } catch (err) {
      console.error('슬롯 사용량을 불러오는데 실패했습니다:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      if (!file.type.includes('image')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
      setUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    setError(null);

    try {
      await imageAssetService.uploadAsset(uploadFile, {
        characterId,
        worldId,
        type: uploadType,
        description: uploadDescription,
        tags: uploadTags,
      });
      await loadImages();
      await loadSlotUsage();
      handleCloseUploadDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadType(ImageAssetType.ILLUSTRATION);
    setUploadDescription('');
    setUploadTags([]);
    setTagInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;

    try {
      await imageAssetService.deleteAsset(imageToDelete._id);
      await loadImages();
      await loadSlotUsage();
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || '이미지 삭제에 실패했습니다.');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !uploadTags.includes(tagInput.trim())) {
      setUploadTags([...uploadTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setUploadTags(uploadTags.filter((tag) => tag !== tagToRemove));
  };

  const slotProgress = slotUsage
    ? (slotUsage.characterSlots.used / slotUsage.characterSlots.total) * 100
    : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 슬롯 사용량 표시 */}
      {slotUsage && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight={600}>
              이미지 슬롯
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {slotUsage.characterSlots.used} / {slotUsage.characterSlots.total}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={slotProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: slotProgress > 80 ? '#ff9800' : '#ff3366',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {slotUsage.characterSlots.remaining}개 남음
          </Typography>
        </Box>
      )}

      {/* 헤더 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          이미지 갤러리 ({images.length})
        </Typography>
        {isOwner && slotUsage && slotUsage.characterSlots.remaining > 0 && (
          <>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <Button
              size="small"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ color: '#ff3366', '&:hover': { bgcolor: 'rgba(255,51,102,0.1)' } }}
            >
              이미지 추가
            </Button>
          </>
        )}
      </Box>

      {/* 이미지 그리드 */}
      {images.length === 0 ? (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            bgcolor: '#f9f9f9',
            borderRadius: 2,
            border: '2px dashed #e0e0e0',
          }}
        >
          <AddPhotoAlternateIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
          <Typography color="text.secondary">아직 등록된 이미지가 없습니다.</Typography>
          {isOwner && (
            <Button
              size="small"
              sx={{ mt: 2, color: '#ff3366' }}
              onClick={() => fileInputRef.current?.click()}
            >
              첫 이미지 업로드하기
            </Button>
          )}
        </Box>
      ) : (
        <ImageList cols={3} gap={8}>
          {images.map((image) => (
            <ImageListItem
              key={image._id}
              sx={{
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': {
                  '& .image-overlay': { opacity: 1 },
                },
              }}
              onClick={() => (onSelectImage ? onSelectImage(image.url) : setPreviewImage(image))}
            >
              <img
                src={image.url}
                alt={image.description || image.fileName}
                loading="lazy"
                style={{ aspectRatio: '1/1', objectFit: 'cover' }}
              />
              <Box
                className="image-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <IconButton
                  size="small"
                  sx={{ color: '#fff' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(image);
                  }}
                >
                  <ZoomInIcon />
                </IconButton>
                {isOwner && (
                  <IconButton
                    size="small"
                    sx={{ color: '#ff6b6b' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageToDelete(image);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              <ImageListItemBar
                title={ImageAssetTypeLabels[image.type]}
                subtitle={image.description}
                sx={{
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  '& .MuiImageListItemBar-title': { fontSize: '0.75rem' },
                  '& .MuiImageListItemBar-subtitle': { fontSize: '0.65rem' },
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* 업로드 다이얼로그 */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>이미지 업로드</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {uploadPreview && (
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#f0f0f0',
                }}
              >
                <img
                  src={uploadPreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>이미지 타입</InputLabel>
              <Select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as ImageAssetType)}
                label="이미지 타입"
              >
                {Object.entries(ImageAssetTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="설명"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="이미지에 대한 간단한 설명"
              fullWidth
              multiline
              rows={2}
            />

            <Box>
              <Typography variant="subtitle2" mb={1}>
                태그
              </Typography>
              <Stack direction="row" spacing={1} mb={1}>
                <TextField
                  size="small"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="태그 입력 후 Enter"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button variant="outlined" onClick={handleAddTag}>
                  추가
                </Button>
              </Stack>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {uploadTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>취소</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !uploadFile}
            sx={{ bgcolor: '#ff3366', '&:hover': { bgcolor: '#e62958' } }}
          >
            {uploading ? '업로드 중...' : '업로드'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 이미지 미리보기 다이얼로그 */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{previewImage?.description || '이미지 미리보기'}</Typography>
          <IconButton onClick={() => setPreviewImage(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewImage && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                bgcolor: '#000',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <img
                src={previewImage.url}
                alt={previewImage.description || previewImage.fileName}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </Box>
          )}
          {previewImage && (
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              <Chip label={ImageAssetTypeLabels[previewImage.type]} size="small" />
              {previewImage.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>이미지 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 이미지를 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button color="error" onClick={handleDelete}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
