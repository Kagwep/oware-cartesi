import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  Avatar,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  useColorModeValue,
  Stack
} from '@chakra-ui/react';
import { useLeader } from '../hooks/useLeader';
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
        <StarIcon key={i} color={rankColors[rankTitle]} />
      ))}
      <Text color={rankColors[rankTitle]} fontWeight="bold">
        {rankTitle}
      </Text>
    </HStack>
  );
};

const Profile = () => {
  const { leader, fetchLeader } = useLeader();
  const toast = useToast();
  const { address, isConnected } = useAccount();

  React.useEffect(() => {
    fetchLeader();
  }, [toast, address, fetchLeader]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  if (!isConnected) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="lg">Please connect your wallet to view your profile</Heading>
      </Box>
    );
  }

  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm" bg="gray.800" color="white">
    <Box
      maxWidth="800px"
      margin="auto"
      p={8}
      borderRadius="lg"
      boxShadow="xl"
    >
      <VStack spacing={6} align="stretch">
        <HStack spacing={6}>
          <Avatar size="2xl" name={leader?.playerName || 'Anonymous'} />
          <VStack align="start" spacing={2}>
            <Heading size="2xl">{leader?.playerName || 'Anonymous'}</Heading>
            <Badge colorScheme="green" fontSize="md" p={2} borderRadius="full">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'No Address'}
            </Badge>
            <RankDisplay rankTitle={leader?.rankTitle ?? null} />
          </VStack>
        </HStack>

        <Divider />

        <StatGroup>
          <Stat>
            <StatLabel>Score</StatLabel>
            <StatNumber>{leader?.score || 0}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Rank</StatLabel>
            <StatNumber>{leader?.rankTitle || 'Unranked'}</StatNumber>
          </Stat>
        </StatGroup>

        <Divider />

        <VStack align="start" spacing={2}>
          <Heading size="md">Account Details</Heading>
          <Text><strong>Address:</strong> {address || 'Not Connected'}</Text>
          <Text><strong>Connection Status:</strong> {isConnected ? 'Connected' : 'Not Connected'}</Text>
        </VStack>
      </VStack>
    </Box>
    </Stack>
  );
};

export default Profile;