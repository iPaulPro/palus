import type { PostFragment } from "@palus/indexer";
import Choices from "@/components/Post/OpenAction/PollAction/Choices";
import PollActionShimmer from "@/components/Post/OpenAction/PollAction/Shimmer";
import useDecodePoll from "@/components/Post/OpenAction/PollAction/useDecodePoll";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface PollActionProps {
  post: PostFragment;
}

const PollAction = ({ post }: PollActionProps) => {
  const { currentAccount } = useAccountStore();

  const { isLoading, optionsCount, poll, refetch } = useDecodePoll(
    post,
    currentAccount
  );

  if (isLoading) {
    return <PollActionShimmer optionCount={optionsCount} />;
  }

  if (!poll) {
    return null;
  }

  return <Choices onVoteSuccess={refetch} poll={poll} />;
};

export default PollAction;
