import { BaseError } from "wagmi";
import { useWriteInputBoxAddInput } from "../hooks/generated";
import { stringToHex,hexToString } from "viem";
import { dAppAddress, INSPECT_URL } from "../constants";
import { UseToastOptions } from "@chakra-ui/react";
import { Challenge } from "./types";


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


  export const inspect = async (payload : string) => {
    const response = await fetch(`${INSPECT_URL}/${payload}`)

    if (response.status === 200){
        const result = await response.json();
        return result.reports
    }else{
        console.log(JSON.stringify(await response.text()))
    }
  }

export const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  export const formattedAddressCheck = (playerAddress: string, address:string) => {
    return !!(address && playerAddress.toLowerCase() === address.toLowerCase())
  };


