import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi'; // Assuming you're using wagmi for account management
import { stringToHex,hexToString } from "viem";
import { inspect } from '../utils';
import { Tournament } from '../utils/types';

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const { address } = useAccount();

  const fetchTournaments = useCallback(async () => {
    if (address) {
      try {
        let results = await inspect(JSON.stringify({ method: "get_all_tournaments" }));
        console.log(results);

        try {
          results = JSON.parse(hexToString(results[0].payload))["tournaments"];
          console.log("results: ", results);
          setTournaments(results);
        } catch (e) {
          console.error("Error parsing results: ", e);
        }
      } catch (error) {
        console.error("Error fetching tournaments: ", error);
      }
    }
  }, [address]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return { tournaments, fetchTournaments };
};


export const useTournament = (tournamentId: string) => {
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

  return { tournament, isLoading, error, refetch: fetchTournament };
};