import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { hexToString } from "viem";
import axios from 'axios';
import { Profile } from '../utils/types';

const INSPECT_URL = 'https://oware-cartesi-v1.fly.dev/inspect';

export const useLeaders = () => {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchLeaders = useCallback(async () => {
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
        JSON.stringify({ method: "get_top_players" }),
        {
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal
        }
      );

      if (response.status === 200 && response.data && response.data.reports) {
        const parsedResults = JSON.parse(hexToString(response.data.reports[0].payload));
        if (Array.isArray(parsedResults.top_players)) {
          setLeaders(parsedResults.top_players);
        } else {
          throw new Error('Leaders data is not an array');
        }
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error fetching leaders:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchLeaders();

    return () => {
      // Cancel any ongoing request when the component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchLeaders]);

  return { leaders, isLoading, error, refetchLeaders: fetchLeaders };
};