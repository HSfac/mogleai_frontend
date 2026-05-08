'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  TextField,
  Dialog,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface Branch {
  _id?: string;
  label: string;
  branchPointIndex: number;
  messages: any[];
  createdAt?: Date;
}

interface BranchPanelProps {
  branches: Branch[];
  activeBranchIndex: number; // -1 = 메인
  totalMessages: number;
  onCreateBranch: (branchPointIndex: number, label?: string) => Promise<void>;
  onSwitchBranch: (branchIndex: number) => Promise<void>;
  onRenameBranch: (branchIndex: number, label: string) => Promise<void>;
  onDeleteBranch: (branchIndex: number) => Promise<void>;
  accentColor: string;
}

export default function BranchPanel({
  branches,
  activeBranchIndex,
  totalMessages,
  onCreateBranch,
  onSwitchBranch,
  onRenameBranch,
  onDeleteBranch,
  accentColor,
}: BranchPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [branchPoint, setBranchPoint] = useState('');
  const [branchLabel, setBranchLabel] = useState('');
  const [renamingIndex, setRenamingIndex] = useState(-1);
  const [renameValue, setRenameValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const idx = parseInt(branchPoint, 10);
    if (isNaN(idx) || idx < 0 || idx >= totalMessages) return;
    setLoading(true);
    try {
      await onCreateBranch(idx, branchLabel.trim() || undefined);
      setCreateOpen(false);
      setBranchPoint('');
      setBranchLabel('');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameConfirm = async (idx: number) => {
    if (!renameValue.trim()) return;
    await onRenameBranch(idx, renameValue.trim());
    setRenamingIndex(-1);
  };

  return (
    <Box
      sx={{
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 2,
        p: 2,
        mb: 2,
      }}
    >
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountTreeIcon sx={{ fontSize: 16, color: accentColor }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            대화 분기
          </Typography>
        </Box>
        <Tooltip title="새 분기 만들기">
          <IconButton size="small" onClick={() => setCreateOpen(true)} sx={{ color: accentColor, p: 0.4 }}>
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 분기 탭 목록 */}
      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
        {/* 메인 탭 */}
        <Chip
          label="메인"
          size="small"
          onClick={() => onSwitchBranch(-1)}
          sx={{
            bgcolor: activeBranchIndex === -1 ? `${accentColor}30` : 'rgba(255,255,255,0.06)',
            color: activeBranchIndex === -1 ? accentColor : 'rgba(255,255,255,0.6)',
            border: activeBranchIndex === -1 ? `1px solid ${accentColor}60` : '1px solid transparent',
            fontWeight: activeBranchIndex === -1 ? 700 : 400,
            fontSize: 11,
            cursor: 'pointer',
          }}
        />

        {branches.map((branch, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            {renamingIndex === idx ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  size="small"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameConfirm(idx);
                    if (e.key === 'Escape') setRenamingIndex(-1);
                  }}
                  sx={{
                    width: 100,
                    '& .MuiInputBase-input': { color: '#fff', fontSize: 11, py: 0.4, px: 1 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: accentColor },
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                />
                <IconButton size="small" onClick={() => handleRenameConfirm(idx)} sx={{ p: 0.2, color: '#4caf50' }}>
                  <CheckIcon sx={{ fontSize: 13 }} />
                </IconButton>
                <IconButton size="small" onClick={() => setRenamingIndex(-1)} sx={{ p: 0.2, color: 'rgba(255,255,255,0.4)' }}>
                  <CloseIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Box>
            ) : (
              <Chip
                label={branch.label}
                size="small"
                onClick={() => onSwitchBranch(idx)}
                onDelete={() => {}}
                deleteIcon={
                  <Box sx={{ display: 'flex', gap: 0.2, mr: 0.3 }}>
                    <EditIcon
                      sx={{ fontSize: 11, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingIndex(idx);
                        setRenameValue(branch.label);
                      }}
                    />
                    <DeleteIcon
                      sx={{ fontSize: 11, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#f44336' } }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBranch(idx);
                      }}
                    />
                  </Box>
                }
                sx={{
                  bgcolor: activeBranchIndex === idx ? `${accentColor}30` : 'rgba(255,255,255,0.06)',
                  color: activeBranchIndex === idx ? accentColor : 'rgba(255,255,255,0.6)',
                  border: activeBranchIndex === idx ? `1px solid ${accentColor}60` : '1px solid transparent',
                  fontWeight: activeBranchIndex === idx ? 700 : 400,
                  fontSize: 11,
                  cursor: 'pointer',
                  '& .MuiChip-deleteIcon': { color: 'transparent', margin: 0 },
                  '&:hover .MuiChip-deleteIcon': { color: 'inherit' },
                }}
              />
            )}
          </Box>
        ))}
      </Stack>

      {activeBranchIndex >= 0 && branches[activeBranchIndex] && (
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', mt: 1, display: 'block' }}>
          분기점: {branches[activeBranchIndex].branchPointIndex + 1}번째 메시지 이후
        </Typography>
      )}

      {/* 분기 생성 다이얼로그 */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1e1e2e', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', minWidth: 340 } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} color="#fff" sx={{ mb: 2 }}>
            새 분기 만들기
          </Typography>
          <TextField
            fullWidth
            label="분기점 메시지 번호"
            type="number"
            value={branchPoint}
            onChange={(e) => setBranchPoint(e.target.value)}
            helperText={`현재 메시지 ${totalMessages}개 · 해당 메시지 이전까지 공유됩니다`}
            inputProps={{ min: 0, max: totalMessages - 1 }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.35)' },
            }}
          />
          <TextField
            fullWidth
            label="분기 이름 (선택)"
            value={branchLabel}
            onChange={(e) => setBranchLabel(e.target.value)}
            placeholder="예: 다른 선택, 해피엔딩"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setCreateOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={loading || !branchPoint}
              sx={{ bgcolor: accentColor, '&:hover': { bgcolor: accentColor, filter: 'brightness(1.1)' } }}
            >
              만들기
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
