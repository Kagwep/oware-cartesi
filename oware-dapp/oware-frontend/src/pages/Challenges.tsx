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

export default function Challenges() {
  const [isOpen, setIsOpen] = useState(false);
  const [mychallenges, setMychallenges] = useState([])
  const [challenges, setChallenges] = useState([]);
  const toast = useToast();

  const { address, isConnected, chain } = useAccount();
 

  useEffect(() => {
    // Simulating fetch request to the backend for challenges data
    async function fetchChallenges() {
      try {
        if(address){
          let  results  = await inspect(JSON.stringify({method: "get_all_challenges"})); 
          console.log(results)
          
          try {
              results = JSON.parse(hexToString(results[0].payload))["challenges"]
              console.log("results: ", results);
              setChallenges(results);
          }catch (e){
            console.log("Error: ", e)
          }
          
        }
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
  }, [toast,address]);



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
      <ListChallenges challenges={challenges} />
    </Stack>
  );
}
