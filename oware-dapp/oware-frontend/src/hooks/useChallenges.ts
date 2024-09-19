import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { stringToHex, hexToString } from "viem";
import axios from 'axios';
import { Challenge } from '../utils/types';
import { inspect } from '../utils';
import {INSPECT_URL} from '../constants'

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchChallenges = useCallback(async () => {
    if (!address) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        INSPECT_URL,
        JSON.stringify({ method: "get_all_challenges" }),
        {
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal
        }
      );

      if (response.status === 200 && response.data && response.data.reports) {
        const parsedResults = JSON.parse(hexToString(response.data.reports[0].payload));
        setChallenges(parsedResults.challenges);
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error fetching challenges:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchChallenges();

    return () => {
      // Cancel any ongoing request when the component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchChallenges]);

  return { challenges, isLoading, error, refetchChallenges: fetchChallenges };
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