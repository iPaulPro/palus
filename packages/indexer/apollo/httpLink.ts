import { HttpLink } from "@apollo/client";

export const IS_TESTNET = import.meta.env.VITE_USE_TESTNET === "true";
export const LENS_API_URL = IS_TESTNET
  ? "https://api.testnet.lens.xyz/graphql"
  : "https://api.lens.xyz/graphql";

const httpLink = new HttpLink({
  fetch,
  fetchOptions: "no-cors",
  headers: { origin: "https://palus.app" },
  uri: LENS_API_URL
});

export default httpLink;
