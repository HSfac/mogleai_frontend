'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type Banner = {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
};

export default function AdminBannersPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login?redirect=/admin/banners');
      return;
    }
    fetchBanners();
  }, [isAuthenticated, user, loading, router]);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/banners');
      setBanners(response.data || []);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl || '',
        linkUrl: banner.linkUrl || '',
        isActive: banner.isActive,
        order: banner.order,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true,
        order: banners.length,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBanner(null);
  };

  const handleSave = async () => {
    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner._id}`, formData);
      } else {
        await api.post('/banners', formData);
      }
      fetchBanners();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 배너를 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await api.put(`/banners/${banner._id}`, {
        ...banner,
        isActive: !banner.isActive,
      });
      fetchBanners();
    } catch (error) {
      console.error('Failed to toggle banner:', error);
    }
  };

  return (
    <PageLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', p: { xs: 2, md: 4 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#fff' }}>
            배너 관리
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: '#ff3366',
              '&:hover': { bgcolor: '#ff5588' },
            }}
          >
            배너 추가
          </Button>
        </Stack>

        <TableContainer component={Paper} sx={{ bgcolor: '#242424' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>순서</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>제목</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>설명</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>활성</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell sx={{ color: '#fff' }}>{banner.order}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{banner.title}</TableCell>
                  <TableCell sx={{ color: '#999' }}>{banner.description}</TableCell>
                  <TableCell>
                    <Switch
                      checked={banner.isActive}
                      onChange={() => handleToggleActive(banner)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#ff3366',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#ff3366',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenDialog(banner)}
                      sx={{ color: '#ff3366' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(banner._id)}
                      sx={{ color: '#ff3366' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { bgcolor: '#242424', color: '#fff' },
          }}
        >
          <DialogTitle>{editingBanner ? '배너 수정' : '배너 추가'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="제목"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{
                  '& .MuiInputLabel-root': { color: '#999' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                  },
                }}
              />
              <TextField
                label="설명"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{
                  '& .MuiInputLabel-root': { color: '#999' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                  },
                }}
              />
              <TextField
                label="이미지 URL"
                fullWidth
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                sx={{
                  '& .MuiInputLabel-root': { color: '#999' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                  },
                }}
              />
              <TextField
                label="링크 URL"
                fullWidth
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                sx={{
                  '& .MuiInputLabel-root': { color: '#999' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                  },
                }}
              />
              <TextField
                label="순서"
                type="number"
                fullWidth
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                sx={{
                  '& .MuiInputLabel-root': { color: '#999' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#ff3366' },
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ color: '#999' }}>
              취소
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{ bgcolor: '#ff3366', '&:hover': { bgcolor: '#ff5588' } }}
            >
              저장
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageLayout>
  );
}
