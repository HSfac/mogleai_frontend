'use client';

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
  useColorModeValue,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageLayout from '@/components/PageLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PricingPage() {
  const [tokenPackages, setTokenPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();

  useEffect(() => {
    const fetchTokenPackages = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/payment/token-packages`);
        setTokenPackages(response.data);
      } catch (error) {
        console.error('토큰 패키지를 불러오는데 실패했습니다:', error);
        toast({
          title: '오류 발생',
          description: '토큰 패키지 정보를 불러오는데 실패했습니다.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchTokenPackages();
  }, [toast]);

  const handleBuyTokens = async (packageId) => {
    if (!session) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setIsLoading(true);
    try {
      const selectedPackage = tokenPackages.find(pkg => pkg.id === packageId);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/buy-tokens`,
        {
          amount: selectedPackage.price,
          tokens: selectedPackage.tokens,
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      
      // 결제 페이지로 리디렉션
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error('토큰 구매 요청에 실패했습니다:', error);
      toast({
        title: '구매 요청 실패',
        description: '토큰 구매 요청 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!session) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/subscribe`,
        {
          amount: 9900, // 월 구독 가격
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      
      // 결제 페이지로 리디렉션
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error('구독 요청에 실패했습니다:', error);
      toast({
        title: '구독 요청 실패',
        description: '구독 신청 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <Container maxW="container.xl" py={12}>
        <VStack spacing={2} textAlign="center" mb={12}>
          <Heading as="h1" fontSize="4xl">
            요금제 및 토큰 구매
          </Heading>
          <Text fontSize="lg" color="gray.500">
            몽글AI와 함께 더 많은 대화를 나눠보세요
          </Text>
        </VStack>

        <Box mb={20}>
          <Heading as="h2" size="xl" textAlign="center" mb={10}>
            토큰 패키지
          </Heading>
          <Flex
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
            gap={8}
          >
            {tokenPackages.map((pkg) => (
              <PriceCard
                key={pkg.id}
                title={pkg.name}
                price={pkg.price}
                description={`${pkg.tokens}개의 토큰`}
                features={[
                  '모든 AI 모델 사용 가능',
                  '무제한 캐릭터 생성',
                  '토큰 소진 시까지 사용 가능',
                ]}
                buttonText="구매하기"
                onClick={() => handleBuyTokens(pkg.id)}
                isLoading={isLoading}
              />
            ))}
          </Flex>
        </Box>

        <Box>
          <Heading as="h2" size="xl" textAlign="center" mb={10}>
            월간 구독
          </Heading>
          <Flex justifyContent="center">
            <PriceCard
              title="프리미엄 구독"
              price={9900}
              description="매월 500개의 토큰 제공"
              features={[
                '매월 자동으로 500개의 토큰 충전',
                '모든 AI 모델 사용 가능',
                '무제한 캐릭터 생성',
                '프리미엄 캐릭터 접근 권한',
                '신규 기능 우선 이용',
              ]}
              buttonText="구독하기"
              onClick={handleSubscribe}
              isLoading={isLoading}
              isPopular
            />
          </Flex>
        </Box>
      </Container>
    </PageLayout>
  );
}

function PriceCard({
  title,
  price,
  description,
  features,
  buttonText,
  onClick,
  isLoading,
  isPopular = false,
}) {
  return (
    <Box
      maxW="330px"
      w="full"
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow="2xl"
      rounded="lg"
      overflow="hidden"
      position="relative"
      transform={isPopular ? 'scale(1.05)' : 'scale(1)'}
      zIndex={isPopular ? 1 : 0}
      borderWidth={isPopular ? '2px' : '0'}
      borderColor="brand.500"
    >
      {isPopular && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bg="brand.500"
          color="white"
          px={3}
          py={1}
          fontSize="xs"
          fontWeight="bold"
          borderBottomLeftRadius="md"
        >
          인기
        </Box>
      )}
      <Box p={6}>
        <Stack spacing={0} align="center" mb={5}>
          <Heading size="md" fontWeight={500}>
            {title}
          </Heading>
          <Text color="gray.500">{description}</Text>
        </Stack>
        <Stack align="center" justify="center" mb={8}>
          <Text fontSize="5xl" fontWeight={800}>
            {price.toLocaleString()}원
          </Text>
        </Stack>
        <VStack spacing={4}>
          <List spacing={3} w="full">
            {features.map((feature, index) => (
              <ListItem key={index}>
                <HStack>
                  <ListIcon as={FaCheckCircle} color="brand.500" />
                  <Text>{feature}</Text>
                </HStack>
              </ListItem>
            ))}
          </List>
          <Button
            w="full"
            colorScheme="brand"
            variant={isPopular ? 'solid' : 'outline'}
            onClick={onClick}
            isLoading={isLoading}
          >
            {buttonText}
          </Button>
        </VStack>
      </Box>
    </Box>
  );
} 