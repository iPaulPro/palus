import { HttpLink } from "@apollo/client";
import { LENS_API_URL } from "@palus/data/constants";

const httpLink = new HttpLink({
  fetch,
  fetchOptions: "no-cors",
  headers: { origin: "https://palus.app" },
  uri: LENS_API_URL
});

export default httpLink;
