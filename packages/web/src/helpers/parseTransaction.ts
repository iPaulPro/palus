import { decodeAbiParameters, formatUnits, type Hex } from "viem";
import { CONTRACTS } from "@/data/contracts";
import { findToken, type Token } from "@/data/tokens";
import {
  type DecodedTransaction,
  decodeDelegatedTransaction
} from "@/helpers/decodeTransaction";
import { encodeParamKey } from "@/helpers/encodeParamKey";
import formatAddress from "@/helpers/formatAddress";
import { formatWithZeroSubscript } from "@/helpers/formatValues";
import nFormatter from "@/helpers/nFormatter";
import type { Transaction } from "@/types/palus";

const TOKEN_PARAM_KEY = encodeParamKey("lens.param.token");
const AMOUNT_PARAM_KEY = encodeParamKey("lens.param.amount");

export type ParsedTransaction = {
  /**
   * For regular transactions, this is the signer. For decoded transactions, this is the
   * account address.
   */
  from: string;

  /**
   * For regular transactions, this is the account address. For decoded transactions, this
   * is the target contract.
   */
  to: string;

  /**
   * For regular transactions, this is the native value. For decoded transactions, this is
   * any value found in the actions.
   */
  value: bigint;

  /**
   * For transactions with value, this is "in" if the account was the receiver, "out" if
   * the account was the sender, and "swap" in cases like wrap/unwrap
   */
  flow: "in" | "out" | "swap";

  /**
   * For regular transactions, this is the native token if there's a value. For decoded
   * transactions, this is the token involved in the transaction, if any.
   */
  token?: Token;

  /**
   * For regular transactions, this is undefined. For decoded transactions, it may be "ERC-20"
   * or one of the known Lens Protocol contracts (eg. "Feed", "Namespace")
   */
  contractType?: string;

  /**
   * For regular transactions, this is undefined. For decoded transactions, it's the function
   * name of the action, if any.
   */
  action?: string;

  /**
   * For regular transactions, this is undefined. For decoded transactions, it's the contract
   * address of the inner action, if any.
   */
  actionContract?: string;
};

export const camelToCapitalized = (str: string): string => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

const getReceivedInnerAction = (from: string): string | undefined => {
  switch (from) {
    case CONTRACTS.simpleCollectAction:
      return "Post Collected";
    case CONTRACTS.tippingPostAction:
      return "Post Tip";
    case CONTRACTS.tippingAccountAction:
      return "Account Tip";
    default:
      return undefined;
  }
};

const getSentInnerAction = (actionContract: string): string | undefined => {
  switch (actionContract) {
    case CONTRACTS.pollVoteAction:
      return "Voted on a Poll";
    case CONTRACTS.simpleCollectAction:
      return "Collected a Post";
    case CONTRACTS.tippingPostAction:
      return "Tipped a Post";
    case CONTRACTS.tippingAccountAction:
      return "Tipped an Account";
    case CONTRACTS.pinPostAccountAction:
      return "Pinned a Post";
    default:
      return undefined;
  }
};

const getValue = (o: any | undefined): string | undefined => {
  if (!o) return undefined;
  if (o.value === undefined || o.value === "0") return undefined;
  return o.value as string;
};

