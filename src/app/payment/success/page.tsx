'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  useToast,
  Divider,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageLayout from '@/components/PageLayout';
import axios from 'axios';
import { FaCheckCircle, FaCoins } from 'react-icons/fa';

export default function PaymentSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const toast = useToast();

  useEffect(() => {
    if (!session) {
      router.push('/login?redirect=/payment/success');
      return;
    }

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      toast({
        title: '잘못된 접근',
        description: '결제 정보가 올바르지 않습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/pricing');
      return;
    }

    const confirmPayment = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/confirm`,
          {
            paymentKey,
            orderId,
            amount: parseInt(amount),
          },
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        setPaymentInfo(response.data);
        toast({
          title: '결제 완료',
          description: '결제가 성공적으로 완료되었습니다.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('결제 확인에 실패했습니다:', error);
        toast({
          title: '결제 확인 실패',
          description: error.response?.data?.message || '결제를 확인하는데 실패했습니다.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        router.push('/pricing');
      } finally {
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [session, router, searchParams, toast]);

  return (
    <PageLayout>
      <Container maxW="container.md" py={12}>
        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="brand.500" mb={4} />
            <Text>결제를 확인하고 있습니다...</Text>
          </Box>
        ) : (
          <VStack
            spacing={8}
            align="center"
            bg="white"
            p={8}
            borderRadius="lg"
            boxShadow="xl"
          >
            <Icon as={FaCheckCircle} w={16} h={16} color="green.500" />
            
            <Heading size="xl">결제가 완료되었습니다!</Heading>
            
            <Box w="full">
              <Divider my={4} />
              
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold">주문 번호</Text>
                <Text>{paymentInfo?.orderId}</Text>
              </HStack>
              
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold">결제 금액</Text>
                <Text>{parseInt(paymentInfo?.amount).toLocaleString()}원</Text>
              </HStack>
              
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold">결제 방법</Text>
                <Text>{paymentInfo?.method || '카드 결제'}</Text>
              </HStack>
              
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold">결제 일시</Text>
                <Text>{new Date(paymentInfo?.approvedAt).toLocaleString()}</Text>
              </HStack>
              
              <Divider my={4} />
              
              {paymentInfo?.type === 'token_purchase' && (
                <HStack justify="space-between" mb={4}>
                  <Text fontWeight="bold" fontSize="lg">충전된 토큰</Text>
                  <HStack>
                    <Icon as={FaCoins} color="yellow.500" />
                    <Text fontWeight="bold" fontSize="lg">{paymentInfo?.tokens}개</Text>
                  </HStack>
                </HStack>
              )}
              
              {paymentInfo?.type === 'subscription' && (
                <HStack justify="space-between" mb={4}>
                  <Text fontWeight="bold" fontSize="lg">구독 상태</Text>
                  <Badge colorScheme="green" p={2} borderRadius="md">
                    구독 활성화
                  </Badge>
                </HStack>
              )}
            </Box>
            
            <HStack spacing={4}>
              <Button colorScheme="brand" onClick={() => router.push('/chat')}>
                채팅하러 가기
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                홈으로
              </Button>
            </HStack>
          </VStack>
        )}
      </Container>
    </PageLayout>
  );
} 