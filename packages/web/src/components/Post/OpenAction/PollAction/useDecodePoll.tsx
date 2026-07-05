import type { AccountFragment, PostFragment } from "@palus/indexer";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { decodeAbiParameters, keccak256, stringToBytes } from "viem";
import { useConfig, useReadContracts } from "wagmi";
import { readContractsQueryOptions } from "wagmi/query";
import { pollVoteActionAbi } from "@/data/abis/pollVoteActionAbi";
import { CHAIN } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import type { Poll } from "@/types/palus";

const OPTIONS_KEY = keccak256(stringToBytes("lens.param.options"));
const END_TS_KEY = keccak256(stringToBytes("lens.param.endTimestamp"));
const ALLOW_MULTIPLE_ANSWERS_KEY = keccak256(
  stringToBytes("lens.param.allowMultipleAnswers")
);

const contract = {
  abi: pollVoteActionAbi,
  address: CONTRACTS.pollVoteAction,
  chainId: CHAIN.id
} as const;

const useDecodePoll = (
  post: PostFragment,
  account: AccountFragment | undefined
) => {
  const config = useConfig();
  const queryClient = useQueryClient();

  const pollAction = useMemo(() => {
    if (post.__typename !== "Post") return null;

    return (
      post.actions
        .filter((a) => a.__typename === "UnknownPostAction")
        .find((a) => a.address === CONTRACTS.pollVoteAction) ?? null
    );
  }, [post.__typename, post.actions]);

  const { options, endsAtSeconds, allowMultipleAnswers } = useMemo(() => {
    const config = pollAction?.config;
    if (!config) {
      return {
        allowMultipleAnswers: false,
        endsAtSeconds: null as bigint | null,
        options: null as string[] | null
      };
    }

    const encodedOptions = config.find((kv) => kv.key === OPTIONS_KEY)?.data;
    const encodedEndTimestamp = config.find(
      (kv) => kv.key === END_TS_KEY
    )?.data;
    const encodedAllowMultipleAnswers = config.find(
      (kv) => kv.key === ALLOW_MULTIPLE_ANSWERS_KEY
    )?.data;

    const options = encodedOptions
      ? (decodeAbiParameters(
          [{ type: "string[]" }],
          encodedOptions
        )[0] as string[])
      : null;

    const endsAtSeconds = encodedEndTimestamp
      ? (decodeAbiParameters(
          [{ type: "uint256" }],
          encodedEndTimestamp
        )[0] as bigint)
      : null;

    const allowMultipleAnswers = encodedAllowMultipleAnswers
      ? (decodeAbiParameters(
          [{ type: "bool" }],
          encodedAllowMultipleAnswers
        )[0] as boolean)
      : false;

    return { allowMultipleAnswers, endsAtSeconds, options };
  }, [pollAction?.config]);

  const accountAddress = account?.address;

  const contracts = useMemo(() => {
    return [
      {
        ...contract,
        args: [post.feed.address, post.id],
        functionName: "getVoteCounts" as const
      },
      {
        ...contract,
        args: [post.feed.address, post.id, accountAddress],
        functionName: "hasVoted" as const
      },
      {
        ...contract,
        args: [post.feed.address, post.id, accountAddress],
        functionName: "getVotedOption" as const
      },
      {
        ...contract,
        args: [post.feed.address, post.id, accountAddress],
        functionName: "getVotedOptions" as const
      }
    ];
  }, [post.feed.address, post.id, accountAddress]);

  const queryOptions = useMemo(() => ({ contracts }), [contracts]);

  const { data, isLoading, refetch } = useReadContracts(queryOptions);

  const updatePollCache = (votedOptions: number[]) => {
    const { queryKey } = readContractsQueryOptions(config, {
      ...queryOptions,
      chainId: CHAIN.id
    });

    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData;

      const newData = [...oldData];

      if (newData[0]?.result) {
        const counts = [...(newData[0].result as bigint[])];
        for (const option of votedOptions) {
          counts[option] = (counts[option] || 0n) + 1n;
        }
        newData[0] = { ...newData[0], result: counts };
      }

      newData[1] = { ...newData[1], result: true, status: "success" };

      newData[2] = {
        ...newData[2],
        result: votedOptions,
        status: "success"
      };

      return newData;
    });
  };

  const poll = useMemo<Poll | null>(() => {
    if (!options) return null;

    const voteCounts = data?.[0].result as bigint[] | undefined;
    const hasVoted = data?.[1].result as boolean | undefined;
    const votedOption = data?.[2].result as number | undefined;
    const votedOptions = data?.[3].result as boolean[] | undefined;

    const endsAt = endsAtSeconds
      ? new Date(Number(endsAtSeconds) * 1000)
      : new Date();

    return {
      allowMultipleAnswers,
      endsAt,
      id: post.id,
      options: options.map((text, id) => ({
        id,
        text,
        voteCount: Number(voteCounts?.[id] ?? 0n),
        voted: allowMultipleAnswers
          ? votedOptions?.[id] === true
          : Boolean(hasVoted) && votedOption === id
      }))
    };
  }, [options, endsAtSeconds, data, post.id, allowMultipleAnswers]);

  return {
    isLoading,
    poll,
    refetch,
    updatePollCache
  };
};

export default useDecodePoll;
