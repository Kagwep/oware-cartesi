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
import { FcAddRow } from 'react-icons/fc';
import { useWeb3 } from '../context/Web3Provider';
import ChallengeFormModal from '../components/forms/ChallengeForm';


export default function Challenges() {
  const [isOpen, setIsOpen] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const toast = useToast();
  const {signer} = useWeb3();

  useEffect(() => {
    // Simulating fetch request to the backend for challenges data
    async function fetchChallenges() {
      try {
        const response = await fetch('/api/challenges'); // replace with your actual API endpoint
        const data = await response.json();
        setChallenges(data.challenges);
      } catch (error) {
        toast({
          title: "Error fetching challenges.",
          description: "There was an issue loading the challenges data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    fetchChallenges();
  }, [toast]);



  const handleClick = () => {
    if (!signer) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to proceed.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setIsOpen(true);
    }
  };

  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm" bg="gray.800" color="white">
      <Stack direction="row" alignItems="center">
        <Heading fontSize="2xl" mb={4}>Challenges</Heading>
      </Stack>

      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" mt={6}>
        <Button variant="outline" colorScheme="green" onClick={handleClick}>
          Create new
        </Button>
        <ChallengeFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} signer={signer}/>
      </Stack>

      {challenges.length > 0 ? (
        challenges.map((challenge, index) => (
          <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4} bg="gray.700">
            <Text fontWeight="bold">Challenge ID: {challenge.challenge_id}</Text>
            <Text>Creator: {challenge.creator}</Text>
            <Text>Opponent: {challenge.opponent}</Text>
            <Text>In Progress: {challenge.in_progress ? 'Yes' : 'No'}</Text>
            <Text>Game Ended: {challenge.game_ended ? 'Yes' : 'No'}</Text>
            <Text>Winner: {challenge.winner ? challenge.winner : 'N/A'}</Text>
            <Text>Board State: {challenge.state}</Text>
          </Box>
        ))
      ) : (
        <Text>No challenges available at the moment.</Text>
      )}
    </Stack>
  );
}
