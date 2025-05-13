'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    const errorCode = searchParams.get('code');
    const errorMessage = searchParams.get('message');

    if (errorCode || errorMessage) {
      toast({
        title: '결제 실패',
        description: errorMessage || '결제 처리 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [searchParams, toast]);

  return (
    <PageLayout>
      <Container maxW="container.md" py={12}>
        <VStack
          spacing={8}
          align="center"
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="xl"
        >
          <Icon as={FaExclamationTriangle} w={16} h={16} color="red.500" />
          
          <Heading size="xl">결제에 실패했습니다</Heading>
          
          <Text color="gray.600" textAlign="center">
            결제 처리 중 문제가 발생했습니다. 다시 시도하거나 다른 결제 수단을 이용해주세요.
          </Text>
          
          <Box>
            <Text fontWeight="bold" mb={2}>오류 코드:</Text>
            <Text>{searchParams.get('code') || '알 수 없음'}</Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold" mb={2}>오류 메시지:</Text>
            <Text>{searchParams.get('message') || '알 수 없음'}</Text>
          </Box>
          
          <Button colorScheme="brand" onClick={() => router.push('/pricing')}>
            다시 시도하기
          </Button>
        </VStack>
      </Container>
    </PageLayout>
  );
} 