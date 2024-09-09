import React, { useState } from 'react';
import { Tournament } from '../utils/types';
import { Box, Text, VStack, HStack, Badge, Heading, useColorModeValue, Button, useToast, SimpleGrid, Flex, Tooltip, List } from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, StarIcon, InfoIcon } from '@chakra-ui/icons';
import JoinTournamentFormModal from './forms/JoinTournamentForm';
import { useAccount } from 'wagmi';
import { v4 as uuidv4 } from 'uuid';
import { sendInput } from '../utils';
import { useWriteInputBoxAddInput } from "../hooks/generated";
import Arena from '../pages/Arena';
import { fetchGraphQLData } from '../utils/api';
import { NOTICES_QUERY } from '../utils/query';
import { useTournaments } from '../hooks/useTournaments';
import AddOpponentTournamentFormModal from './forms/AddOpponentTournamentFormModal';
import ListTournamentChallenges from './TouramentChallenges';


interface ListTournamentsProps {
  tournaments: Tournament[];
  onJoinTournament: (data: any) => void;
  fetchTournaments: () => Promise<void>;
  onAddOpponentTournament :  (data: any) => void;
}

const ListTournaments: React.FC<ListTournamentsProps> = ({ tournaments, onJoinTournament, fetchTournaments,onAddOpponentTournament}) => {
  const bgColor = useColorModeValue('gray.900', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { address, isConnected } = useAccount()
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenOne, setIsOpenOne] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

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

  const handleGoToChallenges = (tournament: Tournament) => {
    setSelectedTournament(tournament);
  };


  if (selectedTournament) {
    
    return <ListTournamentChallenges tournament={selectedTournament} fetchTournaments={fetchTournaments} />;
  }


  const isCreator = (creatorAddress: string) => {
    return address && creatorAddress.toLowerCase() === address.toLowerCase();
  };


  return (
    <VStack spacing={4} align="stretch" w="full" maxW="800px" mx="auto">
      <Heading size="xl" mb={6} textAlign="center">Tournaments</Heading>
      {tournaments.length > 0 ? (
        tournaments.map((tournament: Tournament) => (
          <Box
            key={tournament.tournament_id}
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
                Tournament: {tournament.tournament_id}
              </Badge>
              <HStack>
                {tournament.in_progress ? (
                  <Badge colorScheme="green"><TimeIcon mr={1} />In Progress</Badge>
                ) : tournament.ended_at? (
                  <Badge colorScheme="red"><CheckCircleIcon mr={1} />Ended</Badge>
                ) : tournament.players.length == tournament.no_of_players ? (
                  <Badge bg="yellow.600">Ready to Start</Badge>
                ) : (
                  <Badge bg="yellow.600">Waiting for Opponent</Badge>
                )}
              </HStack>
            </HStack>
            <HStack justifyContent="space-between" mb={2}>
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">Creator:</Text>
                <Tooltip label={tournament.creator} placement="bottom">
                  <Text color="cyan.200" isTruncated maxW="150px">
                    {tournament.creator}
                  </Text>
                </Tooltip>
              </VStack>
              <VStack align="end" spacing={1}>
                <Text fontWeight="bold">Players:</Text>
                {tournament.players.length > 0 ? (
                  tournament.players.map((player, index) => (
                    <Tooltip
                      key={index}
                      label={`Address: ${player}${player[1] ? `\nAgent: ${player[2] ? player[2] : 'N/A'}` : ''}`}
                      placement="bottom"
                    >
                      <HStack spacing={1}>
                        <Text color="teal.200" isTruncated maxW="120px">
                          {player[0]}
                        </Text>
                        {player[2] && (
                          <Badge colorScheme="purple" fontSize="xs">
                            AI
                          </Badge>
                        )}
                        <InfoIcon boxSize={3} color="gray.400" />
                      </HStack>
                    </Tooltip>
                  ))
                ) : (
                  <Text color="teal.200">No players</Text>
                )}
              </VStack>
            </HStack>

          {(tournament.players.length !== tournament.no_of_players && tournament.creator.toLocaleLowerCase() == address?.toLowerCase()) ? (
                <Button
                bg="orange.900"
                size="sm"
                color={'white'}
                leftIcon={<StarIcon />}
                onClick={() =>  handleOpponentAddClick(tournament.tournament_id)}
                mt={2}
                mb={2}
              >
                Add opponent
              </Button>
              ):(

                tournament.players.length > 0  && address?.toLowerCase() && tournament.players.some(player => player[1].toLowerCase() === address.toLowerCase()) ? (
                  < Text  className='text-green-500 mb-1'> Contestant </Text>
                ):(
                   tournament.players.length == tournament.no_of_players ? (
                     < Text  className='text-green-500 mb-1'> </Text>
                   )  :  (
                    <Button
                    bg="purple.600"
                    size="sm"
                    color={'white'}
                    onClick={() => handleJoinClick(tournament.tournament_id)}
                  >
                    
                    Join Tournament
                  </Button>
                   )
                )

              )}

          {tournament.in_progress  && (
            <Button
             bg="orange.900"
             size="sm"
              color={'white'}
              onClick={() => handleGoToChallenges(tournament)}
              mt={2}
              mb={2}
            >
              Go to Challenges
            </Button>
          )}
            <Text mb={2}>Winner: <span className='text-cyan-500'>{tournament.winner?.address || 'N/A'}</span> - <span className='text-cyan-200'> {tournament.winner?.name}</span> </Text>

            {/* <Text fontSize="sm" color="gray.500" mt={2}>
              Created at: {new Date(tournament.started_at * 1000).toLocaleString()}
            </Text> */}
            <JoinTournamentFormModal 
              isOpen={isOpen && selectedTournamentId === tournament.tournament_id} 
              onClose={() => setIsOpen(false)} 
              onJoinTournament={onJoinTournament} 
              tournamentId={tournament.tournament_id}
            />
            <AddOpponentTournamentFormModal 
              isOpen={isOpenOne && selectedTournamentId === tournament.tournament_id} 
              onClose={() => setIsOpenOne(false)} 
              onAddOpponentTournament={onAddOpponentTournament} 
              tournamentId={tournament.tournament_id}
            />
          </Box>
        ))
      ) : (
        <Box textAlign="center" p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
          <Text fontSize="lg">No Tournaments available at the moment.</Text>
        </Box>
      )}
    </VStack>
  );
};

export default ListTournaments;