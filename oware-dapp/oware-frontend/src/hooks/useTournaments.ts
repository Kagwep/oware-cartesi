import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi'; // Assuming you're using wagmi for account management
import { stringToHex,hexToString } from "viem";
import { inspect } from '../utils';
import { Tournament } from '../utils/types';
import axios from 'axios';

const INSPECT_URL = 'https://oware-cartesi-v1.fly.dev/inspect';

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTournaments = useCallback(async () => {
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
        JSON.stringify({ method: "get_all_tournaments" }),
        {
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal
        }
      );

      if (response.status === 200 && response.data && response.data.reports) {
        const parsedResults = JSON.parse(hexToString(response.data.reports[0].payload));
        if (Array.isArray(parsedResults.tournaments)) {
          setTournaments(parsedResults.tournaments);
        } else {
          throw new Error('Tournaments data is not an array');
        }
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error fetching tournaments:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchTournaments();

    return () => {
      // Cancel any ongoing request when the component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTournaments]);

  return { tournaments, isLoading, error, refetchTournaments: fetchTournaments };
};


export const useTournament = (tournamentId: string | null) => {

  if(!tournamentId) return;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { address } = useAccount();

  const fetchTournament = useCallback(async () => {
    if (!address || !tournamentId) return;

    setIsLoading(true);
    setError(null);

    try {
      let  tournamentResults = await inspect(JSON.stringify({ 
        method: "get_tournament", 
        tournament_id: parseInt(tournamentId) 
      }));
      try {
        tournamentResults = JSON.parse(hexToString(tournamentResults[0].payload))["tournament"];
        console.log("results: ",tournamentResults);
        setTournament(tournamentResults[0]);
      } catch (e) {
        console.error("Error parsing results: ", e);
      }
    } catch (error) {
      console.error("Error fetching tournament: ", error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [address, tournamentId]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  return { tournament, isLoading, error,fetchTournament };
};