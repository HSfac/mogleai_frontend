'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  Switch,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageLayout from '@/components/PageLayout';
import axios from 'axios';
import { FaCheck, FaTimes, FaEdit, FaTrash, FaUserShield } from 'react-icons/fa';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  const { isOpen: isCharModalOpen, onOpen: onCharModalOpen, onClose: onCharModalClose } = useDisclosure();
  
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();

  useEffect(() => {
    if (!session) {
      router.push('/login?redirect=/admin');
      return;
    }

    // 관리자 권한 확인 (실제로는 백엔드에서 확인해야 함)
    const checkAdmin = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        
        if (!response.data.isAdmin) {
          toast({
            title: '접근 권한 없음',
            description: '관리자만 접근할 수 있는 페이지입니다.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          router.push('/');
        }
      } catch (error) {
        console.error('관리자 권한 확인 실패:', error);
        router.push('/');
      }
    };

    checkAdmin();
    fetchData();
  }, [session, router, toast]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 모든 사용자 가져오기
      const usersResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      setUsers(usersResponse.data);

      // 모든 캐릭터 가져오기
      const charactersResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/characters`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      setCharacters(charactersResponse.data);

      // 모든 결제 내역 가져오기
      const paymentsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/payments`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      setPayments(paymentsResponse.data);
    } catch (error) {
      console.error('관리자 데이터를 불러오는데 실패했습니다:', error);
      toast({
        title: '오류 발생',
        description: '데이터를 불러오는데 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCharacter = async (id, isVerified) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/characters/${id}/verify`,
        { isVerified },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      
      // 데이터 다시 불러오기
      fetchData();
      
      toast({
        title: '캐릭터 상태 변경',
        description: isVerified ? '캐릭터가 승인되었습니다.' : '캐릭터 승인이 취소되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('캐릭터 상태 변경 실패:', error);
      toast({
        title: '오류 발생',
        description: '캐릭터 상태를 변경하는데 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser._id}`,
        selectedUser,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      
      // 데이터 다시 불러오기
      fetchData();
      onUserModalClose();
      
      toast({
        title: '사용자 정보 업데이트',
        description: '사용자 정보가 성공적으로 업데이트되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
      toast({
        title: '오류 발생',
        description: '사용자 정보를 업데이트하는데 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateCharacter = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/characters/${selectedCharacter._id}`,
        selectedCharacter,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      
      // 데이터 다시 불러오기
      fetchData();
      onCharModalClose();
      
      toast({
        title: '캐릭터 정보 업데이트',
        description: '캐릭터 정보가 성공적으로 업데이트되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('캐릭터 정보 업데이트 실패:', error);
      toast({
        title: '오류 발생',
        description: '캐릭터 정보를 업데이트하는데 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      
      // 데이터 다시 불러오기
      fetchData();
      
      toast({
        title: '사용자 삭제',
        description: '사용자가 성공적으로 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      toast({
        title: '오류 발생',
        description: '사용자를 삭제하는데 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteCharacter = async (id) => {
    if (!window.confirm('정말로 이 캐릭터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/characters/${id}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      
      // 데이터 다시 불러오기
      fetchData();
      
      toast({
        title: '캐릭터 삭제',
        description: '캐릭터가 성공적으로 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('캐릭터 삭제 실패:', error);
      toast({
        title: '오류 발생',
        description: '캐릭터를 삭제하는데 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const editUser = (user) => {
    setSelectedUser(user);
    onUserModalOpen();
  };

  const editCharacter = (character) => {
    setSelectedCharacter(character);
    onCharModalOpen();
  };

  return (
    <PageLayout>
      <Container maxW="container.xl" py={8}>
        <HStack mb={8} spacing={4}>
          <Heading as="h1" size="xl">
            관리자 대시보드
          </Heading>
          <Badge colorScheme="red" p={2} fontSize="md">
            <HStack>
              <FaUserShield />
              <Text>관리자 전용</Text>
            </HStack>
          </Badge>
        </HStack>

        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : (
          <Tabs colorScheme="brand" variant="enclosed">
            <TabList>
              <Tab>사용자 관리</Tab>
              <Tab>캐릭터 관리</Tab>
              <Tab>결제 내역</Tab>
            </TabList>

            <TabPanels>
              {/* 사용자 관리 */}
              <TabPanel>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>이메일</Th>
                        <Th>사용자명</Th>
                        <Th>토큰</Th>
                        <Th>크리에이터 레벨</Th>
                        <Th>구독 상태</Th>
                        <Th>관리자</Th>
                        <Th>작업</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map((user) => (
                        <Tr key={user._id}>
                          <Td>{user._id.substring(0, 8)}...</Td>
                          <Td>{user.email}</Td>
                          <Td>{user.username}</Td>
                          <Td>{user.tokens}</Td>
                          <Td>
                            <Badge colorScheme={
                              user.creatorLevel === 'level3' ? 'purple' :
                              user.creatorLevel === 'level2' ? 'blue' : 'green'
                            }>
                              {user.creatorLevel}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={user.isSubscribed ? 'green' : 'gray'}>
                              {user.isSubscribed ? '구독중' : '미구독'}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={user.isAdmin ? 'red' : 'gray'}>
                              {user.isAdmin ? '관리자' : '일반'}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => editUser(user)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <FaTrash />
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              {/* 캐릭터 관리 */}
              <TabPanel>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>이름</Th>
                        <Th>크리에이터</Th>
                        <Th>AI 모델</Th>
                        <Th>공개 여부</Th>
                        <Th>좋아요</Th>
                        <Th>사용 횟수</Th>
                        <Th>승인 상태</Th>
                        <Th>작업</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {characters.map((character) => (
                        <Tr key={character._id}>
                          <Td>{character._id.substring(0, 8)}...</Td>
                          <Td>{character.name}</Td>
                          <Td>{character.creator?.username || '알 수 없음'}</Td>
                          <Td>{character.defaultAIModel}</Td>
                          <Td>
                            <Badge colorScheme={character.isPublic ? 'green' : 'gray'}>
                              {character.isPublic ? '공개' : '비공개'}
                            </Badge>
                          </Td>
                          <Td>{character.likes}</Td>
                          <Td>{character.usageCount}</Td>
                          <Td>
                            <Switch
                              colorScheme="green"
                              isChecked={character.isVerified}
                              onChange={() => handleVerifyCharacter(character._id, !character.isVerified)}
                            />
                          </Td>
                          <Td>
                            <HStack>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => editCharacter(character)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDeleteCharacter(character._id)}
                              >
                                <FaTrash />
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              {/* 결제 내역 */}
              <TabPanel>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>사용자</Th>
                        <Th>금액</Th>
                        <Th>토큰</Th>
                        <Th>결제 유형</Th>
                        <Th>상태</Th>
                        <Th>결제 방법</Th>
                        <Th>결제 일시</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {payments.map((payment) => (
                        <Tr key={payment._id}>
                          <Td>{payment._id.substring(0, 8)}...</Td>
                          <Td>{payment.user?.username || '알 수 없음'}</Td>
                          <Td>{payment.amount.toLocaleString()}원</Td>
                          <Td>{payment.tokens || '-'}</Td>
                          <Td>
                            <Badge colorScheme={payment.type === 'token_purchase' ? 'blue' : 'purple'}>
                              {payment.type === 'token_purchase' ? '토큰 구매' : '구독'}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                payment.status === 'completed' ? 'green' :
                                payment.status === 'pending' ? 'yellow' : 'red'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </Td>
                          <Td>{payment.paymentMethod || '카드'}</Td>
                          <Td>{new Date(payment.createdAt).toLocaleString()}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}

        {/* 사용자 편집 모달 */}
        <Modal isOpen={isUserModalOpen} onClose={onUserModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>사용자 정보 편집</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleUpdateUser}>
              <ModalBody>
                {selectedUser && (
                  <Box>
                    <FormControl mb={4}>
                      <FormLabel>이메일</FormLabel>
                      <Input
                        value={selectedUser.email}
                        onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>사용자명</FormLabel>
                      <Input
                        value={selectedUser.username}
                        onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>토큰</FormLabel>
                      <Input
                        type="number"
                        value={selectedUser.tokens}
                        onChange={(e) => setSelectedUser({...selectedUser, tokens: parseInt(e.target.value)})}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>크리에이터 레벨</FormLabel>
                      <select
                        value={selectedUser.creatorLevel}
                        onChange={(e) => setSelectedUser({...selectedUser, creatorLevel: e.target.value})}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', borderColor: '#E2E8F0' }}
                      >
                        <option value="level1">Level 1</option>
                        <option value="level2">Level 2</option>
                        <option value="level3">Level 3</option>
                      </select>
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>구독 상태</FormLabel>
                      <Switch
                        isChecked={selectedUser.isSubscribed}
                        onChange={(e) => setSelectedUser({...selectedUser, isSubscribed: e.target.checked})}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>관리자 권한</FormLabel>
                      <Switch
                        isChecked={selectedUser.isAdmin}
                        onChange={(e) => setSelectedUser({...selectedUser, isAdmin: e.target.checked})}
                      />
                    </FormControl>
                  </Box>
                )}
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="brand" mr={3} type="submit">
                  저장
                </Button>
                <Button variant="ghost" onClick={onUserModalClose}>취소</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* 캐릭터 편집 모달 */}
        <Modal isOpen={isCharModalOpen} onClose={onCharModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>캐릭터 정보 편집</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleUpdateCharacter}>
              <ModalBody>
                {selectedCharacter && (
                  <Box>
                    <FormControl mb={4}>
                      <FormLabel>이름</FormLabel>
                      <Input
                        value={selectedCharacter.name}
                        onChange={(e) => setSelectedCharacter({...selectedCharacter, name: e.target.value})}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>설명</FormLabel>
                      <Textarea
                        value={selectedCharacter.description}
                        onChange={(e) => setSelectedCharacter({...selectedCharacter, description: e.target.value})}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>성격</FormLabel>
                      <Textarea
                        value={selectedCharacter.personality}
                        onChange={(e) => setSelectedCharacter({...selectedCharacter, personality: e.target.value})}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>말투</FormLabel>
                      <Textarea
                        value={selectedCharacter.speakingStyle}
                        onChange={(e) => setSelectedCharacter({...selectedCharacter, speakingStyle: e.target.value})}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>기본 AI 모델</FormLabel>
                      <select
                        value={selectedCharacter.defaultAIModel}
                        onChange={(e) => setSelectedCharacter({...selectedCharacter, defaultAIModel: e.target.value})}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', borderColor: '#E2E8F0' }}
                      >
                        <option value="gpt4">GPT-4</option>
                        <option value="claude3">Claude 3</option>
                        <option value="mistral">Mistral</option>
                        <option value="custom">Custom</option>
                      </select>
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>공개 여부</FormLabel>
                      <Switch
                        isChecked={selectedCharacter.isPublic}
                        onChange={(e) => setSelectedCharacter({...selectedCharacter, isPublic: e.target.checked})}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>승인 상태</FormLabel>
                      <Switch
                        isChecked={selectedCharacter.isVerified}
                        onChange={(e) => setSelectedCharacter({...selectedCharacter, isVerified: e.target.checked})}
                      />
                    </FormControl>
                  </Box>
                )}
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="brand" mr={3} type="submit">
                  저장
                </Button>
                <Button variant="ghost" onClick={onCharModalClose}>취소</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </Container>
    </PageLayout>
  );
} 