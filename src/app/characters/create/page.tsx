'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PageLayout from '@/components/PageLayout';
import { AIModel } from '@/types/character';

// 캐릭터 생성 단계
const steps = ['기본 정보', '성격 및 특성', '대화 스타일', '마무리'];

export default function CreateCharacterPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // 캐릭터 정보 상태
  const [character, setCharacter] = useState({
    name: '',
    description: '',
    longDescription: '',
    personality: '',
    speakingStyle: '',
    exampleDialogs: '',
    tags: [],
    imageFile: null,
    imagePreview: '',
    defaultAIModel: AIModel.GPT4,
    isPublic: true,
  });

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacter(prev => ({ ...prev, [name]: value }));
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCharacter(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 태그 추가 핸들러
  const [tagInput, setTagInput] = useState('');
  
  const handleAddTag = () => {
    if (tagInput.trim() && !character.tags.includes(tagInput.trim())) {
      setCharacter(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // 태그 삭제 핸들러
  const handleDeleteTag = (tagToDelete) => {
    setCharacter(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  // 다음 단계로 이동
  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };

  // 이전 단계로 이동
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  // 캐릭터 생성 제출
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 이미지 업로드 처리
      let imageUrl = '';
      if (character.imageFile) {
        const formData = new FormData();
        formData.append('file', character.imageFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('이미지 업로드에 실패했습니다.');
        }
        
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }
      
      // 캐릭터 생성 API 호출
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...character,
          imageUrl,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '캐릭터 생성에 실패했습니다.');
      }
      
      setSuccess(true);
      
      // 생성된 캐릭터 페이지로 이동
      const result = await response.json();
      setTimeout(() => {
        router.push(`/characters/${result._id}`);
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 단계별 컨텐츠 렌더링
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              기본 정보
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="캐릭터 이름"
                  name="name"
                  value={character.name}
                  onChange={handleChange}
                  placeholder="예: 비비, 몽글이, 챗봇 선생님"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="간단한 설명"
                  name="description"
                  value={character.description}
                  onChange={handleChange}
                  placeholder="한 줄로 캐릭터를 소개해주세요 (최대 100자)"
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="상세 설명"
                  name="longDescription"
                  value={character.longDescription}
                  onChange={handleChange}
                  placeholder="캐릭터의 배경, 역할, 특징 등을 자세히 설명해주세요"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">캐릭터 이미지</Typography>
                  <Tooltip title="캐릭터를 시각적으로 표현할 이미지를 업로드하세요. 정사각형 이미지를 권장합니다.">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoAlternateIcon />}
                  >
                    이미지 업로드
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {character.imagePreview && (
                    <Box sx={{ ml: 2 }}>
                      <Avatar
                        src={character.imagePreview}
                        alt="Character preview"
                        sx={{ width: 64, height: 64 }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              성격 및 특성
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="성격"
                  name="personality"
                  value={character.personality}
                  onChange={handleChange}
                  placeholder="캐릭터의 성격을 자세히 설명해주세요. 예: 친절하고 유머러스하며, 항상 긍정적인 태도를 가지고 있습니다."
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    태그
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      label="태그 추가"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="태그를 입력하고 Enter 키를 누르세요"
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddTag}
                      sx={{ ml: 1 }}
                    >
                      추가
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {character.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              대화 스타일
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="말투 및 대화 스타일"
                  name="speakingStyle"
                  value={character.speakingStyle}
                  onChange={handleChange}
                  placeholder="캐릭터가 어떤 말투와 대화 스타일을 가지고 있는지 설명해주세요. 예: 존댓말을 사용하며, 간결하고 명확하게 대답합니다."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={6}
                  label="대화 예시"
                  name="exampleDialogs"
                  value={character.exampleDialogs}
                  onChange={handleChange}
                  placeholder="사용자와 캐릭터 간의 대화 예시를 작성해주세요. 예: 사용자: 안녕하세요? / 캐릭터: 안녕하세요! 오늘 기분이 어떠신가요?"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              마무리 설정
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>기본 AI 모델</InputLabel>
                  <Select
                    name="defaultAIModel"
                    value={character.defaultAIModel}
                    onChange={handleChange}
                    label="기본 AI 모델"
                  >
                    <MenuItem value={AIModel.GPT4}>GPT-4 (기본)</MenuItem>
                    <MenuItem value={AIModel.CLAUDE3}>Claude 3</MenuItem>
                    <MenuItem value={AIModel.MISTRAL}>Mistral</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={character.isPublic}
                      onChange={(e) => 
                        setCharacter(prev => ({ 
                          ...prev, 
                          isPublic: e.target.checked 
                        }))
                      }
                    />
                  }
                  label="공개 캐릭터로 설정 (다른 사용자가 이 캐릭터와 대화할 수 있습니다)"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  미리보기
                </Typography>
                <Card sx={{ display: 'flex', mb: 2 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 120, height: 120, objectFit: 'cover' }}
                    image={character.imagePreview || '/images/default-character.png'}
                    alt={character.name}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <CardContent sx={{ flex: '1 0 auto' }}>
                      <Typography component="div" variant="h5">
                        {character.name || '캐릭터 이름'}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" component="div">
                        {character.description || '캐릭터 설명'}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {character.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return '알 수 없는 단계';
    }
  };

  return (
    <PageLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            AI 캐릭터 만들기
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              이전
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? '생성 중...' : '캐릭터 생성'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                다음
              </Button>
            )}
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success">
            캐릭터가 성공적으로 생성되었습니다!
          </Alert>
        </Snackbar>
      </Container>
    </PageLayout>
  );
} 