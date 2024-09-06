import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi'; // Assuming you're using wagmi for account management
import { stringToHex,hexToString } from "viem";
import { inspect } from '../utils';
import { Profile } from '../utils/types';


export const useLeader = () => {
    const [leader, setLeader] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { address } = useAccount();
  
    const fetchLeader = useCallback(async () => {
      if (!address) return;
  
      setIsLoading(true);
      setError(null);
  
      try {
        let  leaderResults = await inspect(JSON.stringify({ 
          method: "get_player", 
          player: address.toLowerCase() 
        }));
        try {
          leaderResults = JSON.parse(hexToString(leaderResults[0].payload))["player"];
          console.log("results: ",leaderResults);
          setLeader(leaderResults);
        } catch (e) {
          console.error("Error parsing results: ", e);
        }
      } catch (error) {
        console.error("Error fetching leader: ", error);
        setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    }, [address]);
  
    useEffect(() => {
      fetchLeader();
    }, [fetchLeader]);
  
    return { leader, isLoading, error,  fetchLeader };
  };