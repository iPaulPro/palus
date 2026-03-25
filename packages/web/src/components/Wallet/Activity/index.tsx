import { ArrowsRightLeftIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useRef } from "react";
import { Link } from "react-router";
import { formatEther, type Hex } from "viem";
import { Virtualizer } from "virtua";
import PullToRefresh from "@/components/Shared/PullToRefresh";
import {
  EmptyState,
  ErrorMessage,
  Spinner,
  Tooltip
} from "@/components/Shared/UI";
import ActivityShimmer from "@/components/Wallet/Activity/Shimmer";
import { BLOCK_EXPLORER_API_URL, BLOCK_EXPLORER_URL } from "@/data/constants";
import { NATIVE_TOKEN_SYMBOL } from "@/data/tokens";
import cn from "@/helpers/cn";
import formatRelativeOrAbsolute from "@/helpers/datetime/formatRelativeOrAbsolute";
import { decodeDelegatedTransaction } from "@/helpers/decodeTransaction";
import {
  getTransactionLabel,
  getTransactionStatus,
  getTransactionValueDisplay
} from "@/helpers/parseTransaction";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import type {
  ActivityProps,
  BlockRange,
  Transaction,
  TransactionsResponse
} from "@/types/palus";

const GET_TRANSACTIONS_QUERY_KEY = "getTransactions";
const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;

