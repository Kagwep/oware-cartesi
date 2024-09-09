import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Heading,
  Text,
  useToast,
  HStack,
  Icon
} from '@chakra-ui/react';
import { useLeaders } from '../hooks/useLeaderBoard';
import { useAccount } from 'wagmi';
import { StarIcon } from '@chakra-ui/icons';
import { Profile } from '../utils/types';

const RankDisplay = ({ rank_title }: { rank_title: Profile['rank_title'] }) => {
  const rankColors = {
    Beginner: 'gray',
    Intermediate: 'green',
    Advanced: 'blue',
    Expert: 'purple',
    Legend: 'gold'
  };

  const starCount = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4,
    Legend: 5
  };

  if (!rank_title) return null;

  return (
    <HStack>
      {[...Array(starCount[rank_title as keyof typeof starCount])].map((_, i) => (
        <Icon
          key={i}
          as={StarIcon}
          color={rankColors[rank_title as keyof typeof rankColors]}
          w={4}
          h={4}
        />
      ))}
      <Text color={rankColors[rank_title as keyof typeof rankColors]} fontWeight="bold">
        {rank_title}
      </Text>
    </HStack>
  );
};

const LeaderBoard = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { leaders, isLoading, error, refetchLeaders } = useLeaders();

  if (isLoading) return <div>Loading leaderboard...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <Box
      // bgImage="url('https://res.cloudinary.com/dydj8hnhz/image/upload/v1723626119/vaugem0rdpkd5i92u7qs.webp')"
      bgSize="cover"
      bgPosition="center"
      p={8}
      borderRadius="lg"
      boxShadow="lg"
    >
      <Heading mb={6} color="orange.800" textAlign="center" fontSize="2xl">
        Leaderboard
      </Heading>
      <TableContainer
      p="4"
      boxShadow="dark-lg"
      m="4"
      borderRadius="md"
      bg="gray.900"
      color="gray.100"
    >
      <Table variant="simple" size="md">
        <TableCaption 
          placement="top" 
          color="cyan.300" 
          fontWeight="bold" 
          fontSize="xl"
        >
          Top Players
        </TableCaption>
        <Thead>
          <Tr>
            <Th color="cyan.300">Player Name</Th>
            <Th color="cyan.300">Ethereum Address</Th>
            <Th color="cyan.300" isNumeric>Score</Th>
            <Th color="cyan.300">Rank</Th>
          </Tr>
        </Thead>
        <Tbody>
          {leaders.length > 0 ? (
            leaders.map((leader: Profile, index) => (
              <Tr key={index} _hover={{ bg: 'gray.800' }}>
                <Td>{leader.player_name}</Td>
                <Td color="purple.300">{leader.eth_address}</Td>
                <Td isNumeric color="green.300">{leader.score}</Td>
                <Td>
                  <RankDisplay rank_title={leader.rank_title} />
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={4}>
                <Text color="yellow.300" textAlign="center" fontSize="lg">
                  No players available
                </Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
    </Box>
  );
};

export default LeaderBoard;