import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi'; // Assuming you're using wagmi for account management
import { stringToHex,hexToString } from "viem";
import { inspect } from '../utils';
import { Challenge } from '../utils/types';

export const useChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const { address } = useAccount();

  const fetchChallenges = useCallback(async () => {
    if (address) {
      try {
        let results = await inspect(JSON.stringify({ method: "get_all_challenges" }));
        console.log(results);

        try {
          results = JSON.parse(hexToString(results[0].payload))["challenges"];
          console.log("results: ", results);
          setChallenges(results);
        } catch (e) {
          console.error("Error parsing results: ", e);
        }
      } catch (error) {
        console.error("Error fetching challenges: ", error);
      }
    }
  }, [address]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return { challenges, fetchChallenges };
};


export const useChallenge = (challengeId: string,selectedTournamentId: string | null) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { address } = useAccount();

  const fetchChallenge = useCallback(async () => {
    if (!address || !challengeId || selectedTournamentId) return;

    setIsLoading(true);
    setError(null);

    try {
      let  challengeResults = await inspect(JSON.stringify({ 
        method: "get_challenge", 
        challenge_id: parseInt(challengeId) 
      }));
      try {
        challengeResults = JSON.parse(hexToString(challengeResults[0].payload))["challenge"];
        console.log("results: ",challengeResults);
        setChallenge(challengeResults[0]);
      } catch (e) {
        console.error("Error parsing results: ", e);
      }
    } catch (error) {
      console.error("Error fetching challenge: ", error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [address, challengeId]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  return { challenge, isLoading, error, refetch: fetchChallenge };
};