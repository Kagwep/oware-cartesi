import React, { useState } from 'react';
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
  Text
} from '@chakra-ui/react';
import { Player } from '../utils/types';

const LeaderBoard = () => {
  
  const [players, setPlayers] = useState<Player[]>([])

  return (
    <Box
    bgImage="url('https://res.cloudinary.com/dydj8hnhz/image/upload/v1723626119/vaugem0rdpkd5i92u7qs.webp')"
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
          {players.length > 0 ? (
            players.map((player, index) => (
              <Tr key={index}>
                <Td>{player.player_name}</Td>
                <Td>{player.eth_address}</Td>
                <Td isNumeric>{player.score}</Td>
                <Td>{player.rank_title}</Td>
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