export const parseTransaction = (
  tx: Transaction,
  account: string
): ParsedTransaction => {
  let decodedTx: DecodedTransaction | null = null;
  try {
    const data = tx.input ?? tx.data;
    decodedTx =
      data !== "0x" && data !== ""
        ? decodeDelegatedTransaction(data as Hex)
        : null;
  } catch {
    // ignore
  }

  if (!decodedTx || decodedTx.error) {
    return {
      flow: tx.to.toLowerCase() === account.toLowerCase() ? "in" : "out",
      from: tx.from,
      to: tx.to,
      token: tx.value ? findToken(CONTRACTS.nativeToken) : undefined,
      value: BigInt(tx.value ?? 0)
    };
  }

  const firstAction =
    decodedTx.decodedActions.length > 1
      ? decodedTx.decodedActions.find(
          (action) =>
            action.action === "executePostAction" ||
            action.action === "executeAccountAction"
        )
      : decodedTx.decodedActions[0];

  const tokenParam = firstAction?.parameters?.params?.find(
    (param: { key: any }) => param.key === TOKEN_PARAM_KEY
  );
  const tokenParamAddress = tokenParam?.value
    ? decodeAbiParameters([{ type: "address" }], tokenParam.value as Hex)[0]
    : undefined;
  const tokenAddress = decodedTx.target ?? tokenParamAddress;
  const token = tokenAddress ? findToken(tokenAddress) : undefined;

  const amountParam = firstAction?.parameters?.params?.find(
    (param: { key: any }) => param.key === AMOUNT_PARAM_KEY
  );

  // For determining received value when withdrawing wrapped tokens
  const actionWads = decodedTx?.decodedActions?.[0].parameters?.wad;

  const firstInternal =
    decodedTx.transactions?.length === 1
      ? decodedTx.transactions?.[0]
      : undefined;

  const actionTransfer = decodedTx.decodedActions.find(
    (da) => da.action === "transfer"
  )?.parameters?.amount;

  const value =
    getValue(decodedTx) ??
    getValue(tx.internal) ??
    getValue(amountParam) ??
    getValue(firstInternal) ??
    actionTransfer ??
    actionWads ??
    tx.value;

  const target = decodedTx.target ?? decodedTx.transactions?.[0].target;

  const isReceived =
    target?.toLowerCase() === account.toLowerCase() ||
    tx.internal?.to.toLowerCase() === account.toLowerCase();

  return {
    action: firstAction?.action,
    actionContract: firstAction?.parameters?.action,
    contractType: firstAction?.contractType,
    flow: isReceived
      ? "in"
      : firstAction?.action === "withdraw" || firstAction?.action === "deposit"
        ? "swap"
        : "out",
    from: target ? tx.to : tx.from,
    to: target ?? tx.to,
    token,
    value: BigInt(value ?? "0")
  };
};

export const getTransactionLabel = (
  parsedTx: ParsedTransaction,
  flow: "in" | "out" | "swap"
): { value: string; detail?: string } => {
  const token = parsedTx.token;
  const isReceived = flow === "in";
  const transferLabel = `${isReceived ? "Received" : "Sent"} ${token?.symbol || "ERC-20"}`;

  // Transactions with value but no action
  if (
    parsedTx.action === "transfer" ||
    (parsedTx.value > 0n && !parsedTx.action)
  ) {
    return {
      detail: token ? undefined : formatAddress(parsedTx.to),
      value: transferLabel
    };
  }

  const innerAction = parsedTx.actionContract
    ? isReceived
      ? getReceivedInnerAction(parsedTx.actionContract)
      : getSentInnerAction(parsedTx.actionContract)
    : undefined;

  // Decoded transactions with action
  if (parsedTx.contractType && parsedTx.action) {
    let action = parsedTx.action;
    if (action === "withdraw") {
      action = "unwrap";
    } else if (action === "deposit") {
      action = "wrap";
    }
    return {
      detail:
        (parsedTx.contractType === "ERC-20" && parsedTx.token?.symbol) ||
        parsedTx.contractType,
      value: innerAction ?? camelToCapitalized(action)
    };
  }

  return {
    detail: formatAddress(parsedTx.to),
    value: "Contract Interaction"
  };
};

export const getTransactionStatus = (
  tx: Transaction
): "Confirmed" | "Failed" => {
  if ("isError" in tx) {
    return tx.isError === "0" ? "Confirmed" : "Failed";
  }
  return tx.error ? "Failed" : "Confirmed";
};

export const getTransactionValueDisplay = (
  value: bigint,
  flow: "in" | "out" | "swap",
  token?: Token
) => {
  if (value === 0n) {
    return "$0.00";
  }

  const isStable =
    token?.contractAddress === CONTRACTS.usdc ||
    token?.contractAddress === CONTRACTS.wrappedNativeToken ||
    token?.contractAddress === CONTRACTS.nativeToken;
  const formatted = formatUnits(value, token?.decimals ?? 18);
  const prefix = flow === "in" ? "+" : flow === "out" ? "-" : "";
  const num = Number.parseFloat(formatted);

  if (num > 1_000_000) {
    return `${prefix}${isStable ? "$" : ""}${nFormatter(num)}`;
  }

  const [, frac = ""] = formatted.split(".");
  const len = frac.length;
  if (len > 5) {
    return `${prefix}${isStable ? "$" : ""}${formatWithZeroSubscript(formatted)}`;
  }

  if (len <= 2) {
    const n = Intl.NumberFormat("default", {
      minimumFractionDigits: isStable ? 2 : 0,
      roundingMode: "floor"
    }).format(num);
    return `${prefix}${isStable ? "$" : ""}${n}`;
  }

  return `${prefix}${isStable ? "$" : ""}${formatted}`;
};
