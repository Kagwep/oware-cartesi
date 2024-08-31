import { http, createConfig } from "wagmi";
import {
  anvil,
  arbitrum,
  arbitrumGoerli,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismGoerli,
  sepolia,
} from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { createClient } from "viem";

const customAnvil = {
  ...anvil,
  rpcUrls: {
    default: {
      http: ["http://192.168.1.163:8545"],
      webSocket: ["ws://192.168.1.163:8545"],
    },
    public: {
      http: ["http://192.168.1.163:8545"],
      webSocket: ["ws://192.168.1.163:8545"],
    },
  },
};

export const config = createConfig({
  chains: [
    customAnvil, 
    mainnet,
    sepolia,
    arbitrum,
    arbitrumGoerli,
    optimismGoerli,
    optimism,
    base,
    baseSepolia,
  ],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

