import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { hexToString } from "viem";
import axios from 'axios';
import { Profile } from '../utils/types';
import {INSPECT_URL} from '../constants'

export const useLeader = () => {
  const [leader, setLeader] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchLeader = useCallback(async () => {
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
        JSON.stringify({ 
          method: "get_player", 
          player: address.toLowerCase() 
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal
        }
      );

      if (response.status === 200 && response.data && response.data.reports) {
        const parsedResults = JSON.parse(hexToString(response.data.reports[0].payload));
        if (parsedResults.player) {
          setLeader(parsedResults.player);
        } else {
          throw new Error('Player data not found in response');
        }
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error fetching leader:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchLeader();

    return () => {
      // Cancel any ongoing request when the component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchLeader]);

  return { leader, isLoading, error, refetchLeader: fetchLeader };
};