import { familyAccountsConnector } from "family";
import type { ReactNode } from "react";
import { http } from "viem";
import { mainnet } from "viem/chains";
import { createConfig, WagmiProvider } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import {
  CHAIN,
  INFURA_API_KEY,
  RPC_URL,
  WALLETCONNECT_PROJECT_ID
} from "@/data/constants";

const connectors = [
  metaMask({
    dappMetadata: {
      iconUrl: "https://palus.app/web-app-manifest-512x512.png",
      name: "Palus",
      url: "https://palus.app"
    },
    enableAnalytics: false,
    infuraAPIKey: INFURA_API_KEY
  }),
  familyAccountsConnector(),
  walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  injected()
];

const config = createConfig({
  chains: [CHAIN, mainnet],
  connectors,
  transports: {
    [CHAIN.id]: http(RPC_URL),
    [mainnet.id]: http()
  }
});

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default Web3Provider;
