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
import TouramentFormModal from '../components/forms/TouramentFormModal';
import { useChallenges } from '../hooks/useChallenges';
import { useAccount } from 'wagmi';
import { useTournaments } from '../hooks/useTournaments';
import { useWriteInputBoxAddInput } from '../hooks/generated';
import { v4 as uuidv4 } from 'uuid';
import { sendInput } from '../utils';
import ListTournaments from '../components/ListTournaments';

export default function Tournaments() {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { tournaments, isLoading, error, refetchTournaments } = useTournaments();
  const { address, isConnected, chain } = useAccount();

  const { writeContractAsync } = useWriteInputBoxAddInput();


  const handleClick = () => {
    if (!isConnected) {
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

  const handleJoinTournament = async(dataToSend: any) => {
    // Logic to join the challenge (e.g., API call)
    console.log(`Joining challenge with ID: ${dataToSend.challenge_id}`);

    const toastId = uuidv4();

    toast({
      id: toastId,
      title: "joining challenge",
      description: "Please wait...",
      status: "info",
      duration: null,
      isClosable: true,
    });


    try {
      const result = await sendInput(JSON.stringify(dataToSend), writeContractAsync);
      if (result.success) {

        toast.update(toastId, {
          title: "Joined Challenge",
          description: "You have joined the challenge successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Additional success handling (e.g., reset form, close modal, etc.)

          // Wait for 20 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));


        await refetchTournaments()

      } else {
        throw new Error("Failed to join challenge");
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.update(toastId, {
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // Additional error handling if needed
    }

    

  };

  const handleAddOpponentTournament = async(dataToSend: any) => {
    // Logic to join the challenge (e.g., API call)
    console.log(`Adding opponent with ID: ${dataToSend.tournament_id}`);

    const toastId = uuidv4();

    toast({
      id: toastId,
      title: "Adding opponent to tournament",
      description: "Please wait...",
      status: "info",
      duration: null,
      isClosable: true,
    });


    try {
      const result = await sendInput(JSON.stringify(dataToSend), writeContractAsync);
      if (result.success) {

        toast.update(toastId, {
          title: "Opponent added",
          description: "You have successfully added your opponent.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Additional success handling (e.g., reset form, close modal, etc.)

          // Wait for 20 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));


        await refetchTournaments()

      } else {
        throw new Error("Failed to add opponent");
      }
    } catch (error) {
      console.error("Error ading opponent:", error);
      toast.update(toastId, {
        title: "Error",
        description: "Failed to add opponent. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // Additional error handling if needed
    }

    

  };

  if (isLoading) return <div>Loading tournaments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm" bg="gray.800" color="white">
      <Stack direction="row" alignItems="center">
        <Heading fontSize="2xl" mb={4}>Tournaments</Heading>
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" mt={6}>
        <Button variant="outline" colorScheme="green" onClick={handleClick}>
          Create new
        </Button>
        <TouramentFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} fetchTournaments={refetchTournaments}/>
      </Stack>
      <ListTournaments tournaments={tournaments} onJoinTournament={handleJoinTournament} fetchTournaments={refetchTournaments} onAddOpponentTournament={handleAddOpponentTournament} />
    </Stack>
  );
}
