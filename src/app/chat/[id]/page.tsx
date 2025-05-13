'use client';

import {
  Box,
  Container,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Avatar,
  Heading,
  IconButton,
  Divider,
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageLayout from '@/components/PageLayout';
import axios from 'axios';
import { FaPaperPlane, FaEllipsisV, FaRobot, FaUser } from 'react-icons/fa';

export default function ChatPage({ params }) {
  const { id } = params;
  const [chat, setChat] = useState(null);
  const [character, setCharacter] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const userBubbleBg = useColorModeValue('brand.500', 'brand.400');
  const aiBubbleBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    if (!session) {
      router.push('/login?redirect=/chat/' + id);
      return;
    }

    const fetchChat = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chat/${id}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        
        setChat(response.data);
        
        // 캐릭터 정보 가져오기
        const characterResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/characters/${response.data.character}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        
        setCharacter(characterResponse.data);
      } catch (error) {
        console.error('채팅을 불러오는데 실패했습니다:', error);
        toast({
          title: '오류 발생',
          description: '채팅 정보를 불러오는데 실패했습니다.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChat();
  }, [id, session, toast, router]);

  // 메시지 목록이 업데이트될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${id}/messages`,
        { content: message },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      
      setChat(response.data);
      setMessage('');
    } catch (error) {
      console.error('메시지 전송에 실패했습니다:', error);
      toast({
        title: '메시지 전송 실패',
        description: error.response?.data?.message || '메시지를 전송하는데 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChangeAIModel = async (model) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${id}/ai-model`,
        { aiModel: model },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      
      setChat(response.data);
      toast({
        title: 'AI 모델 변경됨',
        description: `AI 모델이 ${model}로 변경되었습니다.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('AI 모델 변경에 실패했습니다:', error);
      toast({
        title: '모델 변경 실패',
        description: 'AI 모델을 변경하는데 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm('정말로 이 채팅을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/chat/${id}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        
        toast({
          title: '채팅 삭제됨',
          description: '채팅이 성공적으로 삭제되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        router.push('/');
      } catch (error) {
        console.error('채팅 삭제에 실패했습니다:', error);
        toast({
          title: '삭제 실패',
          description: '채팅을 삭제하는데 실패했습니다.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <Flex justify="center" align="center" height="70vh">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </PageLayout>
    );
  }

  if (!chat || !character) {
    return (
      <PageLayout>
        <Container maxW="container.md" py={8} textAlign="center">
          <Heading mb={4}>채팅을 찾을 수 없습니다</Heading>
          <Text mb={6}>요청하신 채팅이 존재하지 않거나 접근 권한이 없습니다.</Text>
          <Button colorScheme="brand" onClick={() => router.push('/characters')}>
            캐릭터 탐색하기
          </Button>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxW="container.lg" py={4} px={0}>
        <Flex 
          direction="column" 
          h="calc(100vh - 180px)" 
          bg={bgColor} 
          borderRadius="lg" 
          boxShadow="md"
          overflow="hidden"
        >
          {/* 채팅 헤더 */}
          <Flex 
            p={4} 
            borderBottomWidth={1} 
            borderColor="gray.200" 
            justify="space-between" 
            align="center"
            bg={useColorModeValue('gray.50', 'gray.700')}
          >
            <HStack>
              <Avatar 
                src={character.imageUrl || '/images/default-character.png'} 
                name={character.name} 
              />
              <Box>
                <Heading size="md">{character.name}</Heading>
                <Badge colorScheme="brand">{chat.aiModel}</Badge>
              </Box>
            </HStack>
            
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisV />}
                variant="ghost"
                aria-label="옵션"
              />
              <MenuList>
                <MenuItem onClick={() => router.push(`/characters/${character._id}`)}>
                  캐릭터 정보 보기
                </MenuItem>
                <MenuItem onClick={() => handleChangeAIModel('GPT4')}>
                  GPT-4 모델로 변경
                </MenuItem>
                <MenuItem onClick={() => handleChangeAIModel('CLAUDE3')}>
                  Claude 3 모델로 변경
                </MenuItem>
                <MenuItem onClick={() => handleChangeAIModel('MISTRAL')}>
                  Mistral 모델로 변경
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDeleteChat} color="red.500">
                  채팅 삭제
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
          
          {/* 메시지 목록 */}
          <Box flex="1" overflowY="auto" p={4}>
            <VStack spacing={4} align="stretch">
              {chat.messages.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500">
                    {character.name}에게 첫 메시지를 보내보세요!
                  </Text>
                </Box>
              ) : (
                chat.messages.map((msg, index) => (
                  <Box key={index} alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}>
                    <Flex direction={msg.sender === 'user' ? 'row-reverse' : 'row'} align="start">
                      <Avatar 
                        size="sm" 
                        icon={msg.sender === 'user' ? <FaUser /> : <FaRobot />}
                        bg={msg.sender === 'user' ? 'brand.500' : 'gray.500'}
                        color="white"
                        mr={msg.sender === 'user' ? 0 : 2}
                        ml={msg.sender === 'user' ? 2 : 0}
                      />
                      <Box
                        maxW="70%"
                        bg={msg.sender === 'user' ? userBubbleBg : aiBubbleBg}
                        color={msg.sender === 'user' ? 'white' : 'black'}
                        p={3}
                        borderRadius="lg"
                      >
                        <Text>{msg.content}</Text>
                        <Text fontSize="xs" color={msg.sender === 'user' ? 'whiteAlpha.800' : 'gray.500'} textAlign="right" mt={1}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </VStack>
          </Box>
          
          {/* 메시지 입력 */}
          <Box p={4} borderTopWidth={1} borderColor="gray.200">
            <Flex>
              <Input
                placeholder="메시지를 입력하세요..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                mr={2}
                disabled={isSending}
              />
              <Button
                colorScheme="brand"
                isLoading={isSending}
                onClick={handleSendMessage}
                leftIcon={<FaPaperPlane />}
              >
                전송
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Container>
    </PageLayout>
  );
} 