const Activity = ({ account }: ActivityProps) => {
  const queryClient = useQueryClient();

  const seenRegularTxHashes = useRef(new Set<string>());

  const getBlockNumberByTimestamp = async (
    timestamp: number
  ): Promise<number | null> => {
    try {
      const response = await fetch(
        `${BLOCK_EXPLORER_API_URL}?module=block&action=getblocknobytime&closest=before&timestamp=${timestamp}`
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

  const fetchTransactionList = async (
    startBlock: number,
    endBlock: number,
    action: "txlist" | "txlistinternal"
  ): Promise<Transaction[]> => {
    try {
      const response = await fetch(
        `${BLOCK_EXPLORER_API_URL}?module=account&action=${action}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&address=${account}&offset=1000`
      );

      if (!response.ok) {
        return [];
      }

      const data: TransactionsResponse = await response.json();

      if (data.status !== "1" || !Array.isArray(data.result)) {
        return [];
      }

      return data.result;
    } catch {
      return [];
    }
  };

  const getTransactions = async (
    blockRange: BlockRange | null
  ): Promise<{
    transactions: Transaction[];
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
      fetchTransactionList(startBlock, endBlock, "txlist"),
      fetchTransactionList(startBlock, endBlock, "txlistinternal")
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
    const allTransactions = [...uniqueTxs, ...uniqueInternalTxs].sort(
      (a, b) => Number(b.timeStamp) - Number(a.timeStamp)
    );

    // We can continue if either list had transactions and startBlock > 0
    const hasMore =
      (regularTxs.length > 0 || internalTxs.length > 0) && startBlock > 0;

    return {
      nextBlockRange: hasMore
        ? { endBlock, startBlock, startBlockTimestamp }
        : null,
      transactions: allTransactions
    };
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery<
      {
        transactions: Transaction[];
        nextBlockRange: BlockRange | null;
      },
      Error
    >({
      enabled: Boolean(account),
      getNextPageParam: (lastPage) => lastPage.nextBlockRange,
      initialPageParam: null as BlockRange | null,
      queryFn: ({ pageParam }) =>
        getTransactions(pageParam as BlockRange | null),
      queryKey: [GET_TRANSACTIONS_QUERY_KEY, account]
    });

  const transactions = data?.pages.flatMap((page) => page.transactions) ?? [];

  const handleEndReached = useCallback(async () => {
    if (hasNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  const handleRefresh = useCallback(async () => {
    seenRegularTxHashes.current.clear();
    await queryClient.resetQueries({
      queryKey: [GET_TRANSACTIONS_QUERY_KEY, account]
    });
  }, [queryClient, account]);

  if (isLoading) {
    return <ActivityShimmer />;
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load transactions"
      />
    );
  }

  if (!transactions.length) {
    return (
      <div className="p-5">
        <EmptyState
          hideCard
          icon={<ArrowsRightLeftIcon className="size-8" />}
          message="No transactions."
        />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="h-full overflow-y-auto bg-card">
        <Virtualizer>
          {transactions.map((tx) => {
            const decodedTx = tx.input
              ? decodeDelegatedTransaction(tx.input as Hex)
              : null;

            // For determining received value when withdrawing wrapped tokens
            const actionWads =
              decodedTx?.decodedActions?.reduce(
                (acc, action) => acc + BigInt(action.parameters?.wad ?? "0"),
                0n
              ) ?? 0n;

            const isReceived = decodedTx
              ? decodedTx?.decodedActions?.[0]?.target?.toLowerCase() ===
                  account.toLowerCase() || actionWads > 0n
              : tx.to.toLowerCase() === account.toLowerCase();

            const txValue =
              BigInt(decodedTx?.value ?? "0") ||
              decodedTx?.transactions?.reduce(
                (acc, t) => acc + BigInt(t?.value ?? "0"),
                0n
              ) ||
              actionWads ||
              BigInt(tx.value ?? "0");
            const label = getTransactionLabel(
              decodedTx,
              tx,
              isReceived,
              txValue
            );
            const status = getTransactionStatus(tx);
            const value = getTransactionValueDisplay(txValue, isReceived);
            const date = dayjs(Number(tx.timeStamp) * 1000);

            return (
              <Link
                className={
                  "mb-1 flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-300/20 sm:p-2"
                }
                key={`${tx.hash}-${tx.to}`}
                rel="noreferrer noopener"
                target="_blank"
                to={`${BLOCK_EXPLORER_URL}/tx/${tx.hash}`}
              >
                <div className="flex min-w-0 items-center gap-x-2">
                  {txValue > 0n ? (
                    <ArrowsRightLeftIcon className="size-7 rounded-full bg-gray-200 p-1 text-gray-600 dark:bg-gray-700 dark:text-gray-400" />
                  ) : label.detail ? (
                    <svg
                      className="size-7 rounded-full bg-gray-200 p-1.5 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 204 130"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Lens Logo</title>
                      <path
                        clipRule="evenodd"
                        d="M140.236 34.2127C148.585 27.1958 157.901 24.5261 166.835 25.201C176.365 25.9209 185.184 30.4204 191.77 36.956C198.357 43.492 202.881 52.2342 203.606 61.6691C204.336 71.19 201.172 81.1618 192.828 89.9136C192.064 90.7192 191.284 91.5148 190.488 92.3003C152.642 129.852 102.368 129.951 101.854 129.951H101.851C101.595 129.951 51.1619 129.949 13.2174 92.2951L13.2091 92.2868C12.4258 91.5047 11.6543 90.7177 10.8946 89.9256L10.8884 89.9192C2.54038 81.175 -0.627422 71.2055 0.101149 61.6848C0.823023 52.2515 5.3448 43.5082 11.9292 36.9699C18.5132 30.432 27.3314 25.929 36.8631 25.206C45.7966 24.5283 55.1141 27.1948 63.4682 34.2084C64.3665 23.3909 69.0465 14.9717 75.8401 9.1837C83.0857 3.0105 92.5278 0 101.852 0C111.176 0 120.618 3.0105 127.864 9.1837C134.658 14.9725 139.338 23.3931 140.236 34.2127Z"
                        fill="currentColor"
                        fillRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <CpuChipIcon className="size-7 rounded-full bg-gray-200 p-1 text-gray-600 dark:bg-gray-700 dark:text-gray-400" />
                  )}
                  <div className="flex min-w-0 flex-col">
                    {label.detail ? (
                      <div className="flex min-w-0 items-center gap-x-1 truncate">
                        <span className="truncate font-medium">
                          {label.detail}
                        </span>
                        <span className="flex-none rounded-md bg-gray-200 px-1 text-secondary text-sm dark:bg-gray-800">
                          {label.label}
                        </span>
                      </div>
                    ) : (
                      <span className="truncate font-medium">
                        {label.label}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        status === "Confirmed"
                          ? "text-green-600"
                          : status === "Failed"
                            ? "text-red-600"
                            : "text-yellow-600"
                      )}
                    >
                      {status}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex flex-none flex-col items-end">
                  <span>
                    <Tooltip
                      content={date.format("MMM D, YYYY h:mm A")}
                      placement="left"
                    >
                      <div className="text-secondary text-sm">
                        {formatRelativeOrAbsolute(date.toISOString())}
                      </div>
                    </Tooltip>
                  </span>
                  <Tooltip
                    content={`${formatEther(txValue).toString()} ${NATIVE_TOKEN_SYMBOL}`}
                    placement="left"
                  >
                    <span
                      className={cn(
                        "font-medium",
                        txValue === 0n
                          ? "text-secondary"
                          : isReceived
                            ? "text-green-600"
                            : "text-red-600"
                      )}
                    >
                      {value}
                    </span>
                  </Tooltip>
                </div>
              </Link>
            );
          })}
          {hasNextPage && <div className="h-0.5" ref={loadMoreRef} />}
          {isFetching && !isLoading && (
            <div className="flex justify-center p-5">
              <Spinner size="sm" />
            </div>
          )}
        </Virtualizer>
      </div>
    </PullToRefresh>
  );
};

export default Activity;
