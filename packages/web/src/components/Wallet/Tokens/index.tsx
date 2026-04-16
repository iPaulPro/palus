import {
  type AnyBalance,
  useUnwrapTokensMutation,
  useWrapTokensMutation
} from "@palus/indexer";
import { useState } from "react";
import { NATIVE_TOKEN_SYMBOL } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import TokenOperation from "../TokenOperation";
import TokenBalance from "./Balance";

interface Props {
  balances: AnyBalance[] | undefined;
  refetch: () => void;
  canTransfer?: boolean;
}

const Tokens = ({ balances, refetch, canTransfer = false }: Props) => {
  const [showWrapModal, setShowWrapModal] = useState(false);
  const [showUnwrapModal, setShowUnwrapModal] = useState(false);

  if (!balances || balances.length === 0) {
    return <div className="p-5">No tokens found.</div>;
  }

  return (
    <>
      <div className="space-y-5 py-2 sm:space-y-1 sm:py-0">
        {balances.map((balance) => {
          if (!("asset" in balance)) {
            return null;
          }

          const address = balance.asset.contract.address;

          return (
            <div key={address}>
              {balance.__typename === "NativeAmount" && (
                <TokenBalance
                  buttonLabel="Wrap"
                  contractAddress={balance.asset.contract.address}
                  disabled={!canTransfer}
                  name={balance.asset.name}
                  onClick={() => setShowWrapModal(true)}
                  symbol={NATIVE_TOKEN_SYMBOL}
                  value={balance.value}
                />
              )}
              {balance.__typename === "Erc20Amount" && (
                <TokenBalance
                  buttonLabel="Unwrap"
                  contractAddress={balance.asset.contract.address}
                  disabled={!canTransfer}
                  name={balance.asset.name}
                  onClick={() => setShowUnwrapModal(true)}
                  symbol={balance.asset.symbol}
                  value={balance.value}
                />
              )}
            </div>
          );
        })}
      </div>
      <TokenOperation
        balances={balances}
        refetch={refetch}
        resultKey="wrapTokens"
        setShowModal={setShowWrapModal}
        showModal={showWrapModal}
        successMessage="Wrap Successful"
        title="Wrap"
        tokenAddress={CONTRACTS.nativeToken}
        useMutationHook={useWrapTokensMutation}
      />
      <TokenOperation
        balances={balances}
        refetch={refetch}
        resultKey="unwrapTokens"
        setShowModal={setShowUnwrapModal}
        showModal={showUnwrapModal}
        successMessage="Unwrap Successful"
        title="Unwrap"
        tokenAddress={CONTRACTS.wrappedNativeToken}
        useMutationHook={useUnwrapTokensMutation}
      />
    </>
  );
};

export default Tokens;
