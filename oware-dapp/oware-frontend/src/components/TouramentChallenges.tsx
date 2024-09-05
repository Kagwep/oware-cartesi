import React, { useState } from 'react';
import { Challenge, Tournament } from '../utils/types';
import { Box, Text, VStack, HStack, Badge, Heading, useColorModeValue, Button, useToast, SimpleGrid, Flex } from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, StarIcon } from '@chakra-ui/icons';
import JoinTournamentFormModal from './forms/JoinTournamentForm';
import { useAccount } from 'wagmi';
import { v4 as uuidv4 } from 'uuid';
import { sendInput, shortenAddress } from '../utils';
import { useWriteInputBoxAddInput } from "../hooks/generated";
import Arena from '../pages/Arena';
import { fetchGraphQLData } from '../utils/api';
import { NOTICES_QUERY } from '../utils/query';
import { useTournaments } from '../hooks/useTournaments';
import AddOpponentTournamentFormModal from './forms/AddOpponentTournamentFormModal';
import TournamentBanner from './TournamentBanner';

interface ListTournamentChallengesProps {
  tournament: Tournament;
  fetchTournaments: () => Promise<void>;
}

const ListTournamentChallenges: React.FC<ListTournamentChallengesProps> = ({ tournament,  fetchTournaments}) => {
  const bgColor = useColorModeValue('gray.900', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { address, isConnected } = useAccount()
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenOne, setIsOpenOne] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const {writeContractAsync} = useWriteInputBoxAddInput()

  const handleJoinClick = (tournamentId: string) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to proceed.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setSelectedTournamentId(tournamentId);
      setIsOpen(true);
    }
  };

  const handleOpponentAddClick= (tournamentId: string) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to proceed.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setSelectedTournamentId(tournamentId);
      setIsOpenOne(true);
    }
  };

  const handleStartGame = (tournamentId: string,challengeId: string, challengeType: number) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to start the game.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } else {
      onStartGame(tournamentId, challengeType,challengeId);
    }
  };

  const onStartGame = async(tournamentId: string, challengeType: number, challengeId: string) => {
    // Logic to start the game (e.g., API call)
    console.log(`Starting game with Challenge ID: ${challengeId} in tournamnet ${tournamentId}`);

    const dataToSend = {
      method: "tournament_chalenge_spawn",
      tournament_id: parseInt(tournamentId, 10),
      challenge_id: parseInt(challengeId, 10),
      challenge_type: challengeType

    };

    const toastId = uuidv4();

    toast({
      id: toastId,
      title: "Starting Tournament",
      description: "Please wait...",
      status: "info",
      duration: null,
      isClosable: true,
    });

   


    try {
      const result = await sendInput(JSON.stringify(dataToSend), writeContractAsync);
      if (result.success) {

        toast.update(toastId, {
          title: "Tournament started",
          description: "Your Tournament started successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

      const response_data = await fetchGraphQLData(NOTICES_QUERY);

      console.log("----->",response_data)

                // Wait for 20 seconds
       await new Promise(resolve => setTimeout(resolve, 5000));

       await fetchTournaments()

        // Additional success handling (e.g., reset form, close modal, etc.)
      } else {
        throw new Error("Failed to start Tournament");
      }
    } catch (error) {
      console.error("Error start Tournament:", error);
      toast.update(toastId, {
        title: "Error",
        description: "Failed to start Tournament. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // Additional error handling if needed
    }
  };

  const isCreator = (creatorAddress: string) => {
    return address && creatorAddress.toLowerCase() === address.toLowerCase();
  };

  const renderMancalaBoard = (state: number[] | null) => {
    if (!state || state.length !== 12) return <Text>Invalid board state</Text>;

    const renderPit = (seeds: number, index: number) => (
      <Box
        key={index}
        borderWidth="1px"
        borderRadius="full"
        width="40px"
        height="40px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.700"
        color="white"
      >
        {seeds}
      </Box>
    );

    return (
      <Flex direction="column" width="100%" maxWidth="300px" margin="auto">
        <Flex justify="space-between">
          {state.slice(6).reverse().map((seeds, index) => renderPit(seeds, index + 6))}
        </Flex>
        <Flex justify="space-between" mt={2}>
          {state.slice(0, 6).map((seeds, index) => renderPit(seeds, index))}
        </Flex>
      </Flex>
    );
  };

  

  const handleGoToArena = (challenge: Challenge,tournament_id: string | null) => {
    setSelectedChallenge(challenge);
    setSelectedTournamentId(tournament_id)
  };

  if (selectedChallenge && selectedTournamentId) {
    
    return <Arena chalengeInfo={selectedChallenge} selectedTournamentId={selectedTournamentId} />;
  }

  return (
    <>
     <TournamentBanner tournament={tournament} />
     <VStack spacing={4} align="stretch" w="full" maxW="800px" mx="auto">
      <Heading size="xl" mb={6} textAlign="center">Challenges</Heading>
      {tournament.challenges ? (
        Object.values(tournament.challenges).map((challenge: Challenge) => (
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

                challenge.challenge_type === 2  || challenge.challenge_type == 3 || challenge.creator[0].toLocaleLowerCase() == address?.toLowerCase() ? (
                  <Button
                  bg="orange.900"
                  size="sm"
                  color={'white'}
                  leftIcon={<StarIcon />}
                  onClick={() =>  handleOpponentAddClick(challenge.challenge_id)}
                  mt={2}
                  mb={2}
                >
                  Add opponent
                </Button>
                ):(
                  <Button
                  bg="purple.600"
                  size="sm"
                  color={'white'}
                  onClick={() => handleJoinClick(challenge.challenge_id)}
                >
                  Join challenge
                </Button>
                )
                  
                

              )}
            </HStack>
            {challenge.challenge_type === 3 && !challenge.in_progress && !challenge.game_ended && challenge.opponent && isCreator(tournament.creator) && (
              <Button
                bg="orange.900"
                size="sm"
                color={'white'}
                leftIcon={<StarIcon />}
                onClick={() => handleStartGame(tournament.tournament_id, challenge.challenge_id, challenge.challenge_type)}
                mt={2}
                mb={2}
              >
                Start Game
              </Button>
            )}

          {challenge.in_progress && (
            <Button
             bg="orange.900"
             size="sm"
              color={'white'}
              onClick={() => handleGoToArena(challenge,tournament.tournament_id)}
              mt={2}
              mb={2}
            >
              Go to Arena
            </Button>
          )}
            <Text mb={2}>Winner: <span className='text-cyan-500'>{challenge.winner?.address || 'N/A'}</span> -  <span className='text-cyan-200'> {challenge.winner?.name}</span></Text>

            {
              challenge.state ? (
                <>
                  {renderMancalaBoard(challenge.state)}
                </>
              ) : (
                 <Text fontSize="sm" color="gray.500">Board State: {challenge.state || 'Not available'}</Text>
              )
            }
            <Text fontSize="sm" color="gray.500" mt={2}>
              Created at: {new Date(challenge.created_at * 1000).toLocaleString()}
            </Text>
          </Box>
        ))
      ) : (
        <Box textAlign="center" p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
          <Text fontSize="lg">No challenges available at the moment.</Text>
        </Box>
      )}
    </VStack>
    </>

  );
};

export default ListTournamentChallenges;