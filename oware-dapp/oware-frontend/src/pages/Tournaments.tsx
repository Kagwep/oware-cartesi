'use client'

import React, { useEffect, useState } from 'react';
import {
  Stack,
  Text,
  Button,
  Box,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { FcLock } from 'react-icons/fc';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // Simulating fetch request to the backend for tournaments data
    async function fetchTournaments() {
      try {
        const response = await fetch('/api/tournaments'); // replace with your actual API endpoint
        const data = await response.json();
        setTournaments(data.tournaments);
      } catch (error) {
        toast({
          title: "Error fetching tournaments.",
          description: "There was an issue loading the tournaments data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    fetchTournaments();
  }, [toast]);

  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm" bg="gray.800" color="white">
      <Stack direction="row" alignItems="center">
        <Heading fontSize="2xl" mb={4}>Tournaments</Heading>
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" mt={6}>
        <Button variant="outline" colorScheme="green">
          Create Tournament
        </Button>
      </Stack>

      {tournaments.length > 0 ? (
        tournaments.map((tournament, index) => (
          <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4} bg="gray.700">
            <Text fontWeight="bold">Tournament ID: {tournament.tournament_id}</Text>
            <Text>Creator: {tournament.creator}</Text>
            <Text>Number of Players: {tournament.no_of_players}</Text>
            <Text>In Progress: {tournament.in_progress ? 'Yes' : 'No'}</Text>
            <Text>Game Ended: {tournament.game_ended ? 'Yes' : 'No'}</Text>
            <Text>Winner: {tournament.winner ? tournament.winner : 'N/A'}</Text>
            <Text>Rounds per Challenge: {tournament.rounds_per_challenge}</Text>
            <Text>Active Round: {tournament.active_round}</Text>
            <Text>Started At: {tournament.started_at}</Text>
            <Text>Ended At: {tournament.ended_at ? tournament.ended_at : 'Ongoing'}</Text>
            <Text>Round Winners: {tournament.round_winners.join(', ')}</Text>
            <Text>Fixtures: {JSON.stringify(tournament.fixtures)}</Text>
          </Box>
        ))
      ) : (
        <Text>No tournaments available at the moment.</Text>
      )}

    </Stack>
  );
}
