import { STATIC_IMAGES_URL } from "@/data/constants";

interface WalletDetails {
  logo: string;
  name: string;
}

const WALLETS = {
  familyAccountsProvider: {
    logo: `${STATIC_IMAGES_URL}/family.webp`,
    name: "Login with Family"
  },
  injected: {
    logo: `${STATIC_IMAGES_URL}/wallet.svg`,
    name: "Browser Wallet"
  },
  metaMaskSDK: {
    logo: `${STATIC_IMAGES_URL}/metamask.svg`,
    name: "MetaMask"
  },
  walletConnect: {
    logo: `${STATIC_IMAGES_URL}/walletconnect.svg`,
    name: "Wallet Connect"
  }
};

type WalletId = keyof typeof WALLETS;

const getWalletDetails = (id: WalletId): WalletDetails => {
  return WALLETS[id];
};

export default getWalletDetails;
