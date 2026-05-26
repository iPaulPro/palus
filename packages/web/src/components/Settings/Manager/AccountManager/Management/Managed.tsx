import { useConnection } from "wagmi";
import formatAddress from "@/helpers/formatAddress";
import List from "./List";

const Managed = () => {
  const { address } = useConnection();

  return (
    <>
      <div className="p-5">
        Accounts managed by your connected wallet.{" "}
        {address ? `(${formatAddress(address)})` : ""}
      </div>
      <div className="divider" />
      <div className="mx-5 my-3">
        <List managed />
      </div>
    </>
  );
};

export default Managed;
