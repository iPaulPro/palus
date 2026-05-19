import { MenuItem } from "@headlessui/react";
import type { PostFragment } from "@palus/indexer";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { PinIconFilled } from "@/components/Shared/Icons/PinIconFilled";
import { PinIconOutline } from "@/components/Shared/Icons/PinIconOutline";
import Loader from "@/components/Shared/Loader";
import { pinPostAccountActionAbi } from "@/data/abis/pinPostAccountActionAbi";
import { CHAIN } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { usePinPostModalStore } from "@/store/non-persisted/modal/usePinPostModalStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface Props {
  post: PostFragment;
}

const PinPost = ({ post }: Props) => {
  const { currentAccount } = useAccountStore();

  const [isPinned, setIsPinned] = useState(false);
  const { setShowPinPostModal } = usePinPostModalStore();

  const { data: pinnedPost, isFetching } = useReadContract({
    abi: pinPostAccountActionAbi,
    address: CONTRACTS.pinPostAccountAction,
    args: [post.author.address],
    chainId: CHAIN.id,
    functionName: "pinnedPosts",
    query: {
      enabled: currentAccount?.address === post.author.address
    }
  });

  useEffect(() => {
    setIsPinned(post.id === pinnedPost?.toString());
  }, [pinnedPost, post.id]);

  if (currentAccount?.address !== post.author.address) {
    return null;
  }

  if (isFetching) {
    return (
      <div className="m-2 flex items-center gap-x-2 rounded-lg px-1 py-1.5 text-sm">
        <Loader small />
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { "dropdown-active": focus },
          "m-2 block cursor-pointer rounded-lg px-2 py-1.5 text-sm"
        )
      }
      onClick={(event) => {
        stopEventPropagation(event);
        setShowPinPostModal(true, post, isPinned);
      }}
    >
      <div className="flex items-center gap-x-2">
        {isPinned ? (
          <>
            <PinIconFilled className="size-4" />
            <div>Unpin from profile</div>
          </>
        ) : (
          <>
            <PinIconOutline className="size-4" />
            <div>Pin to profile</div>
          </>
        )}
      </div>
    </MenuItem>
  );
};

export default PinPost;
