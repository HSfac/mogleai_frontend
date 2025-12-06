'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoodIcon from '@mui/icons-material/Mood';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { characterService } from '@/services/character.service';
import { ChatMode, SessionState } from '@/types/user';
import MemoryPanel from '@/components/memory/MemoryPanel';
import HistoryIcon from '@mui/icons-material/History';

interface Message {
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestedReplies?: string[];
}

interface Chat {
  _id: string;
  character: string;
  messages: Message[];
  aiModel: string;
  mode?: ChatMode;
  sessionState?: SessionState;
  title?: string;
}

interface Character {
  _id: string;
  name: string;
  imageUrl?: string;
  description: string;
  tags?: string[];
}

// 모드 설정 정보
const MODE_CONFIG = {
  [ChatMode.STORY]: {
    label: '스토리',
    icon: AutoStoriesIcon,
    description: '긴 서사와 묘사 중심',
    color: '#9c27b0',
  },
  [ChatMode.CHAT]: {
    label: '채팅',
    icon: ChatBubbleOutlineIcon,
    description: '일상 대화 모드',
    color: '#ff5f9b',
  },
  [ChatMode.CREATOR_DEBUG]: {
    label: '디버그',
    icon: BugReportIcon,
    description: '크리에이터 테스트용',
    color: '#ff9800',
  },
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<{ cancel: () => void } | null>(null);

  // 새로운 상태
  const [showSessionState, setShowSessionState] = useState(false);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loadingDebug, setLoadingDebug] = useState(false);
  const [modeAnchorEl, setModeAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/chat/${id}`);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const chatData = await chatService.getChat(id);
        setChat(chatData);
        const characterData = await characterService.getCharacter(chatData.character);
        setCharacter(characterData);
      } catch (error: any) {
        console.error(error);
        setError('채팅 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  useEffect(() => {
    return () => {
      streamRef.current?.cancel();
    };
  }, []);

  const messageStats = useMemo(() => {
    if (!chat) return { user: 0, ai: 0 };
    const userCount = chat.messages.filter((msg) => msg.sender === 'user').length;
    const aiCount = chat.messages.filter((msg) => msg.sender === 'ai').length;
    return { user: userCount, ai: aiCount };
  }, [chat]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    const userInput = message.trim();
    setMessage('');
    setIsSending(true);

    const userBubble: Message = {
      sender: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    const aiBubble: Message = {
      sender: 'ai',
      content: '',
      timestamp: new Date(),
    };

    setChat((prev) =>
      prev
        ? { ...prev, messages: [...prev.messages, userBubble, aiBubble] }
        : prev,
    );

    let fullResponse = '';

    streamRef.current = chatService.streamMessage(id, userInput, {
      onChunk: (_chunk, fullText) => {
        fullResponse = fullText;
        setChat((prev) => {
          if (!prev) return prev;
          const updated = [...prev.messages];
          if (updated.length === 0) return prev;
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: fullResponse,
            timestamp: new Date(),
          };
          return { ...prev, messages: updated };
        });
      },
      onDone: (payload?: { suggestedReplies?: string[] }) => {
        // 추천 응답이 있으면 마지막 AI 메시지에 추가
        if (payload?.suggestedReplies && payload.suggestedReplies.length > 0) {
          setChat((prev) => {
            if (!prev) return prev;
            const updated = [...prev.messages];
            if (updated.length > 0 && updated[updated.length - 1]?.sender === 'ai') {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                suggestedReplies: payload.suggestedReplies,
              };
            }
            return { ...prev, messages: updated };
          });
        }
        setIsSending(false);
      },
      onError: (err) => {
        console.error(err);
        setError('메시지를 전송하는데 실패했습니다.');
        setIsSending(false);
        setChat((prev) => {
          if (!prev) return prev;
          const updated = [...prev.messages];
          if (updated[updated.length - 1]?.sender === 'ai') {
            updated.pop();
          }
          if (updated[updated.length - 1]?.sender === 'user' && updated[updated.length - 1].content === userInput) {
            updated.pop();
          }
          return { ...prev, messages: updated };
        });
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChangeModel = async (model: string) => {
    setAnchorEl(null);
    try {
      const updatedChat = await chatService.changeAIModel(id, model);
      setChat(updatedChat);
      setToast({ message: `AI 모델이 ${model}로 변경되었습니다.`, severity: 'success' });
    } catch (changeError: any) {
      console.error(changeError);
      setError('AI 모델 변경에 실패했습니다.');
    }
  };

  const handleDeleteChat = async () => {
    if (!confirm('정말로 이 채팅을 삭제하시겠습니까?')) return;
    setAnchorEl(null);
    try {
      await chatService.deleteChat(id);
      router.push('/');
    } catch (deleteError: any) {
      console.error(deleteError);
      setError('채팅 삭제에 실패했습니다.');
    }
  };

  // 모드 변경 핸들러
  const handleChangeMode = async (mode: ChatMode) => {
    setModeAnchorEl(null);
    try {
      const updatedChat = await chatService.changeMode(id, mode);
      setChat(updatedChat);
      const modeLabel = MODE_CONFIG[mode]?.label || mode;
      setToast({ message: `모드가 "${modeLabel}"(으)로 변경되었습니다.`, severity: 'success' });
    } catch (changeModeError: any) {
      console.error(changeModeError);
      setError('모드 변경에 실패했습니다.');
    }
  };

  // 추천 응답 선택 핸들러
  const handleSelectSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  // 디버그 정보 로드
  const loadDebugInfo = async () => {
    if (loadingDebug) return;
    setLoadingDebug(true);
    try {
      const info = await chatService.getDebugInfo(id);
      setDebugInfo(info);
      setShowDebugPanel(true);
    } catch (debugError: any) {
      console.error(debugError);
      setError('디버그 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoadingDebug(false);
    }
  };

  // 현재 모드 정보
  const currentMode = chat?.mode || ChatMode.CHAT;
  const currentModeConfig = MODE_CONFIG[currentMode];
  const ModeIcon = currentModeConfig?.icon || ChatBubbleOutlineIcon;

  // 마지막 AI 메시지의 추천 응답
  const lastAiMessage = chat?.messages.filter((m) => m.sender === 'ai').slice(-1)[0];
  const suggestedReplies = lastAiMessage?.suggestedReplies || [];

  if (isLoading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
          <CircularProgress sx={{ color: '#ff5f9b' }} />
        </Box>
      </PageLayout>
    );
  }

  if (!chat || !character) {
    return (
      <PageLayout>
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Card sx={{ borderRadius: 1, textAlign: 'center', p: 4 }}>
            <Typography variant="h5" fontWeight={700}>
              채팅을 찾을 수 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              요청하신 채팅이 없거나 접근 권한이 없습니다.
            </Typography>
            <Button variant="contained" color="secondary" sx={{ mt: 3 }} onClick={() => router.push('/characters')}>
              캐릭터 탐색하기
            </Button>
          </Card>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: 1,
              background: 'linear-gradient(135deg, rgba(255,95,155,0.95), rgba(255,214,227,0.9))',
              color: '#fff',
              px: { xs: 3, md: 4 },
              py: 4,
              boxShadow: '0 30px 60px rgba(255, 95, 155, 0.35)',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Avatar src={character.imageUrl} sx={{ width: 96, height: 96, bgcolor: '#fff', color: '#ff5f9b' }}>
                {character.name[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight={700}>
                  {character.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {character.description}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                  {(character.tags || []).map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ bgcolor: '#fff', color: '#ff5f9b' }} />
                  ))}
                </Stack>
              </Box>
              <Stack direction="column" spacing={1}>
                <Chip label={`AI 모델: ${chat.aiModel}`} variant="outlined" sx={{ borderColor: '#fff', color: '#fff' }} />
                <Chip
                  icon={<ModeIcon sx={{ color: '#fff !important' }} />}
                  label={currentModeConfig?.label || '채팅'}
                  variant="outlined"
                  onClick={(e) => setModeAnchorEl(e.currentTarget)}
                  sx={{ borderColor: '#fff', color: '#fff', cursor: 'pointer' }}
                />
                <Menu
                  anchorEl={modeAnchorEl}
                  open={Boolean(modeAnchorEl)}
                  onClose={() => setModeAnchorEl(null)}
                >
                  {Object.entries(MODE_CONFIG).map(([mode, config]) => {
                    const Icon = config.icon;
                    return (
                      <MenuItem
                        key={mode}
                        onClick={() => handleChangeMode(mode as ChatMode)}
                        selected={currentMode === mode}
                      >
                        <Icon sx={{ mr: 1, color: config.color }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {config.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {config.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Menu>
                <Chip label={`메시지 ${messageStats.user + messageStats.ai}`} variant="outlined" sx={{ borderColor: '#fff', color: '#fff' }} />
              </Stack>
            </Stack>
          </Card>

          {/* 세션 상태 패널 */}
          {chat.sessionState && (
            <Card sx={{ borderRadius: 1, overflow: 'hidden' }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255,95,155,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setShowSessionState(!showSessionState)}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <MoodIcon sx={{ color: '#ff5f9b' }} />
                  <Typography variant="body2" fontWeight={600}>
                    세션 상태
                  </Typography>
                  <Chip
                    size="small"
                    label={chat.sessionState.mood || '평온'}
                    sx={{ bgcolor: '#ffe4f5', color: '#c3006e' }}
                  />
                </Stack>
                <IconButton size="small">
                  {showSessionState ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={showSessionState}>
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        관계 레벨
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LinearProgress
                          variant="determinate"
                          value={(chat.sessionState.relationshipLevel || 0) * 20}
                          sx={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#ffe4f5',
                            '& .MuiLinearProgress-bar': { bgcolor: '#ff5f9b' },
                          }}
                        />
                        <Stack direction="row">
                          {[...Array(5)].map((_, i) => (
                            <FavoriteIcon
                              key={i}
                              sx={{
                                fontSize: 16,
                                color: i < (chat.sessionState?.relationshipLevel || 0) ? '#ff5f9b' : '#e0e0e0',
                              }}
                            />
                          ))}
                        </Stack>
                      </Stack>
                    </Box>
                    {chat.sessionState.scene && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          현재 장면
                        </Typography>
                        <Typography variant="body2">{chat.sessionState.scene}</Typography>
                      </Box>
                    )}
                    {chat.sessionState.lastSceneSummary && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          이전 요약
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          {chat.sessionState.lastSceneSummary}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        진행도
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <Box
                            key={level}
                            sx={{
                              width: 24,
                              height: 8,
                              borderRadius: 1,
                              bgcolor: level <= (chat.sessionState?.progressCounter || 1) ? '#ff5f9b' : '#e0e0e0',
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </Collapse>
            </Card>
          )}

          {/* 메모리 패널 */}
          <Card sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(255,95,155,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setShowMemoryPanel(!showMemoryPanel)}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <HistoryIcon sx={{ color: '#ff5f9b' }} />
                <Typography variant="body2" fontWeight={600}>
                  메모리 & 노트
                </Typography>
              </Stack>
              <IconButton size="small">
                {showMemoryPanel ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={showMemoryPanel}>
              <Box sx={{ p: 2, bgcolor: '#fff' }}>
                <MemoryPanel chatId={id} characterId={chat.character} />
              </Box>
            </Collapse>
          </Card>

          {/* 디버그 패널 (Creator Debug 모드에서만 표시) */}
          {currentMode === ChatMode.CREATOR_DEBUG && (
            <Card sx={{ borderRadius: 1, overflow: 'hidden', border: '2px solid #ff9800' }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255,152,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => (showDebugPanel ? setShowDebugPanel(false) : loadDebugInfo())}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <BugReportIcon sx={{ color: '#ff9800' }} />
                  <Typography variant="body2" fontWeight={600} color="#ff9800">
                    디버그 정보
                  </Typography>
                  {loadingDebug && <CircularProgress size={16} sx={{ color: '#ff9800' }} />}
                </Stack>
                <IconButton size="small">
                  {showDebugPanel ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={showDebugPanel}>
                {debugInfo && (
                  <Box sx={{ p: 2, bgcolor: '#fffdf5', maxHeight: 400, overflowY: 'auto' }}>
                    <Stack spacing={2}>
                      {/* 채팅 정보 */}
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#ff9800" gutterBottom>
                          채팅 정보
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip size="small" label={`모드: ${debugInfo.chatInfo.mode}`} />
                          <Chip size="small" label={`AI: ${debugInfo.chatInfo.aiModel}`} />
                          <Chip size="small" label={`메시지: ${debugInfo.chatInfo.messageCount}개`} />
                          <Chip size="small" label={`토큰: ${debugInfo.chatInfo.totalTokensUsed}`} />
                          <Chip size="small" label={`메모리 요약: ${debugInfo.chatInfo.memorySummaryCount}개`} />
                        </Stack>
                      </Box>

                      {/* 캐릭터 정보 */}
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#ff9800" gutterBottom>
                          캐릭터 정보
                        </Typography>
                        <Typography variant="body2">
                          이름: {debugInfo.characterInfo.name}
                          {debugInfo.characterInfo.isCreator && (
                            <Chip size="small" label="내 캐릭터" color="success" sx={{ ml: 1, height: 20 }} />
                          )}
                        </Typography>
                        {debugInfo.characterInfo.worldId && (
                          <Typography variant="caption" color="text.secondary">
                            세계관 ID: {debugInfo.characterInfo.worldId}
                          </Typography>
                        )}
                      </Box>

                      {/* 세션 상태 */}
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#ff9800" gutterBottom>
                          세션 상태
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip size="small" variant="outlined" label={`분위기: ${debugInfo.sessionState?.mood || '없음'}`} />
                          <Chip size="small" variant="outlined" label={`관계: Lv.${debugInfo.sessionState?.relationshipLevel || 0}`} />
                          <Chip size="small" variant="outlined" label={`진행도: ${debugInfo.sessionState?.progressCounter || 1}/5`} />
                        </Stack>
                      </Box>

                      {/* 컨텍스트 정보 */}
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#ff9800" gutterBottom>
                          컨텍스트 정보
                        </Typography>
                        <Typography variant="body2">
                          시스템 프롬프트 길이: {debugInfo.context.systemPromptLength}자
                        </Typography>
                        <Typography variant="body2">
                          컨텍스트 메시지: {debugInfo.context.messagesCount}개
                        </Typography>
                        <Typography variant="body2">
                          선택지 포함: {debugInfo.context.includeSuggestions ? '예' : '아니오'}
                        </Typography>
                      </Box>

                      {/* 시스템 프롬프트 미리보기 (크리에이터만) */}
                      {debugInfo.context.fullSystemPrompt && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color="#ff9800" gutterBottom>
                            시스템 프롬프트
                          </Typography>
                          <Box
                            sx={{
                              bgcolor: '#f5f5f5',
                              p: 1.5,
                              borderRadius: 1,
                              maxHeight: 200,
                              overflowY: 'auto',
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}
                          >
                            {debugInfo.context.fullSystemPrompt}
                          </Box>
                        </Box>
                      )}

                      {/* 메모리 요약 */}
                      {debugInfo.memorySummaries?.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color="#ff9800" gutterBottom>
                            최근 메모리 요약 ({debugInfo.memorySummaries.length}개)
                          </Typography>
                          {debugInfo.memorySummaries.map((summary: any, idx: number) => (
                            <Box
                              key={summary.id}
                              sx={{
                                bgcolor: '#f9f9f9',
                                p: 1,
                                borderRadius: 1,
                                mb: 1,
                                borderLeft: '3px solid #ff9800',
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                메시지 {summary.messageRange.startIndex}-{summary.messageRange.endIndex}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {summary.summaryText}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}
              </Collapse>
            </Card>
          )}

          <Card
            sx={{
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.3)',
                borderBottom: '1px solid rgba(255,95,155,0.4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                채팅 내역
              </Typography>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => handleChangeModel('gpt4')}>GPT-4</MenuItem>
                <MenuItem onClick={() => handleChangeModel('claude3')}>Claude 3</MenuItem>
                <MenuItem onClick={() => handleChangeModel('grok')}>Grok</MenuItem>
                <Divider />
                <MenuItem onClick={() => handleDeleteChat()} sx={{ color: 'error.main' }}>
                  채팅 삭제
                </MenuItem>
              </Menu>
            </Box>

            <Box
              sx={{
                p: 3,
                bgcolor: '#fff9fb',
                minHeight: '60vh',
                maxHeight: '60vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {chat.messages.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Typography variant="body2" color="text.secondary">
                    {character.name}과 첫 대화를 시작하세요.
                  </Typography>
                </Box>
              ) : (
                chat.messages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: isUser ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: isUser ? '#ff5f9b' : '#ffe4f5',
                          color: isUser ? '#fff' : '#c3006e',
                        }}
                      >
                        {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                      </Avatar>
                      <Box
                        sx={{
                          maxWidth: '70%',
                          bgcolor: isUser ? '#ff5f9b' : '#fff',
                          color: isUser ? '#fff' : '#000',
                          borderRadius: 1,
                          p: 2,
                          boxShadow: '0 10px 25px rgba(255, 95, 155, 0.2)',
                          mt: 0.5,
                          ml: isUser ? 1 : 2,
                          mr: isUser ? 2 : 1,
                        }}
                      >
                        <Typography variant="body1">{msg.content}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7 }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box
              sx={{
                p: 3,
                bgcolor: '#fff',
                borderTop: '1px solid rgba(255,95,155,0.2)',
              }}
            >
              {/* 추천 응답 버튼들 (스토리 모드에서만) */}
              {suggestedReplies.length > 0 && currentMode === ChatMode.STORY && !isSending && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    추천 응답
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {suggestedReplies.map((suggestion, idx) => (
                      <Chip
                        key={idx}
                        label={suggestion}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        sx={{
                          bgcolor: '#ffe4f5',
                          color: '#c3006e',
                          '&:hover': { bgcolor: '#ffd0ec' },
                          mb: 1,
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  sx={{ borderRadius: 1, bgcolor: '#fff5fb' }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ borderRadius: 1, minWidth: 64 }}
                  onClick={handleSendMessage}
                  disabled={isSending || !message.trim()}
                >
                  {isSending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </Button>
              </Stack>
            </Box>
          </Card>
        </Stack>
      </Container>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </PageLayout>
  );
}
