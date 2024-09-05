import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi'; // Assuming you're using wagmi for account management
import { stringToHex,hexToString } from "viem";
import { inspect } from '../utils';
import { Leader } from '../utils/types';

export const useLeaders = () => {
  const [leaders, setLeaders] = useState([]);
  const { address } = useAccount();

  const fetchLeaders = useCallback(async () => {
    if (address) {
      try {
        let results = await inspect(JSON.stringify({ method: "get_top_players" }));
        console.log(results);

        try {
          results = JSON.parse(hexToString(results[0].payload))["top_players"];
          console.log("results: ", results);
          setLeaders(results);
        } catch (e) {
          console.error("Error parsing results: ", e);
        }
      } catch (error) {
        console.error("Error fetching leaders: ", error);
      }
    }
  }, [address]);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  return { leaders, fetchLeaders };
};
