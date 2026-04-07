import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import {
  type PostFragment,
  useWhoExecutedActionOnPostQuery,
  WhoExecutedActionOnPostOrderBy,
  type WhoExecutedActionOnPostRequest
} from "@palus/indexer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Address } from "viem";
import { Virtualizer } from "virtua";
import { useReadContracts } from "wagmi";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import AccountListShimmer from "@/components/Shared/Shimmer/AccountListShimmer";
import { EmptyState, ErrorMessage, Tabs } from "@/components/Shared/UI";
import { pollVoteActionAbi } from "@/data/abis/pollVoteActionAbi";
import { CHAIN } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import cn from "@/helpers/cn";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { Poll } from "@/types/palus";

interface VotersProps {
  poll: Poll;
  post: PostFragment;
}

const contract = {
  abi: pollVoteActionAbi,
  address: CONTRACTS.pollVoteAction,
  chainId: CHAIN.id
} as const;

const Voters = ({ poll, post }: VotersProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [votedOptionsMap, setVotedOptionsMap] = useState<Map<Address, number>>(
    new Map()
  );
  const fetchedAddressesRef = useRef<Set<Address>>(new Set());
  const { currentAccount } = useAccountStore();

  const request: WhoExecutedActionOnPostRequest = useMemo(
    () => ({
      filter: { anyOf: [{ address: CONTRACTS.pollVoteAction }] },
      orderBy: WhoExecutedActionOnPostOrderBy.AccountScore,
      post: post.id
    }),
    [post.id]
  );

  const { data, error, fetchMore, loading } = useWhoExecutedActionOnPostQuery({
    skip: !post.id,
    variables: { request }
  });

  const tabs = poll.options.map((option) => ({
    name: `${option.text.length > 15 ? `${option.text.slice(0, 15).trim()}…` : option.text} (${option.voteCount})`,
    type: option.id.toString()
  }));

  const accounts = data?.whoExecutedActionOnPost?.items;
  const pageInfo = data?.whoExecutedActionOnPost?.pageInfo;
  const hasMore = pageInfo?.next;

  // Deduplicate accounts (Apollo merge can sometimes create duplicates)
  const uniqueAccounts = useMemo(() => {
    if (!accounts) return [];
    const seen = new Set<Address>();
    return accounts.filter((action) => {
      if (seen.has(action.account.address)) return false;
      seen.add(action.account.address);
      return true;
    });
  }, [accounts]);

  // Find accounts that we haven't fetched voted options for yet
  const newAccounts = useMemo(
    () =>
      uniqueAccounts.filter(
        (action) => !fetchedAddressesRef.current.has(action.account.address)
      ),
    [uniqueAccounts]
  );

  // Capture the addresses for the current batch - this stays stable with contracts
  const pendingAddresses = useMemo(
    () => newAccounts.map((action) => action.account.address),
    [newAccounts]
  );

  // Create a stable query key based on the addresses being fetched
  const queryKey = useMemo(
    () => pendingAddresses.join(","),
    [pendingAddresses]
  );

  // Track which query we've already processed
  const processedQueryKeyRef = useRef<string>("");

  const contracts = useMemo(
    () =>
      newAccounts.map((action) => ({
        ...contract,
        args: [post.feed.address, post.id, action.account.address],
        functionName: "getVotedOption" as const
      })),
    [newAccounts, post.feed.address, post.id]
  );

  const {
    data: votedOptions,
    dataUpdatedAt,
    isFetching,
    isSuccess
  } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0 }
  });

  // Track the last dataUpdatedAt we processed to avoid reprocessing same data
  const lastProcessedTimestampRef = useRef<number>(0);

  // Merge new voted options into the map
  useEffect(() => {
    if (
      isFetching ||
      !isSuccess ||
      !votedOptions ||
      pendingAddresses.length === 0 ||
      votedOptions.length !== pendingAddresses.length ||
      lastProcessedTimestampRef.current === dataUpdatedAt ||
      processedQueryKeyRef.current === queryKey
    ) {
      return;
    }

    const newEntries: [Address, number][] = [];
    for (let i = 0; i < pendingAddresses.length; i++) {
      const address = pendingAddresses[i];
      if (fetchedAddressesRef.current.has(address)) continue;

      const result = votedOptions[i]?.result;
      if (result !== undefined && typeof result === "number") {
        newEntries.push([address, result]);
        fetchedAddressesRef.current.add(address);
      }
    }

    // Mark as processed even if no new entries (to prevent re-running)
    processedQueryKeyRef.current = queryKey;
    lastProcessedTimestampRef.current = dataUpdatedAt;

    if (newEntries.length > 0) {
      setVotedOptionsMap((prev) => {
        const updated = new Map(prev);
        for (const [addr, option] of newEntries) {
          updated.set(addr, option);
        }
        return updated;
      });
    }
  }, [
    votedOptions,
    isSuccess,
    isFetching,
    pendingAddresses,
    queryKey,
    dataUpdatedAt
  ]);

  const filteredAccounts = useMemo(() => {
    if (votedOptionsMap.size === 0) return uniqueAccounts;

    return uniqueAccounts.filter((action) => {
      const votedOption = votedOptionsMap.get(action.account.address);
      return votedOption === activeTab;
    });
  }, [uniqueAccounts, activeTab, votedOptionsMap]);

  const handleEndReached = useCallback(async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  }, [fetchMore, hasMore, pageInfo?.next, request]);

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  if (loading || (isFetching && votedOptionsMap.size === 0)) {
    return <AccountListShimmer />;
  }

  if (!accounts?.length) {
    return (
      <div className="p-5">
        <EmptyState
          hideCard
          icon={<Bars3BottomLeftIcon className="size-8" />}
          message="No votes yet"
        />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load voters"
      />
    );
  }

  return (
    <div className="flex h-[60vh] flex-col">
      <div className="divider p-2">
        <Tabs
          active={activeTab.toString()}
          layoutId="voters-tabs"
          setActive={(type) => setActiveTab(Number(type))}
          tabs={tabs}
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        {filteredAccounts.length === 0 ? (
          <div className="center flex h-full p-5">
            <EmptyState
              hideCard
              icon={<Bars3BottomLeftIcon className="size-8" />}
              message="No votes for this option"
            />
          </div>
        ) : (
          <Virtualizer>
            {filteredAccounts.map((action, index) => (
              <div
                className={cn(
                  "divider p-5",
                  index === filteredAccounts.length - 1 && "border-b-0"
                )}
                key={action.account.address}
              >
                <SingleAccount
                  account={action.account}
                  hideFollowButton={
                    currentAccount?.address === action.account.address
                  }
                  hideUnfollowButton={
                    currentAccount?.address === action.account.address
                  }
                  showUserPreview
                />
              </div>
            ))}
            {hasMore && <div className="h-0.5" ref={loadMoreRef} />}
          </Virtualizer>
        )}
      </div>
    </div>
  );
};

export default Voters;
