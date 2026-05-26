import type { ReactNode } from "react";
import { http } from "viem";
import { mainnet } from "viem/chains";
import { createConfig, WagmiProvider } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import {
  CHAIN,
  INFURA_API_KEY,
  IS_TESTNET,
  WALLETCONNECT_PROJECT_ID
} from "@/data/constants";
import { metaMask } from "@/helpers/metaMaskSdkConnector";

const connectors = [
  metaMask({
    dappMetadata: {
      iconUrl: "https://palus.app/icon-512.png",
      name: "Palus",
      url: window.origin
    },
    enableAnalytics: false,
    infuraAPIKey: INFURA_API_KEY
  }),
  walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  injected()
];

const config = createConfig({
  chains: [CHAIN, mainnet],
  connectors,
  transports: {
    [CHAIN.id]: IS_TESTNET
      ? http("https://rpc.testnet.lens.xyz")
      : http("https://rpc.lens.xyz"),
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`)
  }
});

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default Web3Provider;
