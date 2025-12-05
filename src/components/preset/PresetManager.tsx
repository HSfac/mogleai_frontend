'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { presetService } from '@/services/presetService';
import {
  PersonaPreset,
  CreatePresetDto,
  PresetMood,
  PresetMoodLabels,
} from '@/types/preset';

interface PresetManagerProps {
  characterId: string;
  isOwner: boolean;
  onSelectPreset?: (presetId: string) => void;
}

export default function PresetManager({
  characterId,
  isOwner,
  onSelectPreset,
}: PresetManagerProps) {
  const [presets, setPresets] = useState<PersonaPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<PersonaPreset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<PersonaPreset | null>(null);
  const [saving, setSaving] = useState(false);
  const [ruleInput, setRuleInput] = useState('');

  const [formData, setFormData] = useState<CreatePresetDto>({
    title: '',
    relationshipToUser: '',
    mood: PresetMood.CALM,
    speakingTone: '',
    scenarioIntro: '',
    rules: [],
    thumbnailImage: '',
    isDefault: false,
  });

  useEffect(() => {
    loadPresets();
  }, [characterId]);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const data = await presetService.getPresetsByCharacter(characterId);
      setPresets(data);
    } catch (err) {
      console.error('프리셋을 불러오는데 실패했습니다:', err);
      setError('프리셋을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (preset?: PersonaPreset) => {
    if (preset) {
      setEditingPreset(preset);
      setFormData({
        title: preset.title,
        relationshipToUser: preset.relationshipToUser,
        mood: preset.mood,
        speakingTone: preset.speakingTone || '',
        scenarioIntro: preset.scenarioIntro || '',
        rules: preset.rules || [],
        thumbnailImage: preset.thumbnailImage || '',
        isDefault: preset.isDefault,
      });
    } else {
      setEditingPreset(null);
      setFormData({
        title: '',
        relationshipToUser: '',
        mood: PresetMood.CALM,
        speakingTone: '',
        scenarioIntro: '',
        rules: [],
        thumbnailImage: '',
        isDefault: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPreset(null);
    setRuleInput('');
  };

  const handleChange = (field: keyof CreatePresetDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    if (!formData.title.trim()) {
      setError('프리셋 제목을 입력해주세요.');
      return;
    }
    if (!formData.relationshipToUser.trim()) {
      setError('유저와의 관계를 입력해주세요.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingPreset) {
        await presetService.updatePreset(editingPreset._id, formData);
      } else {
        await presetService.createPreset(characterId, formData);
      }
      await loadPresets();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!presetToDelete) return;

    try {
      await presetService.deletePreset(presetToDelete._id);
      await loadPresets();
      setDeleteDialogOpen(false);
      setPresetToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handleSetDefault = async (presetId: string) => {
    try {
      await presetService.setDefaultPreset(presetId);
      await loadPresets();
    } catch (err: any) {
      setError(err.response?.data?.message || '기본 프리셋 설정에 실패했습니다.');
    }
  };

  const handleDuplicate = async (presetId: string, title: string) => {
    try {
      await presetService.duplicatePreset(presetId, `${title} (복사)`);
      await loadPresets();
    } catch (err: any) {
      setError(err.response?.data?.message || '복제에 실패했습니다.');
    }
  };

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

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          프리셋 ({presets.length})
        </Typography>
        {isOwner && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              color: '#ff3366',
              '&:hover': { bgcolor: 'rgba(255,51,102,0.1)' },
            }}
          >
            새 프리셋
          </Button>
        )}
      </Box>

      {presets.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          아직 프리셋이 없습니다.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {presets.map((preset) => (
            <Card
              key={preset._id}
              sx={{
                bgcolor: preset.isDefault ? 'rgba(255,51,102,0.05)' : '#f9f9f9',
                border: preset.isDefault ? '2px solid #ff3366' : '1px solid #eee',
                cursor: onSelectPreset ? 'pointer' : 'default',
                transition: 'all 0.2s',
                '&:hover': onSelectPreset
                  ? {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }
                  : {},
              }}
              onClick={() => onSelectPreset?.(preset._id)}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {preset.title}
                      </Typography>
                      {preset.isDefault && (
                        <Chip
                          label="기본"
                          size="small"
                          sx={{
                            bgcolor: '#ff3366',
                            color: '#fff',
                            height: 20,
                            fontSize: '0.65rem',
                          }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      관계: {preset.relationshipToUser}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip
                        label={PresetMoodLabels[preset.mood]}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                      <Chip
                        label={`${preset.usageCount}회 사용`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    </Stack>
                  </Box>

                  {isOwner && (
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(preset._id);
                        }}
                        title="기본 프리셋으로 설정"
                      >
                        {preset.isDefault ? (
                          <StarIcon sx={{ fontSize: 18, color: '#ff3366' }} />
                        ) : (
                          <StarBorderIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(preset._id, preset.title);
                        }}
                        title="복제"
                      >
                        <ContentCopyIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(preset);
                        }}
                        title="수정"
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPresetToDelete(preset);
                          setDeleteDialogOpen(true);
                        }}
                        title="삭제"
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  )}
                </Box>

                {preset.scenarioIntro && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {preset.scenarioIntro}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPreset ? '프리셋 수정' : '새 프리셋 만들기'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="프리셋 제목"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="예: 첫 만남, 연인 관계"
              fullWidth
              inputProps={{ maxLength: 30 }}
              helperText={`${formData.title.length}/30`}
            />

            <TextField
              label="유저와의 관계"
              value={formData.relationshipToUser}
              onChange={(e) => handleChange('relationshipToUser', e.target.value)}
              placeholder="예: 친구, 연인, 선배"
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>분위기</InputLabel>
              <Select
                value={formData.mood}
                onChange={(e) => handleChange('mood', e.target.value)}
                label="분위기"
              >
                {Object.entries(PresetMoodLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="말투 변형"
              value={formData.speakingTone}
              onChange={(e) => handleChange('speakingTone', e.target.value)}
              placeholder="예: 존댓말, 약간 쑥스러워하며 말함"
              fullWidth
            />

            <TextField
              label="시작 상황 설명"
              value={formData.scenarioIntro}
              onChange={(e) => handleChange('scenarioIntro', e.target.value)}
              placeholder="예: 학교 옥상에서 우연히 마주친 상황"
              fullWidth
              multiline
              rows={3}
            />

            <Box>
              <Typography variant="subtitle2" mb={1}>
                프리셋 규칙
              </Typography>
              <Stack direction="row" spacing={1} mb={1}>
                <TextField
                  size="small"
                  value={ruleInput}
                  onChange={(e) => setRuleInput(e.target.value)}
                  placeholder="규칙 입력 후 Enter"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRule();
                    }
                  }}
                />
                <Button variant="outlined" onClick={handleAddRule}>
                  추가
                </Button>
              </Stack>
              <Stack spacing={0.5}>
                {formData.rules?.map((rule, index) => (
                  <Chip
                    key={index}
                    label={rule}
                    onDelete={() => handleRemoveRule(index)}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>

            <TextField
              label="대표 이미지 URL"
              value={formData.thumbnailImage}
              onChange={(e) => handleChange('thumbnailImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            sx={{ bgcolor: '#ff3366', '&:hover': { bgcolor: '#e62958' } }}
          >
            {saving ? '저장 중...' : editingPreset ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>프리셋 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            "{presetToDelete?.title}" 프리셋을 삭제하시겠습니까?
          </Typography>
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
