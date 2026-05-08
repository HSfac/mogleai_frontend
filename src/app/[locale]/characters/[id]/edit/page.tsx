'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Divider,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PreviewIcon from '@mui/icons-material/Preview';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { characterService } from '@/services/character.service';
import { api } from '@/lib/api';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

export default function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { getLocalePath } = useLocaleNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: '',
    speakingStyle: '',
    defaultAIModel: 'gpt4',
    isPublic: true,
    isAdultContent: false,
    profileImage: '',
    // 새로 추가된 필드들
    tags: [] as string[],
    greeting: '',
    scenario: '',
    exampleDialogues: [{ user: '', character: '' }, { user: '', character: '' }, { user: '', character: '' }],
    characterTraits: [] as string[],
    visibility: 'public',
    temperature: 0.7,
    memoryEnabled: true,
    maxMemoryMessages: 20,
    category: '',
  });

  // 이미지 업로드
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const loginPath = getLocalePath('/login');
  const characterDetailPath = getLocalePath(`/characters/${id}`);
  const characterEditPath = getLocalePath(`/characters/${id}/edit`);

  // 캐릭터 데이터 불러오기
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`${loginPath}?redirect=${encodeURIComponent(characterEditPath)}`);
      return;
    }

    const fetchCharacter = async () => {
      try {
        setLoading(true);
        const character = await characterService.getCharacter(id);

        // 본인이 만든 캐릭터인지 확인
        if (character.creator._id !== user?._id) {
          setError('본인이 만든 캐릭터만 수정할 수 있습니다.');
          setTimeout(() => {
            router.push(characterDetailPath);
          }, 2000);
          return;
        }

        // 폼 데이터 설정
        setFormData({
          name: character.name,
          description: character.description,
          personality: character.personality,
          speakingStyle: character.speakingStyle,
          defaultAIModel: character.defaultAIModel || 'gpt4',
          isPublic: character.isPublic,
          isAdultContent: character.isAdultContent || false,
          profileImage: character.profileImage || '',
          // 새 필드들
          tags: character.tags || [],
          greeting: character.greeting || '',
          scenario: character.scenario || '',
          exampleDialogues: character.exampleDialogues?.length > 0
            ? character.exampleDialogues
            : [{ user: '', character: '' }, { user: '', character: '' }, { user: '', character: '' }],
          characterTraits: character.characterTraits || [],
          visibility: character.visibility || 'public',
          temperature: character.temperature || 0.7,
          memoryEnabled: character.memoryEnabled !== undefined ? character.memoryEnabled : true,
          maxMemoryMessages: character.maxMemoryMessages || 20,
          category: character.category || '',
        });

        setImagePreview(character.profileImage || '');
        setLoading(false);
      } catch (error: any) {
        console.error('캐릭터 정보를 불러오는데 실패했습니다:', error);
        setError('캐릭터 정보를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [authLoading, characterDetailPath, characterEditPath, isAuthenticated, loginPath, id, router, user]);

  // 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 업로드
  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.profileImage;

    setUploadingImage(true);
    try {
      // 1. 백엔드에서 Presigned URL 받기
      const response = await api.post('/upload/presigned-url', {
        fileName: imageFile.name,
        fileType: imageFile.type,
        folder: 'characters',
      });

      const { uploadUrl, fileUrl } = response.data;

      // 2. S3에 직접 업로드
      await fetch(uploadUrl, {
        method: 'PUT',
        body: imageFile,
        headers: {
          'Content-Type': imageFile.type,
        },
      });

      return fileUrl;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  // 폼 검증
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('캐릭터 이름을 입력해주세요.');
      return false;
    }

    if (formData.name.length < 2 || formData.name.length > 30) {
      setError('캐릭터 이름은 2-30자 사이여야 합니다.');
      return false;
    }

    if (!formData.description.trim()) {
      setError('캐릭터 설명을 입력해주세요.');
      return false;
    }

    if (formData.description.length < 10 || formData.description.length > 200) {
      setError('캐릭터 설명은 10-200자 사이여야 합니다.');
      return false;
    }

    if (!formData.personality.trim()) {
      setError('캐릭터 성격을 입력해주세요.');
      return false;
    }

    if (formData.personality.length < 20) {
      setError('캐릭터 성격은 최소 20자 이상 입력해주세요.');
      return false;
    }

    if (!formData.speakingStyle.trim()) {
      setError('말투를 입력해주세요.');
      return false;
    }

    if (formData.speakingStyle.length < 20) {
      setError('말투는 최소 20자 이상 입력해주세요.');
      return false;
    }

    return true;
  };

  // 캐릭터 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      // 이미지 업로드
      let imageUrl = formData.profileImage;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // 캐릭터 수정 데이터
      const characterData = {
        ...formData,
        profileImage: imageUrl,
      };

      // API 호출
      await api.put(`/characters/${id}`, characterData);

      setSuccess('캐릭터가 성공적으로 수정되었습니다!');

      // 2초 후 캐릭터 상세 페이지로 이동
      setTimeout(() => {
        router.push(characterDetailPath);
      }, 2000);
    } catch (error: any) {
      console.error('캐릭터 수정 실패:', error);
      setError(error.response?.data?.message || '캐릭터 수정에 실패했습니다.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* 헤더 */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/characters/${id}`)}
              sx={{ mb: 2 }}
            >
              뒤로 가기
            </Button>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              캐릭터 수정
            </Typography>
            <Typography variant="body1" color="text.secondary">
              캐릭터 정보를 수정하세요. 수정된 내용은 모든 대화에 즉시 반영됩니다.
            </Typography>
          </Box>

          {/* Snackbar */}
          <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Snackbar>

          <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Snackbar>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* 왼쪽: 기본 정보 */}
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  {/* 캐릭터 이름 */}
                  <TextField
                    required
                    fullWidth
                    label="캐릭터 이름"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    helperText={`${formData.name.length}/30자`}
                    inputProps={{ maxLength: 30 }}
                  />

                  {/* 캐릭터 설명 */}
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={3}
                    label="캐릭터 설명 (짧은 소개)"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    helperText={`${formData.description.length}/200자`}
                    inputProps={{ maxLength: 200 }}
                  />

                  {/* 성격 */}
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={5}
                    label="캐릭터 성격"
                    name="personality"
                    value={formData.personality}
                    onChange={handleChange}
                    placeholder="캐릭터의 성격을 자세히 설명해주세요. (예: 밝고 긍정적인 성격, 약간 수줍음이 많지만 친해지면 활발함)"
                    helperText={`${formData.personality.length}자 (최소 20자)`}
                  />

                  {/* 말투 */}
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={5}
                    label="말투"
                    name="speakingStyle"
                    value={formData.speakingStyle}
                    onChange={handleChange}
                    placeholder="캐릭터의 말투와 대화 스타일을 설명해주세요. (예: 존댓말을 사용하며, 친근하고 따뜻한 말투)"
                    helperText={`${formData.speakingStyle.length}자 (최소 20자)`}
                  />

                  {/* AI 모델 선택 */}
                  <FormControl fullWidth>
                    <InputLabel>기본 AI 모델</InputLabel>
                    <Select
                      name="defaultAIModel"
                      value={formData.defaultAIModel}
                      onChange={handleSelectChange}
                      label="기본 AI 모델"
                    >
                      <MenuItem value="gpt4">GPT-4 (균형잡힌 성능)</MenuItem>
                      <MenuItem value="claude3">Claude 3 (창의적인 대화)</MenuItem>
                      <MenuItem value="grok">Grok (빠른 응답)</MenuItem>
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 2 }}>고급 설정</Divider>

                  {/* 첫 인사말 */}
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="첫 인사말 (Greeting)"
                    name="greeting"
                    value={formData.greeting}
                    onChange={handleChange}
                    placeholder="사용자가 대화를 시작할 때 캐릭터가 먼저 건네는 인사말입니다.&#10;예: 안녕하세요! 무엇을 도와드릴까요? 😊"
                    helperText="비워두면 기본 인사말이 사용됩니다"
                  />

                  {/* 시나리오/배경 */}
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="시나리오 / 배경 설정"
                    name="scenario"
                    value={formData.scenario}
                    onChange={handleChange}
                    placeholder="캐릭터가 어떤 상황/환경에 있는지 설명해주세요.&#10;&#10;예:&#10;- 현대 도시의 카페에서 일하는 바리스타&#10;- 판타지 세계의 마법 학교 교수&#10;- 우주 정거장의 AI 시스템"
                  />

                  {/* 카테고리 */}
                  <FormControl fullWidth>
                    <InputLabel>카테고리</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleSelectChange}
                      label="카테고리"
                    >
                      <MenuItem value="">선택 안 함</MenuItem>
                      <MenuItem value="helper">도우미/헬퍼</MenuItem>
                      <MenuItem value="fantasy">판타지</MenuItem>
                      <MenuItem value="scifi">SF</MenuItem>
                      <MenuItem value="romance">로맨스</MenuItem>
                      <MenuItem value="anime">애니메이션</MenuItem>
                      <MenuItem value="game">게임</MenuItem>
                      <MenuItem value="celebrity">유명인</MenuItem>
                      <MenuItem value="education">교육</MenuItem>
                      <MenuItem value="comedy">코미디</MenuItem>
                    </Select>
                  </FormControl>

                  {/* 태그 */}
                  <TextField
                    fullWidth
                    label="태그 (쉼표로 구분)"
                    name="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                      setFormData(prev => ({ ...prev, tags }));
                    }}
                    placeholder="예: 친절함, 전문가, AI, 도우미"
                    helperText="검색 및 필터링에 사용됩니다"
                  />

                  {/* 대화 예시 */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      대화 예시 (최소 3개 권장)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      캐릭터의 말투와 응답 스타일을 학습하는데 사용됩니다.
                    </Typography>
                    {formData.exampleDialogues.map((dialogue, index) => (
                      <Card key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label={`사용자 메시지 ${index + 1}`}
                            value={dialogue.user}
                            onChange={(e) => {
                              const newDialogues = [...formData.exampleDialogues];
                              newDialogues[index].user = e.target.value;
                              setFormData(prev => ({ ...prev, exampleDialogues: newDialogues }));
                            }}
                            placeholder="예: 오늘 날씨 어때?"
                          />
                          <TextField
                            fullWidth
                            label={`캐릭터 응답 ${index + 1}`}
                            value={dialogue.character}
                            onChange={(e) => {
                              const newDialogues = [...formData.exampleDialogues];
                              newDialogues[index].character = e.target.value;
                              setFormData(prev => ({ ...prev, exampleDialogues: newDialogues }));
                            }}
                            placeholder="예: 오늘은 맑고 화창한 날씨네요! 산책하기 좋을 것 같아요 😊"
                          />
                          {formData.exampleDialogues.length > 3 && (
                            <Button
                              variant="text"
                              color="error"
                              size="small"
                              onClick={() => {
                                const newDialogues = formData.exampleDialogues.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, exampleDialogues: newDialogues }));
                              }}
                            >
                              삭제
                            </Button>
                          )}
                        </Stack>
                      </Card>
                    ))}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          exampleDialogues: [...prev.exampleDialogues, { user: '', character: '' }]
                        }));
                      }}
                    >
                      대화 예시 추가
                    </Button>
                  </Box>

                  {/* AI 창의성 슬라이더 */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      AI 응답 창의성: {formData.temperature.toFixed(1)}
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        style={{ width: '100%' }}
                      />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption">일관적</Typography>
                        <Typography variant="caption">창의적</Typography>
                      </Stack>
                    </Box>
                  </Box>

                  {/* 공개 여부 */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPublic}
                        onChange={handleSwitchChange}
                        name="isPublic"
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">공개 캐릭터로 설정</Typography>
                        <Typography variant="caption" color="text.secondary">
                          다른 사용자들도 이 캐릭터와 대화할 수 있습니다.
                        </Typography>
                      </Box>
                    }
                  />

                  <Divider sx={{ my: 2 }} />

                  {/* 성인 컨텐츠 설정 */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isAdultContent}
                        onChange={(e) => {
                          if (e.target.checked && !user?.isAdultVerified) {
                            setError('성인 컨텐츠 캐릭터를 만들려면 성인 인증이 필요합니다.');
                            return;
                          }
                          handleSwitchChange(e);
                        }}
                        name="isAdultContent"
                        color="error"
                        disabled={!user?.isAdultVerified}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">
                          성인 컨텐츠 캐릭터 🔞
                          {!user?.isAdultVerified && (
                            <Chip
                              label="성인 인증 필요"
                              size="small"
                              color="error"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          19세 이상만 대화 가능한 캐릭터입니다.
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Grid>

              {/* 오른쪽: 이미지 및 미리보기 */}
              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  {/* 이미지 업로드 */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        프로필 이미지
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        권장 크기: 500x500px (최대 5MB)
                      </Typography>

                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Avatar
                          src={imagePreview || '/images/default-character.png'}
                          alt="캐릭터 이미지"
                          sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          fullWidth
                        >
                          이미지 변경
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageSelect}
                          />
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* 미리보기 카드 */}
                  <Card variant="outlined" sx={{ bgcolor: '#f5f5f5' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        미리보기
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Avatar
                          src={imagePreview || '/images/default-character.png'}
                          alt={formData.name || '캐릭터'}
                          sx={{ width: 60, height: 60, mb: 1 }}
                        />
                        <Typography variant="h6" fontWeight="bold">
                          {formData.name || '캐릭터 이름'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {formData.description || '캐릭터 설명이 여기에 표시됩니다...'}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={
                            formData.defaultAIModel === 'gpt4'
                              ? 'GPT-4'
                              : formData.defaultAIModel === 'claude3'
                              ? 'Claude 3'
                              : 'Mistral'
                          }
                          size="small"
                          color="primary"
                        />
                        {formData.isPublic && (
                          <Chip label="공개" size="small" color="success" />
                        )}
                        {formData.isAdultContent && (
                          <Chip label="19+" size="small" color="error" />
                        )}
                        {formData.category && (
                          <Chip label={formData.category} size="small" variant="outlined" />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* 안내 */}
                  <Alert severity="info">
                    <Typography variant="body2">
                      💡 캐릭터 정보를 수정하면 모든 대화에 즉시 반영됩니다.
                    </Typography>
                  </Alert>
                </Stack>
              </Grid>

              {/* 제출 버튼 */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.push(`/characters/${id}`)}
                    disabled={saving}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving || uploadingImage}
                    size="large"
                  >
                    {saving ? '저장 중...' : '수정 완료'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </PageLayout>
  );
}
