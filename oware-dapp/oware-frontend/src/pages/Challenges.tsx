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
import ChallengeFormModal from '../components/forms/ChallengeForm';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Challenge } from '../utils/types';
import ListChallenges from '../components/ListChallenges';
import { inspect } from '../utils';
import { stringToHex,hexToString } from "viem";
import { sendInput } from '../utils';
import { useChallenges } from '../hooks/useChallenges';
import { v4 as uuidv4 } from 'uuid';
import { useWriteInputBoxAddInput } from '../hooks/generated';
import OwareTutorial from './OwareTutorial';

export default function Challenges() {
  const [isOpen, setIsOpen] = useState(false);
  const [mychallenges, setMychallenges] = useState([])
  const { challenges, isLoading, error, refetchChallenges }  = useChallenges();
  const toast = useToast();

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

  const handleJoinChallenge = async(dataToSend: any) => {
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


        await refetchChallenges()

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

  const handleAddOpponentChallenge = async(dataToSend: any) => {
    // Logic to join the challenge (e.g., API call)
    console.log(`Adding opponent with ID: ${dataToSend.challenge_id}`);

    const toastId = uuidv4();

    toast({
      id: toastId,
      title: "Adding opponent to challenge",
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


        await refetchChallenges()

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

  if (isLoading) return <div>Loading challenges...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm" bg="gray.800" color="white">
      <Stack direction="row" alignItems="center">
        <Heading fontSize="2xl" mb={4}>Challenges</Heading>
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" mt={6}>
        <Button variant="outline" colorScheme="green" onClick={handleClick}>
          Create new
        </Button>
        <OwareTutorial />
        <ChallengeFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} fetchChallenges={refetchChallenges}/>
      </Stack>
      <ListChallenges challenges={challenges} onJoinChallenge={handleJoinChallenge} fetchChallenges={refetchChallenges} onAddOpponentChallenge={handleAddOpponentChallenge} />
    </Stack>
  );
}
