import type { AccountFragment, PostFragment } from "@palus/indexer";
import { decodeAbiParameters, keccak256, stringToBytes } from "viem";
import { useReadContracts } from "wagmi";
import { pollVoteAction } from "@/components/Post/OpenAction/PollAction/pollVoteAction";
import { CONTRACTS } from "@/data/contracts";
import type { Poll } from "@/types/palus";

const useDecodePoll = (
  post: PostFragment,
  account: AccountFragment | undefined
): {
  isLoading: boolean;
  optionsCount: number;
  poll: Poll | null;
  refetch: () => void;
} => {
  const contract = {
    abi: pollVoteAction,
    address: CONTRACTS.pollVoteAction
  } as const;

  const unknownActions =
    post.__typename === "Post"
      ? post.actions.filter(
          (action) => action.__typename === "UnknownPostAction"
        )
      : null;
  const pollAction = unknownActions?.find(
    (action) => action.address === CONTRACTS.pollVoteAction
  );

  const encodedOptions = pollAction?.config.find(
    (rawKeyValue) =>
      rawKeyValue.key === keccak256(stringToBytes("lens.param.options"))
  );
  const decodedOptions = decodeAbiParameters(
    [{ type: "string[]" }],
    encodedOptions?.data
  );

  const encodedEndTimestamp = pollAction?.config.find(
    (rawKeyValue) =>
      rawKeyValue.key === keccak256(stringToBytes("lens.param.endTimestamp"))
  );
  const decodedEndTimestamp = decodeAbiParameters(
    [{ type: "uint256" }],
    encodedEndTimestamp?.data
  );

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        ...contract,
        args: [post.feed.address, post.id],
        functionName: "getVoteCounts"
      },
      {
        ...contract,
        args: [post.feed.address, post.id, account?.address],
        functionName: "hasVoted"
      },
      {
        ...contract,
        args: [post.feed.address, post.id, account?.address],
        functionName: "getVotedOption"
      }
    ],
    query: {
      enabled: Boolean(account?.address)
    }
  });

  const options = decodedOptions[0];
  const endsAt = decodedEndTimestamp[0];
  const voteCounts = data?.[0].result as bigint[] | undefined;
  const hasVoted = data?.[1].result as boolean | undefined;
  const votedOption = data?.[2].result as number | undefined;

  if (!options) {
    return { isLoading: false, optionsCount: 0, poll: null, refetch: () => {} };
  }

  const poll: Poll = {
    endsAt: endsAt ? new Date(Number(endsAt) * 1000) : new Date(),
    id: post.id,
    options:
      options && voteCounts
        ? options.map((text, index) => ({
            id: index,
            text,
            voteCount: Number(voteCounts[index]),
            voted: Boolean(hasVoted) && votedOption === index
          }))
        : []
  };

  return { isLoading, optionsCount: options.length, poll, refetch };
};

export default useDecodePoll;
