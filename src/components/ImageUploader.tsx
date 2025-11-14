'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Image,
  Flex,
  useToast,
  Icon,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { FaUpload, FaImage, FaTrash } from 'react-icons/fa';
import api from '@/lib/api';

interface ImageUploaderProps {
  initialImage?: string;
  onImageUpload: (imageUrl: string) => void;
}

export default function ImageUploader({ initialImage, onImageUpload }: ImageUploaderProps) {
  const [imagePreview, setImagePreview] = useState<string>(initialImage || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // 파일 유효성 검사
    if (!file.type.match('image.*')) {
      toast({
        title: '이미지 파일만 업로드 가능합니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '파일 크기는 5MB 이하여야 합니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 서버에 이미지 업로드
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(
        '/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const imageUrl = response.data.imageUrl;
      onImageUpload(imageUrl);

      toast({
        title: '이미지 업로드 성공',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast({
        title: '이미지 업로드 실패',
        description: '이미지를 업로드하는데 문제가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    onImageUpload('');
  };

  return (
    <FormControl>
      <FormLabel>캐릭터 이미지</FormLabel>
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        borderWidth={2}
        borderRadius="lg"
        borderColor={dragActive ? 'brand.500' : 'gray.200'}
        borderStyle="dashed"
        p={4}
        textAlign="center"
        bg={dragActive ? 'brand.50' : 'transparent'}
        transition="all 0.2s"
      >
        <Input
          type="file"
          accept="image/*"
          onChange={handleChange}
          ref={inputRef}
          display="none"
        />
        
        {isUploading ? (
          <Center p={10}>
            <VStack>
              <Spinner size="xl" color="brand.500" />
              <Text mt={4}>이미지 업로드 중...</Text>
            </VStack>
          </Center>
        ) : imagePreview ? (
          <VStack spacing={4}>
            <Image
              src={imagePreview}
              alt="캐릭터 이미지"
              maxH="200px"
              borderRadius="md"
            />
            <Flex>
              <Button
                leftIcon={<FaUpload />}
                onClick={handleButtonClick}
                colorScheme="brand"
                variant="outline"
                mr={2}
              >
                변경
              </Button>
              <Button
                leftIcon={<FaTrash />}
                onClick={handleRemoveImage}
                colorScheme="red"
                variant="outline"
              >
                삭제
              </Button>
            </Flex>
          </VStack>
        ) : (
          <VStack spacing={4} p={10} cursor="pointer" onClick={handleButtonClick}>
            <Icon as={FaImage} w={12} h={12} color="gray.400" />
            <Text>이미지를 드래그하거나 클릭하여 업로드하세요</Text>
            <Text fontSize="sm" color="gray.500">
              최대 5MB, JPG, PNG, GIF 형식 지원
            </Text>
            <Button leftIcon={<FaUpload />} colorScheme="brand">
              이미지 선택
            </Button>
          </VStack>
        )}
      </Box>
    </FormControl>
  );
} 
