import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Divider,
  SimpleGrid,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { CalendarIcon, TimeIcon, RepeatIcon, StarIcon } from '@chakra-ui/icons';
import { Tournament } from '../utils/types';

interface TournamentBannerProps {
  tournament: Tournament;
}

const TournamentBanner: React.FC<TournamentBannerProps> = ({ tournament}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const getStatusColor = () => {
    if (tournament.game_ended) return 'red.500';
    if (tournament.in_progress) return 'green.500';
    return 'yellow.500';
  };

  const getStatusText = () => {
    if (tournament.game_ended) return 'Ended';
    if (tournament.in_progress) return 'In Progress';
    return 'Waiting for Players';
  };

  const progress = (tournament.players.length / tournament.no_of_players) * 100;

  return (
    <VStack spacing={4} align="stretch" w="full" maxW="900px" mx="auto">
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={bgColor}
        boxShadow="xl"
      >
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <Badge fontSize="md" colorScheme="purple">Tournament ID: {tournament.tournament_id}</Badge>
            <Badge fontSize="md" colorScheme={tournament.game_ended ? 'red' : tournament.in_progress ? 'green' : 'yellow'}>
              {getStatusText()}
            </Badge>
          </HStack>

          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            <VStack align="start">
              <Text fontWeight="bold">Creator</Text>
              <Text isTruncated maxW="200px">{tournament.creator}</Text>
            </VStack>
            <VStack align="start">
              <Text fontWeight="bold">Players</Text>
              <HStack>
                <Text>{tournament.players.length} / {tournament.no_of_players}</Text>
                <Progress value={progress} size="sm" width="100px" colorScheme="blue" />
              </HStack>
            </VStack>
            <VStack align="start">
              <Text fontWeight="bold">Rounds per Challenge</Text>
              <HStack>
                <RepeatIcon />
                <Text>{tournament.rounds_per_challenge}</Text>
              </HStack>
            </VStack>
          </SimpleGrid>

          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            <VStack align="start">
              <Text fontWeight="bold">Started At</Text>
              <HStack>
                <CalendarIcon />
                <Text>{new Date(tournament.started_at * 1000).toLocaleString()}</Text>
              </HStack>
            </VStack>
            <VStack align="start">
              <Text fontWeight="bold">Active Round</Text>
              <HStack>
                <TimeIcon />
                <Text>{tournament.active_round}</Text>
              </HStack>
            </VStack>
            <VStack align="start">
              <Text fontWeight="bold">Winner</Text>
              <HStack>
                <StarIcon color={tournament.winner ? 'yellow.400' : 'gray.400'} />
                <Text>{tournament.winner ? tournament.winner.address : 'Not determined'}</Text>
              </HStack>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Box>

      <Divider />
    </VStack>
  );
};

export default TournamentBanner;