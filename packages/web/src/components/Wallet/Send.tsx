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
import useUmami from "@/hooks/useUmami";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface SendProps {
  balances: AnyBalance[];
  disabled: boolean;
}

const Send = ({ balances, disabled }: SendProps) => {
  const tokens = TOKENS.filter((token) => token.contractAddress !== "");

  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>(
    tokens[0].contractAddress
  );

  const selectedToken = useMemo(
    () =>
      tokens.find(
        (token) =>
          token.contractAddress.toLowerCase() ===
          selectedTokenAddress.toLowerCase()
      ) ?? tokens[0],
    [tokens, selectedTokenAddress]
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

  const sendNative = async (account: Hex) => {
    return writeContractAsync({
      abi: accountAbi,
      address: account,
      args: [
        recipient as Hex,
        parseUnits(inputValue, selectedToken.decimals),
        "0x"
      ],
      functionName: "executeTransaction"
    });
  };

  const sendErc20 = async (account: Hex) => {
    const callData = encodeFunctionData({
      abi: erc20Abi,
      args: [recipient as Hex, parseUnits(inputValue, selectedToken.decimals)],
      functionName: "transfer"
    });

    return writeContractAsync({
      abi: accountAbi,
      address: account,
      args: [selectedTokenAddress as Hex, 0n, callData],
      functionName: "executeTransaction"
    });
  };

  const handleSubmit = async () => {
    if (!currentAccount || !isAddress(recipient)) return;

    try {
      if (selectedTokenAddress === CONTRACTS.nativeToken) {
        await sendNative(currentAccount.address);
      } else {
        await sendErc20(currentAccount.address);
      }
    } catch (e) {
      console.error("handleSubmit: executeTransaction error=", e);
      toast.error("Failed to send tokens.");
      return;
    }

    toast.success("Tokens sent successfully!");
    setShowModal(false);
    setInputValue("");
    setRecipient("");
    track("Token operation", {
      sendTokens: selectedToken.symbol
    });
  };

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => setShowModal(true)}
        outline
        size="lg"
      >
        <ArrowRightIcon
          className="size-6 rounded-full border border-border bg-gray-50 p-1 dark:bg-gray-700"
          stroke="currentColor"
          strokeWidth={2}
        />
        Send
      </Button>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        size="xs"
        title="Send"
      >
        <div className="flex flex-col gap-y-3 p-5">
          <SearchAccounts
            error={recipient.length > 0 && !isAddress(recipient)}
            hideDropdown={isAddress(recipient)}
            onAccountSelected={(account) => setRecipient(account.address)}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder={`${ADDRESS_PLACEHOLDER} or wagmi`}
            value={recipient}
          />
          <div className="flex items-center gap-x-3">
            <Input
              inputMode="decimal"
              min={0}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0.5"
              type="number"
              value={inputValue}
            />
            <Select
              onChange={setSelectedTokenAddress}
              options={tokens.map((token) => ({
                label: token.symbol,
                selected: selectedTokenAddress === token.contractAddress,
                value: token.contractAddress
              }))}
            />
          </div>
          <div>
            Balance: {balance ? Number(balance.value).toFixed(4) : "0"}{" "}
            {balance && "asset" in balance ? balance.asset.symbol : ""}
          </div>
          <Button
            className="w-full"
            disabled={
              isPending ||
              !inputValue ||
              Number(inputValue) <= 0 ||
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
