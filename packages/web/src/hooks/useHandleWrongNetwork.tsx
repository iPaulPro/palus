import { useConnection, useSwitchChain } from "wagmi";
import { CHAIN } from "@/data/constants";

const useHandleWrongNetwork = () => {
  const { isConnected, chainId } = useConnection();
  const { mutateAsync: switchChainAsync } = useSwitchChain();

  const handleWrongNetwork = async () => {
    // First check if connected, otherwise useSwitchChain just changes the wagmi config
    if (!isConnected) {
      throw new Error("No connected wallet found.");
    }

    if (chainId !== CHAIN.id) {
      await switchChainAsync({ chainId: CHAIN.id });
    }
  };

  return handleWrongNetwork;
};

export default useHandleWrongNetwork;
