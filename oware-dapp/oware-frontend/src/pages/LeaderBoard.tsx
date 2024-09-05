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
import { Leader } from '../utils/types';

const RankDisplay = ({ rankTitle }: { rankTitle: Leader['rankTitle'] }) => {
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

  if (!rankTitle) return null;

  return (
    <HStack>
      {[...Array(starCount[rankTitle])].map((_, i) => (
        <Icon
          key={i}
          as={StarIcon}
          color={rankColors[rankTitle]}
          w={4}
          h={4}
        />
      ))}
      <Text color={rankColors[rankTitle]} fontWeight="bold">
        {rankTitle}
      </Text>
    </HStack>
  );
};

const LeaderBoard = () => {
  const { leaders, fetchLeaders } = useLeaders();
  const toast = useToast();
  const { address } = useAccount();

  React.useEffect(() => {
    fetchLeaders();
  }, [toast, address, fetchLeaders]);

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
      <TableContainer p="4" boxShadow="lg" m="4" borderRadius="sm" bg="gray.800" color="white" rounded={'10'}>
        <Table variant="simple" size="md">
          <TableCaption placement="top" color="white">
            Top Players
          </TableCaption>
          <Thead>
            <Tr>
              <Th color="white">Player Name</Th>
              <Th color="white">Ethereum Address</Th>
              <Th color="white" isNumeric>
                Score
              </Th>
              <Th color="white">Rank</Th>
            </Tr>
          </Thead>
          <Tbody>
            {leaders.length > 0 ? (
              leaders.map((leader: Leader, index: number) => (
                <Tr key={index}>
                  <Td>{leader.playerName}</Td>
                  <Td>{leader.ethAddress}</Td>
                  <Td isNumeric>{leader.score}</Td>
                  <Td>
                    <RankDisplay rankTitle={leader.rankTitle} />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4}>
                  <Text color="green" textAlign="center" fontSize="lg">
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