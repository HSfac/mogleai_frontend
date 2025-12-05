'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { worldService } from '@/services/worldService';
import { CreateWorldDto, Visibility } from '@/types/world';

export default function CreateWorldPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [ruleInput, setRuleInput] = useState('');

  const [formData, setFormData] = useState<CreateWorldDto>({
    name: '',
    description: '',
    setting: '',
    rules: [],
    tags: [],
    coverImage: '',
    visibility: Visibility.PUBLIC,
    isAdultContent: false,
  });

  const handleChange = (field: keyof CreateWorldDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange(
      'tags',
      formData.tags?.filter((tag) => tag !== tagToRemove) || []
    );
  };

  const handleAddRule = () => {
    if (ruleInput.trim()) {
      handleChange('rules', [...(formData.rules || []), ruleInput.trim()]);
      setRuleInput('');
    }
  };

  const handleRemoveRule = (index: number) => {
    handleChange(
      'rules',
      formData.rules?.filter((_, i) => i !== index) || []
    );
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/worlds/create');
      return;
    }

    if (!formData.name.trim()) {
      setError('세계관 이름을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      setError('세계관 설명을 입력해주세요.');
      return;
    }

    if (formData.description.length < 10) {
      setError('세계관 설명은 10자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const world = await worldService.createWorld(formData);
      router.push(`/worlds/${world._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '세계관 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ color: '#999', mb: 3, '&:hover': { color: '#fff' } }}
          >
            뒤로가기
          </Button>

          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: '#fff', mb: 4 }}
          >
            새 세계관 만들기
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper
            sx={{
              bgcolor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 3,
              p: 4,
            }}
          >
            <Stack spacing={3}>
              {/* 기본 정보 */}
              <Typography variant="h6" color="#fff" fontWeight={700}>
                기본 정보
              </Typography>

              <TextField
                fullWidth
                label="세계관 이름"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="예: 신화 공존 사회"
                inputProps={{ maxLength: 50 }}
                helperText={`${formData.name.length}/50`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0a0a0a',
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                    '&.Mui-focused fieldset': { borderColor: '#ff3366' },
                  },
                  '& .MuiInputLabel-root': { color: '#666' },
                  '& .MuiFormHelperText-root': { color: '#666' },
                }}
              />

              <TextField
                fullWidth
                label="세계관 설명"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="이 세계관에 대한 설명을 입력하세요..."
                multiline
                rows={4}
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.description.length}/500`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0a0a0a',
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                    '&.Mui-focused fieldset': { borderColor: '#ff3366' },
                  },
                  '& .MuiInputLabel-root': { color: '#666' },
                  '& .MuiFormHelperText-root': { color: '#666' },
                }}
              />

              <TextField
                fullWidth
                label="배경 설정"
                value={formData.setting}
                onChange={(e) => handleChange('setting', e.target.value)}
                placeholder="예: 2024년 현대 서울, 요괴와 인간이 공존하는 도시"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0a0a0a',
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                    '&.Mui-focused fieldset': { borderColor: '#ff3366' },
                  },
                  '& .MuiInputLabel-root': { color: '#666' },
                }}
              />

              <TextField
                fullWidth
                label="커버 이미지 URL"
                value={formData.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0a0a0a',
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                    '&.Mui-focused fieldset': { borderColor: '#ff3366' },
                  },
                  '& .MuiInputLabel-root': { color: '#666' },
                }}
              />

              {/* 세계관 규칙 */}
              <Box>
                <Typography variant="h6" color="#fff" fontWeight={700} mb={2}>
                  세계관 규칙
                </Typography>
                <Stack direction="row" spacing={1} mb={2}>
                  <TextField
                    fullWidth
                    size="small"
                    value={ruleInput}
                    onChange={(e) => setRuleInput(e.target.value)}
                    placeholder="예: 마법은 밤에만 사용 가능하다"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRule();
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#0a0a0a',
                        color: '#fff',
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#ff3366' },
                        '&.Mui-focused fieldset': { borderColor: '#ff3366' },
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddRule}
                    sx={{
                      borderColor: '#ff3366',
                      color: '#ff3366',
                      '&:hover': { borderColor: '#e62958', bgcolor: 'rgba(255,51,102,0.1)' },
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  {formData.rules?.map((rule, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: '#0a0a0a',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid #333',
                      }}
                    >
                      <Typography variant="body2" color="#ccc">
                        {index + 1}. {rule}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveRule(index)}
                        sx={{ color: '#666', '&:hover': { color: '#ff3366' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* 태그 */}
              <Box>
                <Typography variant="h6" color="#fff" fontWeight={700} mb={2}>
                  태그
                </Typography>
                <Stack direction="row" spacing={1} mb={2}>
                  <TextField
                    fullWidth
                    size="small"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="태그 입력 후 Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#0a0a0a',
                        color: '#fff',
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#ff3366' },
                        '&.Mui-focused fieldset': { borderColor: '#ff3366' },
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    sx={{
                      borderColor: '#ff3366',
                      color: '#ff3366',
                      '&:hover': { borderColor: '#e62958', bgcolor: 'rgba(255,51,102,0.1)' },
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                  {formData.tags?.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{
                        bgcolor: '#2a2a2a',
                        color: '#ff3366',
                        fontWeight: 600,
                        '& .MuiChip-deleteIcon': { color: '#666', '&:hover': { color: '#ff3366' } },
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* 설정 */}
              <Box>
                <Typography variant="h6" color="#fff" fontWeight={700} mb={2}>
                  공개 설정
                </Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#666' }}>공개 범위</InputLabel>
                    <Select
                      value={formData.visibility}
                      onChange={(e) => handleChange('visibility', e.target.value)}
                      label="공개 범위"
                      sx={{
                        bgcolor: '#0a0a0a',
                        color: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ff3366' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff3366' },
                        '& .MuiSvgIcon-root': { color: '#666' },
                      }}
                    >
                      <MenuItem value={Visibility.PUBLIC}>전체 공개</MenuItem>
                      <MenuItem value={Visibility.PRIVATE}>비공개</MenuItem>
                      <MenuItem value={Visibility.FOLLOWERS_ONLY}>팔로워 전용</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isAdultContent}
                        onChange={(e) => handleChange('isAdultContent', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#ff3366' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            bgcolor: '#ff3366',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography color="#ccc">
                        성인 컨텐츠 (19세 미만 이용 불가)
                      </Typography>
                    }
                  />
                </Stack>
              </Box>

              {/* 제출 버튼 */}
              <Box sx={{ pt: 2, borderTop: '1px solid #2a2a2a' }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    sx={{
                      borderColor: '#333',
                      color: '#999',
                      '&:hover': { borderColor: '#666', bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                      bgcolor: '#ff3366',
                      fontWeight: 700,
                      px: 4,
                      '&:hover': { bgcolor: '#e62958' },
                      '&:disabled': { bgcolor: '#333', color: '#666' },
                    }}
                  >
                    {loading ? '생성 중...' : '세계관 생성'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </PageLayout>
  );
}
