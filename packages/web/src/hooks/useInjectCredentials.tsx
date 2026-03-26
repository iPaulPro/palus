import { useEffect } from "react";
import { IS_TESTNET } from "@/data/constants";
import { hydrateAuthTokens, signIn } from "@/store/persisted/useAuthStore";

const useInjectCredentials = () => {
  useEffect(() => {
    const tokens = hydrateAuthTokens();
    if (tokens.refreshToken) return;

    const accessToken = import.meta.env.VITE_ACCESS_TOKEN;
    const refreshToken = import.meta.env.VITE_REFRESH_TOKEN;
    if (!IS_TESTNET || !accessToken || !refreshToken) return;

    signIn({
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  }, []);
};

export default useInjectCredentials;
