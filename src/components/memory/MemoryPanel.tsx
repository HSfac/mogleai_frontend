'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Collapse,
  FormControlLabel,
  Switch,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import HistoryIcon from '@mui/icons-material/History';
import NoteIcon from '@mui/icons-material/Note';
import { memoryService } from '@/services/memoryService';
import {
  MemorySummary,
  MemoryStats,
  UserNote,
  CreateNoteDto,
  NoteTargetType,
  NoteCategory,
  NoteCategoryLabels,
} from '@/types/memory';

interface MemoryPanelProps {
  chatId: string;
  characterId?: string;
}

export default function MemoryPanel({ chatId, characterId }: MemoryPanelProps) {
  const [tabValue, setTabValue] = useState(0);
  const [summaries, setSummaries] = useState<MemorySummary[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);

  // Note dialog
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [noteForm, setNoteForm] = useState<Partial<CreateNoteDto>>({
    content: '',
    category: NoteCategory.MEMORY,
    includeInContext: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [chatId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summariesData, statsData, notesData] = await Promise.all([
        memoryService.getMemorySummaries(chatId, 10),
        memoryService.getMemoryStats(chatId),
        memoryService.getNotesByChat(chatId),
      ]);
      setSummaries(summariesData);
      setStats(statsData);
      setNotes(notesData);
    } catch (err) {
      console.error('메모리 데이터를 불러오는데 실패했습니다:', err);
      setError('메모리 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNoteDialog = (note?: UserNote) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({
        content: note.content,
        category: note.category,
        includeInContext: note.includeInContext,
      });
    } else {
      setEditingNote(null);
      setNoteForm({
        content: '',
        category: NoteCategory.MEMORY,
        includeInContext: true,
      });
    }
    setNoteDialogOpen(true);
  };

  const handleCloseNoteDialog = () => {
    setNoteDialogOpen(false);
    setEditingNote(null);
  };

  const handleSaveNote = async () => {
    if (!noteForm.content?.trim()) {
      setError('노트 내용을 입력해주세요.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingNote) {
        await memoryService.updateNote(editingNote._id, {
          content: noteForm.content,
          category: noteForm.category,
          includeInContext: noteForm.includeInContext,
        });
      } else {
        await memoryService.createNote({
          targetType: NoteTargetType.SESSION,
          targetId: chatId,
          content: noteForm.content!,
          category: noteForm.category,
          includeInContext: noteForm.includeInContext,
        });
      }
      await loadData();
      handleCloseNoteDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('이 노트를 삭제하시겠습니까?')) return;

    try {
      await memoryService.deleteNote(noteId);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      await memoryService.togglePinNote(noteId);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || '고정 상태 변경에 실패했습니다.');
    }
  };

  const handleToggleContext = async (noteId: string) => {
    try {
      await memoryService.toggleContextNote(noteId);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || '설정 변경에 실패했습니다.');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        sx={{
          mb: 2,
          '& .MuiTab-root': { minWidth: 80 },
          '& .MuiTabs-indicator': { bgcolor: '#ff3366' },
        }}
      >
        <Tab
          icon={<HistoryIcon />}
          label={`요약 (${stats?.summaryCount || 0})`}
          iconPosition="start"
        />
        <Tab
          icon={<NoteIcon />}
          label={`노트 (${notes.length})`}
          iconPosition="start"
        />
      </Tabs>

      {/* Memory Summaries Tab */}
      {tabValue === 0 && (
        <Box>
          {summaries.length === 0 ? (
            <Typography color="text.secondary" variant="body2" textAlign="center" py={4}>
              아직 메모리 요약이 없습니다.
              <br />
              대화가 진행되면 자동으로 요약이 생성됩니다.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {summaries.map((summary) => (
                <Card
                  key={summary._id}
                  sx={{
                    bgcolor: '#f9f9f9',
                    border: '1px solid #eee',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      onClick={() =>
                        setExpandedSummary(
                          expandedSummary === summary._id ? null : summary._id
                        )
                      }
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          메시지 {summary.messageRange.start} - {summary.messageRange.end}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(summary.createdAt)}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        {expandedSummary === summary._id ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </Box>

                    <Collapse in={expandedSummary === summary._id}>
                      <Box mt={2}>
                        <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                          {summary.summaryText}
                        </Typography>

                        {summary.emotionalTone && (
                          <Chip
                            label={`분위기: ${summary.emotionalTone}`}
                            size="small"
                            sx={{ mb: 1, mr: 1 }}
                          />
                        )}

                        {summary.keyEvents.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="caption" fontWeight={600}>
                              주요 이벤트:
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.5}>
                              {summary.keyEvents.map((event, idx) => (
                                <Chip
                                  key={idx}
                                  label={event}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {summary.importantFacts.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="caption" fontWeight={600}>
                              중요 사실:
                            </Typography>
                            <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                              {summary.importantFacts.map((fact, idx) => (
                                <li key={idx}>
                                  <Typography variant="caption">{fact}</Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Notes Tab */}
      {tabValue === 1 && (
        <Box>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleOpenNoteDialog()}
              sx={{ color: '#ff3366' }}
            >
              노트 추가
            </Button>
          </Box>

          {notes.length === 0 ? (
            <Typography color="text.secondary" variant="body2" textAlign="center" py={4}>
              아직 노트가 없습니다.
              <br />
              대화 중 기억해야 할 내용을 메모해보세요.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {notes.map((note) => (
                <Card
                  key={note._id}
                  sx={{
                    bgcolor: note.isPinned ? 'rgba(255,51,102,0.05)' : '#f9f9f9',
                    border: note.isPinned ? '2px solid #ff3366' : '1px solid #eee',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Chip
                            label={NoteCategoryLabels[note.category]}
                            size="small"
                            sx={{
                              bgcolor: '#2a2a2a',
                              color: '#fff',
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                          {note.includeInContext && (
                            <Chip
                              label="AI 포함"
                              size="small"
                              sx={{
                                bgcolor: '#ff3366',
                                color: '#fff',
                                fontSize: '0.65rem',
                                height: 20,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {note.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" mt={1} display="block">
                          {formatDate(note.createdAt)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => handleTogglePin(note._id)}
                          title={note.isPinned ? '고정 해제' : '고정'}
                        >
                          {note.isPinned ? (
                            <PushPinIcon sx={{ fontSize: 18, color: '#ff3366' }} />
                          ) : (
                            <PushPinOutlinedIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenNoteDialog(note)}
                          title="수정"
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNote(note._id)}
                          title="삭제"
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={handleCloseNoteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingNote ? '노트 수정' : '노트 추가'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="내용"
              value={noteForm.content}
              onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              placeholder="기억해야 할 내용을 입력하세요..."
              fullWidth
              multiline
              rows={4}
            />

            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={noteForm.category}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, category: e.target.value as NoteCategory })
                }
                label="카테고리"
              >
                {Object.entries(NoteCategoryLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={noteForm.includeInContext}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, includeInContext: e.target.checked })
                  }
                />
              }
              label="AI 대화에 포함 (캐릭터가 이 내용을 기억합니다)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSaveNote}
            disabled={saving}
            sx={{ bgcolor: '#ff3366', '&:hover': { bgcolor: '#e62958' } }}
          >
            {saving ? '저장 중...' : editingNote ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
