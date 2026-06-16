import { ArrowRightIcon } from "@heroicons/react/24/solid";
import type { AnyBalance, Erc20Amount, NativeAmount } from "@palus/indexer";
import { accountAbi } from "lens-modules/abis";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  encodeFunctionData,
  erc20Abi,
  type Hex,
  isAddress,
  parseUnits
} from "viem";
import { useWriteContract } from "wagmi";
import SearchAccounts from "@/components/Shared/Account/SearchAccounts";
import { Button, Input, Modal, Select } from "@/components/Shared/UI";
import { ADDRESS_PLACEHOLDER } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import { TOKENS } from "@/data/tokens";
import humanize from "@/helpers/humanize";
import useUmami from "@/hooks/useUmami";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface SendProps {
  balances: AnyBalance[];
  disabled: boolean;
  refetch: () => void;
}

const AVAILABLE_TOKENS = TOKENS.filter((token) => token.contractAddress !== "");

const Send = ({ balances, disabled, refetch }: SendProps) => {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>(
    AVAILABLE_TOKENS[0].contractAddress
  );

  const selectedToken = useMemo(
    () =>
      AVAILABLE_TOKENS.find(
        (token) =>
          token.contractAddress.toLowerCase() ===
          selectedTokenAddress.toLowerCase()
      ) ?? AVAILABLE_TOKENS[0],
    [selectedTokenAddress]
  );

  const { currentAccount } = useAccountStore();
  const { track } = useUmami();

  const { mutateAsync: writeContractAsync, isPending } = useWriteContract();

  const balance = useMemo(() => {
    return balances?.find(
      (balance) =>
        (balance.__typename === "NativeAmount" ||
          balance.__typename === "Erc20Amount") &&
        balance.asset.contract.address.toLowerCase() ===
          selectedTokenAddress.toLowerCase()
    ) as NativeAmount | Erc20Amount | undefined;
  }, [selectedTokenAddress, balances]);

  const reset = () => {
    setShowModal(false);
    setInputValue("");
    setRecipient("");
    setSelectedTokenAddress(AVAILABLE_TOKENS[0].contractAddress);
  };

  const sendNative = async (account: Hex, amount: bigint) => {
    return writeContractAsync({
      abi: accountAbi,
      address: account,
      args: [recipient as Hex, amount, "0x"],
      functionName: "executeTransaction"
    });
  };

  const sendErc20 = async (account: Hex, amount: bigint) => {
    const callData = encodeFunctionData({
      abi: erc20Abi,
      args: [recipient as Hex, amount],
      functionName: "transfer"
    });

    return writeContractAsync({
      abi: accountAbi,
      address: account,
      args: [selectedToken.contractAddress as Hex, 0n, callData],
      functionName: "executeTransaction"
    });
  };

  const handleSubmit = async () => {
    if (
      !currentAccount ||
      !isAddress(recipient) ||
      currentAccount.address.toLowerCase() === recipient.toLowerCase()
    ) {
      toast.error("Invalid receiver address");
      return;
    }

    let amount = 0n;
    try {
      amount = parseUnits(inputValue, selectedToken.decimals);
    } catch {
      toast.error("Invalid amount");
      return;
    }

    try {
      if (
        selectedToken.contractAddress.toLowerCase() ===
        CONTRACTS.nativeToken.toLowerCase()
      ) {
        await sendNative(currentAccount.address, amount);
      } else {
        await sendErc20(currentAccount.address, amount);
      }
    } catch (e) {
      console.error("handleSubmit: executeTransaction error=", e);
      toast.error("Failed to send tokens");
      return;
    }

    toast.success("Tokens sent successfully!");
    reset();
    refetch();
    track("Token operation", {
      sendTokens: selectedToken.symbol
    });
  };

  return (
    <>
      <Button
        className="px-3 text-sm sm:px-5 sm:text-base"
        disabled={disabled}
        onClick={() => setShowModal(true)}
        size="lg"
        variant="outline"
      >
        <ArrowRightIcon
          className="size-5 rounded-full border border-border bg-gray-50 p-1 sm:size-6 dark:bg-gray-700"
          stroke="currentColor"
          strokeWidth={2}
        />
        Send
      </Button>
      <Modal onClose={reset} show={showModal} size="xs" title="Send">
        <div className="flex flex-col gap-y-3 p-5">
          <SearchAccounts
            error={recipient.length > 0 && !isAddress(recipient)}
            hideDropdown={isAddress(recipient)}
            onAccountSelected={(account) => setRecipient(account.address)}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder={`${ADDRESS_PLACEHOLDER} or wagmi`}
            value={recipient}
          />
          <div className="flex min-w-0 items-center gap-x-3">
            <Input
              inputMode="decimal"
              min={0}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0.5"
              type="number"
              value={inputValue}
            />
            <Select
              onChange={(token) => {
                setInputValue("");
                setSelectedTokenAddress(token);
              }}
              options={AVAILABLE_TOKENS.map((token) => ({
                label: token.symbol,
                selected:
                  selectedToken.contractAddress === token.contractAddress,
                value: token.contractAddress
              }))}
            />
          </div>
          <button
            className="truncate text-start text-secondary hover:text-on-surface"
            onClick={() => setInputValue(balance?.value ?? "0")}
            type="button"
          >
            Balance: {balance ? humanize(Number(balance.value)) : "0"}{" "}
            {balance && "asset" in balance ? balance.asset.symbol : ""}
          </button>
          <Button
            className="w-full"
            disabled={
              isPending ||
              !inputValue ||
              Number(inputValue) <= 0 ||
              Number(inputValue) > Number(balance?.value) ||
              !isAddress(recipient)
            }
            loading={isPending}
            onClick={handleSubmit}
            size="lg"
          >
            Send
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Send;
