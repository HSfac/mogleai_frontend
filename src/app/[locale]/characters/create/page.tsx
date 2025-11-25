'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
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
import PreviewIcon from '@mui/icons-material/Preview';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { characterService } from '@/services/character.service';

export default function CreateCharacterPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
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

  // 인증 확인
  if (!isAuthenticated) {
    router.push('/login?redirect=/characters/create');
    return null;
  }

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
    setFormData(prev => ({ ...prev, isPublic: e.target.checked }));
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setImageFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // S3 Presigned URL을 사용한 이미지 업로드
  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return '';

    setUploadingImage(true);
    try {
      // 1. 백엔드에서 Presigned URL 요청
      const response = await api.post('/upload/presigned-url', {
        fileName: imageFile.name,
        fileType: imageFile.type,
        folder: 'characters',
      });

      const { uploadUrl, fileUrl } = response.data;

      // 2. S3에 직접 업로드
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: imageFile,
        headers: {
          'Content-Type': imageFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('S3 업로드 실패');
      }

      // 3. 업로드된 파일의 최종 URL 반환
      return fileUrl;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      setError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      throw error;
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

  // 캐릭터 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // 이미지 업로드
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // 캐릭터 생성 데이터
      const characterData = {
        ...formData,
        profileImage: imageUrl,
      };

      // API 호출
      const newCharacter = await characterService.createCharacter(characterData);

      setSuccess('캐릭터가 성공적으로 생성되었습니다!');

      // 2초 후 캐릭터 상세 페이지로 이동
      setTimeout(() => {
        router.push(`/characters/${newCharacter._id}`);
      }, 2000);
    } catch (error: any) {
      console.error('캐릭터 생성 실패:', error);
      setError(error.response?.data?.message || '캐릭터 생성에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* 헤더 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              새 캐릭터 만들기
            </Typography>
            <Typography variant="body1" color="text.secondary">
              나만의 AI 캐릭터를 만들어보세요. 자세하게 설정할수록 더 생생한 대화가 가능합니다.
            </Typography>
          </Box>

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
                    placeholder="예: 친절한 AI 비서"
                    helperText={`${formData.name.length}/30자`}
                    inputProps={{ maxLength: 30 }}
                  />

                  {/* 캐릭터 설명 (짧은 소개) */}
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={3}
                    label="캐릭터 설명 (짧은 소개)"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="캐릭터를 간단히 소개해주세요. 사용자들이 검색할 때 보이는 설명입니다."
                    helperText={`${formData.description.length}/200자`}
                    inputProps={{ maxLength: 200 }}
                  />

                  {/* 캐릭터 성격 (시스템 프롬프트) */}
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={6}
                    label="캐릭터 성격 (상세 설정)"
                    name="personality"
                    value={formData.personality}
                    onChange={handleChange}
                    placeholder="캐릭터의 성격, 배경, 특징 등을 자세히 설명해주세요. AI가 이 정보를 바탕으로 대화합니다.&#10;&#10;예시:&#10;- 당신은 친절하고 전문적인 AI 비서입니다.&#10;- 항상 공손하고 예의 바른 태도로 답변합니다.&#10;- 사용자의 질문에 명확하고 정확하게 답변하려고 노력합니다.&#10;- 어려운 전문 용어는 쉽게 풀어서 설명합니다."
                    helperText={`최소 20자 이상 입력해주세요 (현재: ${formData.personality.length}자)`}
                  />

                  {/* 말투 */}
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="말투 및 대화 스타일"
                    name="speakingStyle"
                    value={formData.speakingStyle}
                    onChange={handleChange}
                    placeholder="캐릭터가 어떻게 말하는지 설명해주세요.&#10;&#10;예시:&#10;- 존댓말을 사용하며 정중하게 대화합니다.&#10;- 이모티콘을 적절히 사용해 친근하게 다가갑니다. 😊&#10;- 문장은 간결하고 명확하게 작성합니다.&#10;- 전문적이면서도 따뜻한 어조를 유지합니다."
                    helperText={`최소 20자 이상 입력해주세요 (현재: ${formData.speakingStyle.length}자)`}
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
                      <MenuItem value="mistral">Mistral (빠른 응답)</MenuItem>
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
                          다른 사용자들도 이 캐릭터와 대화할 수 있습니다. (수익 공유 가능)
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
                            setTimeout(() => {
                              router.push('/profile');
                            }, 2000);
                            return;
                          }
                          setFormData(prev => ({ ...prev, isAdultContent: e.target.checked }));
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
                          19세 이상만 대화 가능한 캐릭터입니다. 성인 인증이 완료되어야 생성할 수 있습니다.
                        </Typography>
                      </Box>
                    }
                  />

                  {!user?.isAdultVerified && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      성인 컨텐츠 캐릭터를 만들려면{' '}
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => router.push('/profile')}
                        sx={{ textDecoration: 'underline' }}
                      >
                        프로필 페이지
                      </Button>
                      에서 성인 인증을 완료해주세요.
                    </Alert>
                  )}
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
                          이미지 선택
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
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* 안내 */}
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>팁:</strong> 구체적으로 작성할수록 캐릭터가 더욱 생생하게 대화합니다!
                    </Typography>
                  </Alert>
                </Stack>
              </Grid>
            </Grid>

            {/* 하단 버튼 */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.back()}
                disabled={loading}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading || uploadingImage}
                sx={{
                  bgcolor: '#ff5e62',
                  '&:hover': { bgcolor: '#ff4b50' },
                  minWidth: 150,
                }}
              >
                {loading ? '생성 중...' : '캐릭터 생성'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>

      {/* 에러/성공 스낵바 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
