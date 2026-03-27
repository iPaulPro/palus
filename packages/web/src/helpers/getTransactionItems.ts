import dayjs, { type Dayjs } from "dayjs";
import type { RefObject } from "react";
import { BLOCK_EXPLORER_API_URL } from "@/data/constants";
import {
  getTransactionLabel,
  getTransactionStatus,
  getTransactionValueDisplay,
  type ParsedTransaction,
  parseTransaction
} from "@/helpers/parseTransaction";
import type {
  BlockRange,
  Transaction,
  TransactionsResponse
} from "@/types/palus";

const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;

export type TransactionItem = {
  tx: Transaction;
  parsedTx: ParsedTransaction;
  isReceived: boolean;
  txValue: bigint;
  label: { value: string; detail?: string };
  status: "Confirmed" | "Failed";
  valueDisplay: string;
  date: Dayjs;
};

const toTransactionItem = (
  tx: Transaction,
  account: string
): TransactionItem => {
  const parsedTx = parseTransaction(tx);
  const isReceived =
    parsedTx.to.toLowerCase() === account.toLowerCase() ||
    tx.internal?.to.toLowerCase() === account.toLowerCase();
  const txValue = parsedTx.value;

  return {
    date: dayjs(tx.timeStamp ? Number(tx.timeStamp) * 1000 : tx.receivedAt),
    isReceived,
    label: getTransactionLabel(parsedTx, isReceived),
    parsedTx,
    status: getTransactionStatus(tx),
    tx,
    txValue,
    valueDisplay: getTransactionValueDisplay(
      txValue,
      isReceived,
      parsedTx.token
    )
  };
};

const getBlockNumberByTimestamp = async (
  timestamp: number
): Promise<number | null> => {
  try {
    const response = await fetch(
      `${BLOCK_EXPLORER_API_URL}/api?module=block&action=getblocknobytime&closest=before&timestamp=${timestamp}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== "1" || !data.result) {
      return null;
    }

    return Number(data.result);
  } catch {
    return null;
  }
};

const fetchTransaction = async (hash: string): Promise<Transaction | null> => {
  try {
    const response = await fetch(
      `${BLOCK_EXPLORER_API_URL}/transactions/${hash}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data as Transaction;
  } catch {
    return null;
  }
};

const fetchTransactionList = async (
  startBlock: number,
  endBlock: number,
  action: "txlist" | "txlistinternal",
  account: string
): Promise<Transaction[]> => {
  try {
    const response = await fetch(
      `${BLOCK_EXPLORER_API_URL}/api?module=account&action=${action}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&address=${account}&offset=1000`
    );

    if (!response.ok) return [];

    const data: TransactionsResponse = await response.json();

    if (data.status !== "1" || !Array.isArray(data.result)) {
      return [];
    }

    if (action === "txlistinternal") {
      const transactions = data.result as Transaction[];
      // get the parent tx for decoding each internal tx since the API doesn't include the input data
      const parentTxs = await Promise.all(
        transactions.map(async (tx) => {
          if (tx.input || tx.data) {
            return tx;
          }
          const fullTx = await fetchTransaction(tx.hash);
          return fullTx ? { ...fullTx, internal: tx } : tx; // fallback to original if fetch fails
        })
      );
      return parentTxs;
    }

    return data.result;
  } catch {
    return [];
  }
};

export const getTransactionItems = async (
  blockRange: BlockRange | null,
  account: string,
  seenRegularTxHashes: RefObject<Set<string>>
): Promise<{
  transactions: TransactionItem[];
  nextBlockRange: BlockRange | null;
}> => {
  let startBlock: number;
  let endBlock: number;
  let startBlockTimestamp: number;

  if (blockRange) {
    // Subsequent pages: use the previous startBlock - 1 as new endBlock
    // to avoid duplicates, and go back another week for startBlock
    endBlock = blockRange.startBlock - 1;

    if (endBlock <= 0) {
      return { nextBlockRange: null, transactions: [] };
    }

    // Calculate timestamp that's 1 week before the endBlock's timestamp
    // We approximate by subtracting ONE_WEEK_SECONDS from the previous range's start timestamp
    startBlockTimestamp = blockRange.startBlockTimestamp - ONE_WEEK_SECONDS;

    const weekBeforeBlock =
      await getBlockNumberByTimestamp(startBlockTimestamp);

    // If we can't get the block, use block 0 as the start
    startBlock = weekBeforeBlock ?? 0;
  } else {
    // First page: get block numbers for now and 1 week ago
    seenRegularTxHashes.current.clear();

    const now = Math.floor(Date.now() / 1000);
    startBlockTimestamp = now - ONE_WEEK_SECONDS;

    const [currentBlock, weekAgoBlock] = await Promise.all([
      getBlockNumberByTimestamp(now),
      getBlockNumberByTimestamp(startBlockTimestamp)
    ]);

    if (currentBlock === null || weekAgoBlock === null) {
      return { nextBlockRange: null, transactions: [] };
    }

    startBlock = weekAgoBlock;
    endBlock = currentBlock;
  }

  const [regularTxs, internalTxs] = await Promise.all([
    fetchTransactionList(startBlock, endBlock, "txlist", account),
    fetchTransactionList(startBlock, endBlock, "txlistinternal", account)
  ]);

  // Filter out duplicate transactions
  const uniqueTxs = regularTxs.filter(
    (tx) => !seenRegularTxHashes.current.has(tx.hash)
  );

  // Add all regular transaction hashes to the seen set
  for (const tx of uniqueTxs) {
    seenRegularTxHashes.current.add(tx.hash);
  }

  // Filter out internal transactions that share a hash with any regular transaction
  const uniqueInternalTxs = internalTxs.filter(
    (tx) => !seenRegularTxHashes.current.has(tx.hash)
  );

  // Merge and sort by timestamp descending
  const allTransactions = [...uniqueTxs, ...uniqueInternalTxs].sort((a, b) => {
    const aTime = a.timeStamp
      ? Number(a.timeStamp)
      : new Date(a.receivedAt ?? 0).getTime() / 1000;
    const bTime = b.timeStamp
      ? Number(b.timeStamp)
      : new Date(b.receivedAt ?? 0).getTime() / 1000;
    return bTime - aTime;
  });

  // We can continue if either list had transactions and startBlock > 0
  const hasMore =
    (regularTxs.length > 0 || internalTxs.length > 0) && startBlock > 0;

  return {
    nextBlockRange: hasMore
      ? { endBlock, startBlock, startBlockTimestamp }
      : null,
    transactions: allTransactions.map((tx) => toTransactionItem(tx, account))
  };
};
