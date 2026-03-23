import {
  type AnyBalance,
  useUnwrapTokensMutation,
  useWrapTokensMutation
} from "@palus/indexer";
import { useMemo, useState } from "react";
import { useConnection } from "wagmi";
import { Button, Image, Tooltip } from "@/components/Shared/UI";
import { NATIVE_TOKEN_SYMBOL } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import { formatWithZeroSubscript } from "@/helpers/formatValues";
import getTokenImage from "@/helpers/getTokenImage";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import TokenOperation from "../TokenOperation";

interface TokenBalanceProps {
  value: string;
  symbol: string;
  name: string;
  contractAddress: string;
  onClick: () => void;
  buttonLabel: string;
  disabled?: boolean;
}

const TokenBalance = ({
  value,
  symbol,
  name,
  contractAddress,
  onClick,
  buttonLabel,
  disabled = false
}: TokenBalanceProps) => {
  const isNative =
    contractAddress === CONTRACTS.wrappedNativeToken ||
    contractAddress === CONTRACTS.nativeToken;

  const isStable =
    contractAddress === CONTRACTS.usdc ||
    contractAddress === CONTRACTS.wrappedNativeToken ||
    contractAddress === CONTRACTS.nativeToken;

  const formattedAmount = useMemo(() => {
    if (!value) return "";

    const [, frac = ""] = value.split(".");
    const len = frac.length;
    if (len > 5) return formatWithZeroSubscript(value);

    const num = Number(value);
    if (len <= 2) {
      return new Intl.NumberFormat().format(num);
    }

    return value;
  }, [value]);

  return (
    <div className="group flex items-center justify-between gap-5 rounded-xl hover:bg-surface sm:p-2">
      <div className="flex min-w-0 items-center gap-2">
        <Image
          alt={symbol}
          className="size-7 flex-none rounded-full border border-border bg-gray-100"
          src={getTokenImage(symbol)}
        />
        <span className="truncate font-bold">
          {name.replace("Token", "")}{" "}
          <span className="text-secondary">
            {symbol !== name ? `(${symbol})` : ""}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-x-3">
        {isNative ? (
          <Button
            disabled={disabled || Number(value) === 0}
            onClick={onClick}
            outline
            size="sm"
          >
            {buttonLabel}
          </Button>
        ) : null}
        <Tooltip content={value}>
          <span className="font-bold">
            {isStable
              ? `$${Intl.NumberFormat("default", {
                  currency: "USD",
                  maximumFractionDigits: 2
                }).format(Number(value))} `
              : formattedAmount}
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

interface TokenProps {
  balances: AnyBalance[] | undefined;
  refetch: () => void;
}

const Tokens = ({ balances, refetch }: TokenProps) => {
  const [showWrapModal, setShowWrapModal] = useState(false);
  const [showUnwrapModal, setShowUnwrapModal] = useState(false);

  const { currentAccount } = useAccountStore();
  const { address: walletAddress } = useConnection();
  const loggedInAsOwner =
    walletAddress?.toLowerCase() === currentAccount?.owner.toLowerCase();

  if (!balances || balances.length === 0) {
    return <div className="p-5">No tokens found.</div>;
  }

  return (
    <>
      <div className="space-y-5 px-5 pt-2 pb-4 sm:space-y-0 sm:px-0 sm:pb-0">
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
                  disabled={!loggedInAsOwner}
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
                  disabled={!loggedInAsOwner}
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
