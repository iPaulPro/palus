import { familyAccountsConnector } from "family";
import type { ReactNode } from "react";
import { createConfig, WagmiProvider } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import {
  CHAIN,
  INFURA_API_KEY,
  WALLETCONNECT_PROJECT_ID
} from "@/data/constants";
import getRpc from "@/helpers/getRpc";

const connectors = [
  metaMask({ infuraAPIKey: INFURA_API_KEY }),
  familyAccountsConnector(),
  walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  injected()
];

const config = createConfig({
  chains: [CHAIN],
  connectors,
  transports: {
    [CHAIN.id]: getRpc()
  }
});

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default Web3Provider;
