import {
  type AnyBalance,
  type Erc20Amount,
  type NativeAmount,
  useBalancesBulkQuery
} from "@palus/indexer";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useConnection } from "wagmi";
import { Button, Input, Modal, Select } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import { TOKENS } from "@/data/tokens";
import errorToast from "@/helpers/errorToast";
import humanize from "@/helpers/humanize";
import { parseLocaleNumber } from "@/helpers/parseLocaleNumber";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import useUmami from "@/hooks/useUmami";
import type { ApolloClientError } from "@/types/errors";

interface TokenOperationProps {
  useMutationHook: any;
  resultKey: "deposit" | "withdraw" | "wrapTokens" | "unwrapTokens";
  tokenAddress: string;
  title: string;
  successMessage: string;
  balances?: AnyBalance[];
  refetch: () => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const AVAILABLE_TOKENS = TOKENS.filter((token) => token.contractAddress !== "");

const TokenOperation = ({
  useMutationHook,
  resultKey,
  title,
  tokenAddress,
  successMessage,
  balances,
  refetch,
  showModal,
  setShowModal
}: TokenOperationProps) => {
  const [selectedToken, setSelectedToken] = useState<string>(
    () => tokenAddress
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxValue, setMaxValue] = useState<string>("0");
  const [inputValue, setInputValue] = useState<string>("");

  const handleTransactionLifecycle = useTransactionLifecycle();
  const { address: walletAddress } = useConnection();
  const { track } = useUmami();

  const { data: walletBalance } = useBalancesBulkQuery({
    fetchPolicy: "no-cache",
    pollInterval: 10000,
    skip: !walletAddress || resultKey !== "deposit" || !showModal,
    variables: {
      request: {
        address: walletAddress,
        ...(selectedToken.toLowerCase() === CONTRACTS.nativeToken.toLowerCase()
          ? { includeNative: true }
          : { tokens: [selectedToken] })
      }
    }
  });

  useEffect(() => {
    if (resultKey === "deposit" || !balances) return;

    const balance = balances?.find(
      (balance) =>
        (balance.__typename === "NativeAmount" ||
          balance.__typename === "Erc20Amount") &&
        balance.asset.contract.address.toLowerCase() ===
          selectedToken.toLowerCase()
    ) as NativeAmount | Erc20Amount | undefined;

    const value = balance?.value ?? "0";
    setMaxValue(value);
  }, [selectedToken, balances]);

  useEffect(() => {
    if (resultKey !== "deposit" || !walletBalance) return;

    const balance =
      walletBalance?.balancesBulk[0].__typename === "Erc20Amount" ||
      walletBalance?.balancesBulk[0].__typename === "NativeAmount"
        ? walletBalance.balancesBulk[0].value
        : "0";

    setMaxValue(balance);
  }, [walletBalance]);

  const reset = () => {
    setShowModal(false);
    setIsSubmitting(false);
    setInputValue("");
    setSelectedToken(tokenAddress);
  };

  const onCompleted = () => {
    reset();
    refetch();
    toast.success(successMessage);
    track("Token operation", {
      [resultKey]: TOKENS.find(
        (token) =>
          token.contractAddress.toLowerCase() === selectedToken.toLowerCase()
      )?.symbol
    });
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const [mutate] = useMutationHook({
    onCompleted: async (data: any) => {
      const result = data?.[resultKey];
      if (result?.__typename === "InsufficientFunds") {
        return onError({
          message: "Insufficient funds",
          name: "InsufficientFunds"
        });
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: result
      });
    },
    onError
  });

  const handleSubmit = () => {
    if (!inputValue) {
      return;
    }

    const parsedInput = parseLocaleNumber(inputValue);
    console.log(
      "handleSubmit: inputValue =",
      inputValue,
      "parsedInput =",
      parsedInput,
      "maxValue =",
      maxValue
    );
    if (parsedInput <= 0 || parsedInput > Number(maxValue)) {
      return;
    }

    const value = parsedInput.toString();

    setIsSubmitting(true);

    return mutate({
      variables: {
        request:
          resultKey === "withdraw" || resultKey === "deposit"
            ? selectedToken.toLowerCase() ===
              CONTRACTS.nativeToken.toLowerCase()
              ? { native: value }
              : { erc20: { currency: selectedToken, value } }
            : { amount: value }
      }
    });
  };

  return (
    <Modal onClose={reset} show={showModal} size="xs" title={title}>
      <div className="min-w-0 space-y-3 p-5">
        <p className="pb-1">
          {resultKey === "deposit"
            ? "Deposit funds from your connected wallet"
            : resultKey === "withdraw"
              ? "Withdraw funds to your connected wallet"
              : resultKey === "wrapTokens"
                ? "Wrap your GHO to convert into WGHO"
                : "Unwrap your WGO tokens back into GHO"}
        </p>
        {(resultKey === "withdraw" || resultKey === "deposit") && (
          <Select
            onChange={(token) => {
              setSelectedToken(token);
              setInputValue("");
            }}
            options={AVAILABLE_TOKENS.map((token) => ({
              label: token.symbol,
              selected: selectedToken === token.contractAddress,
              value: token.contractAddress
            }))}
          />
        )}
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            inputMode="decimal"
            min={0}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="0.5"
            type="number"
            value={inputValue}
          />
          <Button onClick={() => setInputValue(maxValue)} size="lg">
            Max
          </Button>
        </div>
        <button
          className="truncate text-start text-secondary hover:text-on-surface"
          onClick={() => setInputValue(maxValue)}
          type="button"
        >
          Balance: {maxValue ? humanize(Number(maxValue)) : "0"}
        </button>
        <Button
          className="w-full"
          disabled={
            isSubmitting ||
            !inputValue ||
            Number(inputValue) <= 0 ||
            Number(inputValue) > Number(maxValue)
          }
          loading={isSubmitting}
          onClick={handleSubmit}
          size="lg"
        >
          {title}
        </Button>
      </div>
    </Modal>
  );
};

export default TokenOperation;
