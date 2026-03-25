import { formatEther } from "viem";
import { NATIVE_TOKEN_SYMBOL } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import type { DecodedTransaction } from "@/helpers/decodeTransaction";
import type { Transaction } from "@/types/palus";

export const camelToCapitalized = (str: string): string => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

const getActionFromContract = (tx: Transaction): string | undefined => {
  if (tx.from === CONTRACTS.simpleCollectAction) return "Post collected";
  if (tx.from === CONTRACTS.tippingPostAction) return "Post tip";
  if (tx.to === CONTRACTS.actionHub) return "Acted on a post";
  return undefined;
};

const getActionFromDecodedTx = (firstAction: any): string | undefined => {
  if (firstAction?.action !== "executePostAction") return firstAction?.action;

  const postActionContract = firstAction.parameters?.action;
  switch (postActionContract) {
    case CONTRACTS.pollVoteAction:
      return "Voted on a poll";
    case CONTRACTS.simpleCollectAction:
      return "Collected a post";
    case CONTRACTS.tippingPostAction:
      return "Tipped a post";
    case CONTRACTS.tippingAccountAction:
      return "Tipped an account";
    default:
      return undefined;
  }
};

export const getTransactionLabel = (
  decodedTx: DecodedTransaction | null,
  tx: Transaction,
  isReceived: boolean,
  value: bigint
): { label: string; detail?: string } => {
  const nativeLabel = `${isReceived ? "Received" : "Sent"} ${NATIVE_TOKEN_SYMBOL}`;

  // Internal transactions with value
  if (!decodedTx && value) {
    const action = getActionFromContract(tx);
    if (!action) return { label: nativeLabel };
    return { detail: nativeLabel, label: action };
  }

  const firstAction = decodedTx?.decodedActions[0];
  const action = firstAction ? getActionFromDecodedTx(firstAction) : undefined;

  // Transactions with value but no action
  if (value > 0n && !action) {
    return { label: nativeLabel };
  }

  // Decoded transactions with action
  if (firstAction?.contractType && action) {
    return {
      detail: firstAction.contractType,
      label: camelToCapitalized(action)
    };
  }

  return { label: decodedTx ? "Contract interaction" : "Internal transaction" };
};

export const getTransactionStatus = (
  tx: Transaction
): "Confirmed" | "Pending" | "Failed" => {
  const isInternalTx = !tx.input || tx.type === "call";
  if (isInternalTx) {
    return tx.isError === "0" ? "Confirmed" : "Failed";
  }
  return Number(tx.confirmations) > 0 ? "Confirmed" : "Pending";
};

export const getTransactionValueDisplay = (
  value: bigint,
  isReceived: boolean
) => {
  if (value === 0n) {
    return "$0.00";
  }
  const formatted = formatEther(value);
  const prefix = isReceived ? "+" : "-";
  const num = Number.parseFloat(formatted);
  const parts = formatted.split(".");
  const frac = parts[1] ?? "";
  const fracNoTrailing = frac.replace(/0+$/, "");
  if (fracNoTrailing.length <= 2) {
    return `${prefix}$${num.toFixed(2)}`;
  }
  const decimals =
    fracNoTrailing.length <= 6 ? Math.min(6, fracNoTrailing.length) : 2;
  return `${prefix}$${num.toFixed(decimals)}`;
};
