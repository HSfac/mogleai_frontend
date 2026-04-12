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
  Fade,
  Grow,
  keyframes,
} from '@mui/material';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
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
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { characterService } from '@/services/character.service';
import { ChatMode, SessionState } from '@/types/user';
import MemoryPanel from '@/components/memory/MemoryPanel';
import HistoryIcon from '@mui/icons-material/History';
import { useLocaleNavigation } from '@/hooks/useLocaleNavigation';

// 새로운 분위기 시스템 import
import {
  MoodProvider,
  MoodBackground,
  useMood,
  useMoodBubbleStyle,
} from '@/components/chat/MoodSystem';
import { EmotionText } from '@/components/chat/EmotionText';
import { IntimacyGauge } from '@/components/chat/IntimacyGauge';
import { ScenarioCard } from '@/components/chat/ScenarioCard';

// 애니메이션 키프레임
const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const typingDots = keyframes`
  0%, 20% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
`;

// 타이핑 인디케이터 컴포넌트
const TypingIndicator = () => {
  const { theme } = useMood();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        p: 1.5,
        bgcolor: `${theme.accentColor}15`,
        borderRadius: '20px 20px 20px 4px',
        width: 'fit-content',
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: theme.accentColor,
            animation: `${typingDots} 1.4s infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );
};

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
  isAdultContent?: boolean;
}

interface Character {
  _id: string;
  name: string;
  imageUrl?: string;
  profileImage?: string;
  description: string;
  tags?: string[];
  isAdultContent?: boolean;
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

// 메시지 버블 컴포넌트
interface MessageBubbleProps {
  message: Message;
  character: Character;
  isLastInGroup: boolean;
  isSending: boolean;
  isLast: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  character,
  isLastInGroup,
  isSending,
  isLast,
}) => {
  const isUser = message.sender === 'user';
  const bubbleStyle = useMoodBubbleStyle(isUser);
  const { theme } = useMood();

  return (
    <Grow in timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: 1,
          mb: isLastInGroup ? 1.5 : 0.25,
          animation: `${fadeInUp} 0.3s ease-out`,
        }}
      >
        {/* 아바타 */}
        <Box sx={{ width: 36, flexShrink: 0 }}>
          {isLastInGroup && (
            <Avatar
              src={isUser ? undefined : (character.profileImage || character.imageUrl)}
              sx={{
                width: 36,
                height: 36,
                bgcolor: isUser ? theme.accentColor : 'rgba(255,255,255,0.1)',
                color: isUser ? '#fff' : theme.accentColor,
                border: `2px solid ${theme.accentColor}40`,
                boxShadow: `0 2px 12px ${theme.accentColor}30`,
              }}
            >
              {isUser ? <PersonIcon sx={{ fontSize: 18 }} /> : character.name[0]}
            </Avatar>
          )}
        </Box>

        {/* 메시지 버블 */}
        <Box
          sx={{
            maxWidth: { xs: '80%', md: '65%' },
            color: isUser ? '#fff' : '#fff',
            borderRadius: isUser
              ? isLastInGroup ? '20px 20px 4px 20px' : '20px'
              : isLastInGroup ? '20px 20px 20px 4px' : '20px',
            px: 2.5,
            py: 1.5,
            position: 'relative',
            ...bubbleStyle,
          }}
        >
          {message.content ? (
            <>
              {isUser ? (
                <Typography sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {message.content}
                </Typography>
              ) : (
                <EmotionText
                  text={message.content}
                  sx={{ lineHeight: 1.7 }}
                />
              )}
              {isLastInGroup && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: isUser ? 'right' : 'left',
                    opacity: 0.5,
                    mt: 0.5,
                    fontSize: '0.7rem',
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              )}
            </>
          ) : (
            isSending && !isUser && isLast && <TypingIndicator />
          )}
        </Box>
      </Box>
    </Grow>
  );
};

function HeaderMetric({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Box
      sx={{
        px: 1.4,
        py: 1,
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        minWidth: { xs: 'auto', md: 140 },
      }}
    >
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: `${color}24`,
          color,
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.52)', display: 'block', lineHeight: 1.1 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.15 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

// 메인 채팅 컨텐츠 컴포넌트
interface ChatContentProps {
  id: string;
  chat: Chat;
  setChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  character: Character;
}

const ChatContent: React.FC<ChatContentProps> = ({ id, chat, setChat, character }) => {
  const router = useRouter();
  const { getLocalePath } = useLocaleNavigation();
  const { theme, mood, setIntimacyLevel, setExcitementLevel, intimacyLevel, excitementLevel } = useMood();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modeAnchorEl, setModeAnchorEl] = useState<null | HTMLElement>(null);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<{ cancel: () => void } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGauge, setShowGauge] = useState(true);
  const [showScenarioCard, setShowScenarioCard] = useState(false);
  const [scenarioData, setScenarioData] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loadingDebug, setLoadingDebug] = useState(false);

  // 메시지 통계
  const messageStats = useMemo(() => {
    if (!chat) return { user: 0, ai: 0 };
    const userCount = chat.messages.filter((msg) => msg.sender === 'user').length;
    const aiCount = chat.messages.filter((msg) => msg.sender === 'ai').length;
    return { user: userCount, ai: aiCount };
  }, [chat]);

  const deriveGaugeFromSessionState = (state?: SessionState) => {
    if (!state) {
      return { intimacy: 0, excitement: 0 };
    }

    const moodValue = state.mood || '';
    const moodExcitementMap: Record<string, number> = {
      갈등: 68,
      긴장: 62,
      설렘: 56,
      친밀: 74,
      유쾌: 42,
      진지: 36,
      평온: 24,
    };
    const moodIntimacyBonus = moodValue.includes('친밀')
      ? 12
      : moodValue.includes('설렘')
        ? 8
        : 0;

    return {
      intimacy: Math.min(100, state.relationshipLevel * 22 + moodIntimacyBonus),
      excitement: Math.min(
        100,
        (moodExcitementMap[moodValue] ?? 32) + Math.max(0, state.progressCounter - 1) * 6,
      ),
    };
  };

  const getRelationshipLabel = (relationshipLevel?: number) => {
    const labels = ['낯섦', '관심', '친해짐', '가까움', '친밀', '깊은 유대'];
    return labels[Math.max(0, Math.min(relationshipLevel ?? 0, 5))];
  };

  // 메시지에서 분위기 분석
  const analyzeMessageMood = (content: string) => {
    const lowerContent = content.toLowerCase();

    // 키워드 기반 분석 (실제로는 AI가 반환하는 메타데이터를 사용)
    const intimateKeywords = ['사랑', '좋아', '키스', '안아', '가슴', '뜨거', '달콤', '설레'];
    const excitingKeywords = ['아', '으', '하', '음', '응', '...', '!', '떨려', '두근'];

    let intimacyBoost = 0;
    let excitementBoost = 0;

    intimateKeywords.forEach(keyword => {
      if (content.includes(keyword)) intimacyBoost += 5;
    });

    excitingKeywords.forEach(keyword => {
      if (content.includes(keyword)) excitementBoost += 3;
    });

    // 특수 패턴
    if (content.includes('*') && content.includes('*')) excitementBoost += 5;
    if ((content.match(/\.\.\./g) || []).length > 2) excitementBoost += 8;
    if ((content.match(/!/g) || []).length > 1) excitementBoost += 5;

    return { intimacyBoost, excitementBoost };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  useEffect(() => {
    return () => {
      streamRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!chat?.sessionState) {
      return;
    }

    const nextGauge = deriveGaugeFromSessionState(chat.sessionState);
    setIntimacyLevel(nextGauge.intimacy);
    setExcitementLevel(nextGauge.excitement);
  }, [chat?.sessionState, setExcitementLevel, setIntimacyLevel]);

  // 시나리오 카드 트리거 (특정 조건에서)
  useEffect(() => {
    if (intimacyLevel >= 50 && excitementLevel >= 50 && !showScenarioCard) {
      // 처음으로 50%를 넘었을 때 시나리오 카드 표시
      const shouldShowCard = Math.random() > 0.7; // 30% 확률
      if (shouldShowCard && chat.messages.length > 10) {
        setScenarioData({
          title: '🌙 분위기가 무르익어가고...',
          description: `${character.name}의 눈빛이 달라졌다.\n무언가 말하고 싶은 듯 입술을 달싹인다.`,
        });
        setShowScenarioCard(true);
      }
    }
  }, [intimacyLevel, excitementLevel]);

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
      prev ? { ...prev, messages: [...prev.messages, userBubble, aiBubble] } : prev
    );

    // 유저 메시지 분석해서 게이지 업데이트
    const { intimacyBoost, excitementBoost } = analyzeMessageMood(userInput);
    setIntimacyLevel(Math.min(100, intimacyLevel + intimacyBoost));
    setExcitementLevel(Math.min(100, excitementLevel + excitementBoost));

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
      onDone: (payload?: {
        reply?: string;
        suggestedReplies?: string[];
        state?: SessionState;
      }) => {
        const finalReply = payload?.reply || fullResponse;

        // AI 응답 분석해서 게이지 업데이트
        const { intimacyBoost, excitementBoost } = analyzeMessageMood(finalReply);
        setIntimacyLevel(Math.min(100, intimacyLevel + intimacyBoost * 1.5));
        setExcitementLevel(Math.min(100, excitementLevel + excitementBoost * 1.5));
        setChat((prev) => {
          if (!prev) return prev;

          const updated = [...prev.messages];
          if (updated.length > 0 && updated[updated.length - 1]?.sender === 'ai') {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: finalReply,
              timestamp: new Date(),
              suggestedReplies:
                payload?.suggestedReplies && payload.suggestedReplies.length > 0
                  ? payload.suggestedReplies
                  : updated[updated.length - 1].suggestedReplies,
            };
          }

          return {
            ...prev,
            messages: updated,
            sessionState: payload?.state ?? prev.sessionState,
          };
        });

        setIsSending(false);
      },
      onError: (err) => {
        console.error(err);
        setError('메시지를 전송하는데 실패했습니다.');
        setIsSending(false);
        setChat((prev) => {
          if (!prev) return prev;
          const updated = [...prev.messages];
          if (updated[updated.length - 1]?.sender === 'ai') updated.pop();
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
      setError('AI 모델 변경에 실패했습니다.');
    }
  };

  const handleDeleteChat = async () => {
    if (!confirm('정말로 이 채팅을 삭제하시겠습니까?')) return;
    setAnchorEl(null);
    try {
      await chatService.deleteChat(id);
      router.push(getLocalePath('/'));
    } catch (deleteError: any) {
      setError('채팅 삭제에 실패했습니다.');
    }
  };

  const handleChangeMode = async (mode: ChatMode) => {
    setModeAnchorEl(null);
    try {
      const updatedChat = await chatService.changeMode(id, mode);
      setChat(updatedChat);
      setToast({ message: `모드가 변경되었습니다.`, severity: 'success' });
    } catch (changeModeError: any) {
      setError('모드 변경에 실패했습니다.');
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  const currentMode = chat?.mode || ChatMode.CHAT;
  const currentModeConfig = MODE_CONFIG[currentMode];
  const ModeIcon = currentModeConfig?.icon || ChatBubbleOutlineIcon;
  const lastAiMessage = chat?.messages.filter((m) => m.sender === 'ai').slice(-1)[0];
  const suggestedReplies = lastAiMessage?.suggestedReplies || [];
  const chemistryScore = Math.round((intimacyLevel + excitementLevel) / 2);
  const currentScene = chat.sessionState?.scene?.trim() || '장면 미설정';
  const relationshipLabel = getRelationshipLabel(chat.sessionState?.relationshipLevel);
  const quickOpeners = useMemo(
    () => [
      `${character.name}, 오늘은 어떤 기분이야?`,
      `우리 지금 분위기 어때?`,
      `네가 먼저 하고 싶은 이야기를 들려줘.`,
    ],
    [character.name],
  );

  return (
    <MoodBackground>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: isFullscreen ? 0 : 2,
          pb: 2,
        }}
      >
        <Container maxWidth={isFullscreen ? false : 'lg'} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 상단 컨트롤 바 */}
          {!isFullscreen && (
            <Box
              sx={{
                mb: 2,
                p: { xs: 2, md: 2.4 },
                borderRadius: 5,
                border: `1px solid ${theme.accentColor}24`,
                background:
                  'linear-gradient(180deg, rgba(9,12,22,0.82), rgba(9,12,22,0.68))',
                backdropFilter: 'blur(18px)',
                boxShadow: '0 24px 60px rgba(2,6,23,0.26)',
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  spacing={2}
                >
                  <Stack direction="row" alignItems="center" gap={2}>
                    <Avatar
                      src={character.profileImage || character.imageUrl}
                      sx={{
                        width: 60,
                        height: 60,
                        border: `2px solid ${theme.accentColor}`,
                        boxShadow: `0 0 26px ${theme.accentColor}36`,
                      }}
                    >
                      {character.name[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.7 }}>
                        <Chip
                          size="small"
                          icon={<ModeIcon sx={{ fontSize: 14, color: `${currentModeConfig?.color} !important` }} />}
                          label={currentModeConfig?.label}
                          onClick={(e) => setModeAnchorEl(e.currentTarget)}
                          sx={{
                            bgcolor: `${currentModeConfig?.color}24`,
                            color: currentModeConfig?.color,
                            cursor: 'pointer',
                            height: 26,
                            border: `1px solid ${currentModeConfig?.color}35`,
                          }}
                        />
                        <Chip
                          size="small"
                          icon={<SmartToyIcon sx={{ fontSize: 14 }} />}
                          label={chat.aiModel}
                          sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff', height: 26 }}
                        />
                        {character.isAdultContent && (
                          <Chip
                            size="small"
                            label="성인 모드"
                            sx={{ bgcolor: 'rgba(255,95,155,0.15)', color: '#ff9ec2', height: 26 }}
                          />
                        )}
                      </Stack>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.1 }}>
                        {character.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.66)',
                          mt: 0.8,
                          maxWidth: 540,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {character.description}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" gap={1}>
                    <IconButton
                      onClick={() => setShowGauge(!showGauge)}
                      sx={{
                        color: showGauge ? theme.accentColor : 'rgba(255,255,255,0.5)',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <LocalFireDepartmentIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      sx={{
                        color: 'rgba(255,255,255,0.76)',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                    <IconButton
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      sx={{
                        color: 'rgba(255,255,255,0.76)',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', md: 'center' }}>
                  <HeaderMetric
                    icon={<FavoriteIcon sx={{ fontSize: 16 }} />}
                    label="친밀도"
                    value={`${intimacyLevel}%`}
                    color={theme.accentColor}
                  />
                  <HeaderMetric
                    icon={<LocalFireDepartmentIcon sx={{ fontSize: 16 }} />}
                    label="흥분도"
                    value={`${excitementLevel}%`}
                    color="#ffb45f"
                  />
                  <HeaderMetric
                    icon={<MoodIcon sx={{ fontSize: 16 }} />}
                    label="분위기"
                    value={chat.sessionState?.mood || (mood === 'romantic' ? 'Romantic' : mood)}
                    color="#7cc7ff"
                  />
                  <HeaderMetric
                    icon={<PersonIcon sx={{ fontSize: 16 }} />}
                    label="관계"
                    value={`${relationshipLabel} · Lv.${chat.sessionState?.relationshipLevel ?? 0}`}
                    color="#ffd166"
                  />
                  <HeaderMetric
                    icon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                    label="메시지"
                    value={`${messageStats.user + messageStats.ai}`}
                    color="rgba(255,255,255,0.9)"
                  />
                </Stack>

                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)' }}>
                      {currentModeConfig?.description} · 캐릭터 컨텍스트와 현재 텐션이 상단에 항상 보이도록 정리했습니다.
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                      분위기 점수 {chemistryScore} / 100
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={chemistryScore}
                    sx={{
                      mt: 1.2,
                      height: 8,
                      borderRadius: '12px',
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: '12px',
                        background: `linear-gradient(90deg, ${theme.accentColor} 0%, #ffbf6b 100%)`,
                      },
                    }}
                  />
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.5}
                    sx={{ mt: 1.3, color: 'rgba(255,255,255,0.58)' }}
                  >
                    <Typography variant="caption">
                      현재 장면 · {currentScene}
                    </Typography>
                    <Typography variant="caption">
                      세션 진행 · {chat.sessionState?.progressCounter ?? 1}/5
                    </Typography>
                    {chat.sessionState?.lastSceneSummary ? (
                      <Typography
                        variant="caption"
                        sx={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 1,
                          overflow: 'hidden',
                        }}
                      >
                        최근 흐름 · {chat.sessionState.lastSceneSummary}
                      </Typography>
                    ) : null}
                    {chat.sessionState?.currentObjective ? (
                      <Typography
                        variant="caption"
                        sx={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 1,
                          overflow: 'hidden',
                        }}
                      >
                        현재 목표 · {chat.sessionState.currentObjective}
                      </Typography>
                    ) : null}
                  </Stack>
                  {chat.sessionState?.activeFlags && chat.sessionState.activeFlags.length > 0 ? (
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.2 }}>
                      {chat.sessionState.activeFlags.slice(0, 3).map((flag) => (
                        <Chip
                          key={flag}
                          label={flag}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.78)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        />
                      ))}
                    </Stack>
                  ) : null}
                </Box>

                {character.tags && character.tags.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {character.tags.slice(0, 5).map((tag) => (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.04)',
                          color: 'rgba(255,255,255,0.74)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Box>
          )}

          {/* 모드 메뉴 */}
          <Menu anchorEl={modeAnchorEl} open={Boolean(modeAnchorEl)} onClose={() => setModeAnchorEl(null)}>
            {Object.entries(MODE_CONFIG).map(([mode, config]) => {
              const Icon = config.icon;
              return (
                <MenuItem key={mode} onClick={() => handleChangeMode(mode as ChatMode)} selected={currentMode === mode}>
                  <Icon sx={{ mr: 1.5, color: config.color }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{config.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{config.description}</Typography>
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>

          {/* 더보기 메뉴 */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => handleChangeModel('gpt4')}>
              <SmartToyIcon sx={{ mr: 1.5, color: '#10a37f' }} /> GPT-4
            </MenuItem>
            <MenuItem onClick={() => handleChangeModel('claude3')}>
              <SmartToyIcon sx={{ mr: 1.5, color: '#d97706' }} /> Claude 3
            </MenuItem>
            <MenuItem onClick={() => handleChangeModel('grok')}>
              <SmartToyIcon sx={{ mr: 1.5, color: '#1d9bf0' }} /> Grok
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setShowMemoryPanel(!showMemoryPanel)}>
              <HistoryIcon sx={{ mr: 1.5 }} /> 메모리 패널
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleDeleteChat} sx={{ color: 'error.main' }}>
              채팅 삭제
            </MenuItem>
          </Menu>

          {/* 상태 게이지 */}
          <Collapse in={showGauge && !isFullscreen}>
            <Box sx={{ mb: 2 }}>
              <IntimacyGauge compact={false} showMood />
            </Box>
          </Collapse>

          {/* 메모리 패널 */}
          <Collapse in={showMemoryPanel}>
            <Box
              sx={{
                mb: 2,
                bgcolor: 'rgba(6,10,20,0.46)',
                borderRadius: 4,
                p: 2,
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 18px 36px rgba(2,6,23,0.2)',
              }}
            >
              <MemoryPanel chatId={id} characterId={chat.character} />
            </Box>
          </Collapse>

          {/* 메시지 영역 */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: { xs: 0.4, md: 1.2 },
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              minHeight: isFullscreen ? 'calc(100vh - 120px)' : '50vh',
              maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '60vh',
              borderRadius: 5,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'linear-gradient(180deg, rgba(9,12,22,0.52), rgba(9,12,22,0.28))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: `${theme.accentColor}50`, borderRadius: 3 },
            }}
          >
            {chat.messages.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  py: 8,
                }}
              >
                <Avatar
                  src={character.profileImage || character.imageUrl}
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    border: `3px solid ${theme.accentColor}`,
                    boxShadow: `0 0 30px ${theme.accentColor}50`,
                  }}
                >
                  {character.name[0]}
                </Avatar>
                <Typography variant="h5" fontWeight={600} sx={{ color: '#fff', mb: 1 }}>
                  {character.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 300 }}>
                  대화를 시작해보세요. 아래 추천 오프너를 누르면 바로 입력창에 들어갑니다.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center" sx={{ mt: 2.5, maxWidth: 560 }}>
                  {quickOpeners.map((opener) => (
                    <Chip
                      key={opener}
                      label={opener}
                      onClick={() => setMessage(opener)}
                      sx={{
                        bgcolor: `${theme.accentColor}14`,
                        color: '#fff',
                        border: `1px solid ${theme.accentColor}30`,
                        px: 0.6,
                        '&:hover': {
                          bgcolor: `${theme.accentColor}22`,
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            ) : (
              chat.messages.map((msg, index) => {
                const isLastInGroup = index === chat.messages.length - 1 || chat.messages[index + 1]?.sender !== msg.sender;
                return (
                  <MessageBubble
                    key={index}
                    message={msg}
                    character={character}
                    isLastInGroup={isLastInGroup}
                    isSending={isSending}
                    isLast={index === chat.messages.length - 1}
                  />
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* 추천 응답 */}
          {suggestedReplies.length > 0 && currentMode === ChatMode.STORY && !isSending && (
            <Box sx={{ mb: 2, px: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <AutoAwesomeIcon sx={{ fontSize: 16, color: theme.accentColor }} />
                <Typography variant="caption" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  추천 응답
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {suggestedReplies.map((suggestion, idx) => (
                  <Chip
                    key={idx}
                    label={suggestion}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    sx={{
                      bgcolor: `${theme.accentColor}20`,
                      color: theme.accentColor,
                      border: `1px solid ${theme.accentColor}40`,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: `${theme.accentColor}30`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${theme.accentColor}30`,
                      },
                      mb: 1,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* 입력 영역 */}
          <Box
            sx={{
              p: 2,
              mt: 1.5,
              borderRadius: 5,
              bgcolor: 'rgba(6,10,20,0.62)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.accentColor}28`,
              boxShadow: '0 26px 44px rgba(2,6,23,0.3)',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1} sx={{ mb: 1.4 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.64)' }}>
                {character.name}의 톤을 유지하면서 자연스럽게 이어서 대화하세요.
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.48)' }}>
                Enter 전송 · Shift+Enter 줄바꿈
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`${character.name}에게 메시지...`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    '& fieldset': { borderColor: `${theme.accentColor}30` },
                    '&:hover fieldset': { borderColor: `${theme.accentColor}50` },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.accentColor,
                      boxShadow: `0 0 0 3px ${theme.accentColor}20`,
                    },
                  },
                  '& .MuiInputBase-input': {
                    py: 1.5,
                    px: 2,
                    '&::placeholder': { color: 'rgba(255,255,255,0.4)' },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
                sx={{
                  minWidth: 56,
                  height: 56,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.accentColor} 0%, ${theme.accentColor}cc 100%)`,
                  boxShadow: `0 4px 20px ${theme.accentColor}50`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 25px ${theme.accentColor}60`,
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.1)',
                    boxShadow: 'none',
                  },
                }}
              >
                {isSending ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : <SendIcon />}
              </Button>
            </Stack>
            <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 1.3 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.42)' }}>
                추천 응답은 스토리 모드에서 마지막 AI 메시지 아래 표시됩니다.
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.42)' }}>
                {message.length}/4000
              </Typography>
            </Stack>
          </Box>
        </Container>

        {/* 시나리오 카드 */}
        {scenarioData && (
          <ScenarioCard
            open={showScenarioCard}
            onClose={() => setShowScenarioCard(false)}
            title={scenarioData.title}
            description={scenarioData.description}
            choices={[
              { label: '다가간다', action: () => setExcitementLevel(Math.min(100, excitementLevel + 15)) },
              { label: '기다린다', action: () => setIntimacyLevel(Math.min(100, intimacyLevel + 10)), variant: 'secondary' },
            ]}
          />
        )}

        {/* 토스트 */}
        <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
        </Snackbar>
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </Box>
    </MoodBackground>
  );
};

// 메인 페이지 컴포넌트
export default function ChatPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { getLocalePath } = useLocaleNavigation();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal('채팅을 이용하려면 로그인이 필요해요', getLocalePath(`/chat/${id}`));
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const chatData = await chatService.getChat(id);
        setChat(chatData);
        const characterData = await characterService.getCharacter(chatData.character);
        setCharacter(characterData);
      } catch (err: any) {
        console.error(err);
        setError('채팅 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getLocalePath, id, isAuthenticated, router, openLoginModal]);

  if (isLoading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
          <CircularProgress sx={{ color: '#ff5f9b' }} />
        </Box>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 4, bgcolor: '#1a1a2e' }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
              로그인이 필요합니다
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 2 }}>
              채팅을 이용하려면 로그인이 필요해요.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3, bgcolor: '#ff5f9b' }}
              onClick={() => openLoginModal('채팅을 이용하려면 로그인이 필요해요', getLocalePath(`/chat/${id}`))}
            >
              로그인하기
            </Button>
          </Card>
        </Container>
      </PageLayout>
    );
  }

  if (!chat || !character) {
    return (
      <PageLayout>
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 4, bgcolor: '#1a1a2e' }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
              채팅을 찾을 수 없습니다
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 2 }}>
              요청하신 채팅이 없거나 접근 권한이 없습니다.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3, bgcolor: '#ff5f9b' }}
              onClick={() => router.push(getLocalePath('/characters'))}
            >
              캐릭터 탐색하기
            </Button>
          </Card>
        </Container>
      </PageLayout>
    );
  }

  // 성인 콘텐츠인 경우 MoodProvider로 감싸서 분위기 시스템 활성화
  const isAdultMode = character.isAdultContent || chat.isAdultContent;

  return (
    <PageLayout hideBottomNav>
      <MoodProvider initialMood={isAdultMode ? 'romantic' : 'normal'}>
        <ChatContent id={id} chat={chat} setChat={setChat} character={character} />
      </MoodProvider>
    </PageLayout>
  );
}
