'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { characterService } from '@/services/character.service';
import { api } from '@/lib/api';

interface Message {
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface Chat {
  _id: string;
  character: string;
  messages: Message[];
  aiModel: string;
}

interface Character {
  _id: string;
  name: string;
  imageUrl?: string;
  description: string;
  tags?: string[];
}

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

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      api.defaults.baseURL ||
      'http://localhost:5001';
    let aiResponse = '';

    try {
      const response = await fetch(`${apiUrl}/chat/${id}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: userInput }),
      });

      if (!response.ok || !response.body) {
        throw new Error('스트리밍 응답을 받을 수 없습니다.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const segments = buffer.split('\n\n');
        buffer = segments.pop() || '';

        segments.forEach((segment) => {
          const line = segment.trim();
          if (!line.startsWith('data:')) return;
          const payloadRaw = line.replace(/^data:\s*/, '');
          if (!payloadRaw) return;
          try {
            const payload = JSON.parse(payloadRaw);
            if (payload.type === 'chunk') {
              aiResponse += payload.content || '';
              setChat((prev) => {
                if (!prev) return prev;
                const updated = [...prev.messages];
                if (updated.length === 0) return prev;
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: aiResponse,
                  timestamp: new Date(),
                };
                return { ...prev, messages: updated };
              });
            } else if (payload.type === 'done') {
              setIsSending(false);
            } else if (payload.type === 'error') {
              throw new Error(payload.message || '스트리밍 오류');
            }
          } catch (streamErr) {
            console.error('스트림 파싱 오류:', streamErr);
          }
        });
      }

      setIsSending(false);
    } catch (err) {
      console.error(err);
      setError('메시지를 전송하는데 실패했습니다.');
      setIsSending(false);
      // 실패 시 직전으로 롤백
      setChat((prev) => {
        if (!prev) return prev;
        const updated = [...prev.messages];
        // 마지막 AI 버블 제거
        if (updated[updated.length - 1]?.sender === 'ai') {
          updated.pop();
        }
        // 마지막 유저 버블이 방금 추가한 것이라면 제거
        if (updated[updated.length - 1]?.sender === 'user' && updated[updated.length - 1].content === userInput) {
          updated.pop();
        }
        return { ...prev, messages: updated };
      });
    }
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
                <Chip label={`내 메시지 ${messageStats.user}`} variant="outlined" sx={{ borderColor: '#fff', color: '#fff' }} />
                <Chip label={`AI 응답 ${messageStats.ai}`} variant="outlined" sx={{ borderColor: '#fff', color: '#fff' }} />
              </Stack>
            </Stack>
          </Card>

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
