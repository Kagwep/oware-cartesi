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

export default function Challenges() {
  const [isOpen, setIsOpen] = useState(false);
  const [mychallenges, setMychallenges] = useState([])
  const { challenges, fetchChallenges } = useChallenges();
  const toast = useToast();

  const { address, isConnected, chain } = useAccount();

  const { writeContractAsync } = useWriteInputBoxAddInput();

  useEffect(() => {
    // Simulating fetch request to the backend for challenges data
    fetchChallenges();
  }, [toast,address,fetchChallenges]);


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
        await new Promise(resolve => setTimeout(resolve, 20000));


        await fetchChallenges()

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



  
  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm" bg="gray.800" color="white">
      <Stack direction="row" alignItems="center">
        <Heading fontSize="2xl" mb={4}>Challenges</Heading>
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" mt={6}>
        <Button variant="outline" colorScheme="green" onClick={handleClick}>
          Create new
        </Button>
        <ChallengeFormModal isOpen={isOpen} onClose={() => setIsOpen(false)}/>
      </Stack>
      <ListChallenges challenges={challenges} onJoinChallenge={handleJoinChallenge} fetchChallenges={fetchChallenges} />
    </Stack>
  );
}
