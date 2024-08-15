import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
  };

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();

          setProvider(provider);
          setSigner(signer);
          setAccount(address);
        } catch (error) {
          console.error("User rejected connection", error);
        }
      } else {
        console.log('Please install MetaMask!');
      }
    };

    connectWallet();
  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer, account,disconnect }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}