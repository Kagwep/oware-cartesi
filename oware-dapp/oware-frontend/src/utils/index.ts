import { BaseError } from "wagmi";
import { useWriteInputBoxAddInput } from "../hooks/generated";
import { stringToHex,hexToString } from "viem";
import { dAppAddress, INSPECT_URL } from "../constants";
import { UseToastOptions } from "@chakra-ui/react";
import { Challenge } from "./types";
import axios from 'axios';


export const sendInput = async (inputValue: string, writeContractAsync: Function) => {
    try {
      const tx = await writeContractAsync({
        args: [
          dAppAddress,
          stringToHex(inputValue),
        ],
      });
      return { success: true };
      
    } catch (error) {
      console.error("Error in sendInput:", error);
      return { success: false, error };
    }
  };


  export const inspect = async (payload: string) => {
    try {
      const response = await axios.post(INSPECT_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        return response.data.reports;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  };

export const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  export const formattedAddressCheck = (playerAddress: string, address:string) => {
    return !!(address && playerAddress.toLowerCase() === address.toLowerCase())
  };


