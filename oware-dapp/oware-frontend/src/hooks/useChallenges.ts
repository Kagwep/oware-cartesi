import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi'; // Assuming you're using wagmi for account management
import { stringToHex,hexToString } from "viem";
import { inspect } from '../utils';

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