import React, { useState } from 'react';
import { Challenge } from '../utils/types';
import { Box, Text, VStack, HStack, Badge, Heading, useColorModeValue, Button, useToast } from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, StarIcon } from '@chakra-ui/icons';
import JoinChallengeFormModal from './forms/JoinChallengeForm';
import { useAccount } from 'wagmi';

interface ListChallengesProps {
  challenges: Challenge[];
  onJoinChallenge: (data: any) => void;
}

const ListChallenges: React.FC<ListChallengesProps> = ({ challenges, onJoinChallenge}) => {
  const bgColor = useColorModeValue('gray.900', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { address, isConnected } = useAccount()
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);



  const handleJoinClick = (challengeId: string) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to proceed.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setSelectedChallengeId(challengeId);
      setIsOpen(true);
    }
  };

  const handleStartGame = (challengeId: string) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to start the game.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } else {
      onStartGame(challengeId);
    }
  };

  const onStartGame = (challengeId: string) => {
    // Logic to start the game (e.g., API call)
    console.log(`Starting game with challenge ID: ${challengeId}`);
  };

  const isCreator = (creatorAddress: string) => {
    return address && creatorAddress.toLowerCase() === address.toLowerCase();
  };

  return (
    <VStack spacing={4} align="stretch" w="full" maxW="800px" mx="auto">
      <Heading size="xl" mb={6} textAlign="center">Challenges</Heading>
      {challenges.length > 0 ? (
        challenges.map((challenge: Challenge) => (
          <Box
            key={challenge.challenge_id}
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            bg={bgColor}
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          >
            <HStack justifyContent="space-between" mb={3}>
              <Badge bg="green.500" fontSize="0.8em" p={1} rounded={'5'}>
                Challenge: {challenge.challenge_id}
              </Badge>
              <HStack>
                {challenge.in_progress ? (
                  <Badge colorScheme="green"><TimeIcon mr={1} />In Progress</Badge>
                ) : challenge.game_ended ? (
                  <Badge colorScheme="red"><CheckCircleIcon mr={1} />Ended</Badge>
                ) : challenge.opponent ? (
                  <Badge bg="yellow.600">Ready to Start</Badge>
                ) : (
                  <Badge bg="yellow.600">Waiting for Opponent</Badge>
                )}
              </HStack>
            </HStack>
            <HStack justifyContent="space-between" mb={2}>
              <Text fontWeight="bold">Creator: <span className='text-cyan-200'>{challenge.creator[0]}</span></Text>
              {challenge.opponent ? (
                <Text fontWeight="bold">Opponent: <span className='text-teal-200'>{challenge.opponent[0]}</span></Text>
              ) : (
                <Button
                  bg="purple.600"
                  size="sm"
                  color={'white'}
                  onClick={() => handleJoinClick(challenge.challenge_id)}
                >
                  Join Challenge
                </Button>
              )}
            </HStack>
            {!challenge.in_progress && !challenge.game_ended && challenge.opponent && isCreator(challenge.creator[1]) && (
              <Button
                bg="orange.900"
                size="sm"
                color={'white'}
                leftIcon={<StarIcon />}
                onClick={() => handleStartGame(challenge.challenge_id)}
                mt={2}
                mb={2}
              >
                Start Game
              </Button>
            )}
            <Text mb={2}>Winner: <span className='text-cyan-500'>{challenge.winner || 'N/A'}</span></Text>
            <Text fontSize="sm" color="gray.500">Board State: {challenge.state || 'Not available'}</Text>
            <JoinChallengeFormModal 
              isOpen={isOpen && selectedChallengeId === challenge.challenge_id} 
              onClose={() => setIsOpen(false)} 
              onJoinChallenge={onJoinChallenge} 
              challengeId={challenge.challenge_id}
            />
          </Box>
        ))
      ) : (
        <Box textAlign="center" p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
          <Text fontSize="lg">No challenges available at the moment.</Text>
        </Box>
      )}
    </VStack>
  );
};

export default ListChallenges;