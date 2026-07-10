import { MenuItem } from "@headlessui/react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import Loader from "@/components/Shared/Loader";
import cn from "@/helpers/cn";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import useMakePostCollectible from "@/hooks/useMakePostCollectible";
import { useCollectFormModalStore } from "@/store/non-persisted/modal/useCollectFormModalStore";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";

interface Props {
  post: PostFragment;
}

const MakeCollectible = ({ post }: Props) => {
  const { setShowCollectFormModal, submittingPost } =
    useCollectFormModalStore();
  const { submit, isSubmitting } = useMakePostCollectible({ post });
  const { reset } = useCollectActionStore((state) => state);

  if (
    post.actions.find((action) => action.__typename === "SimpleCollectAction")
  ) {
    return null;
  }

  if (isSubmitting) {
    return (
      <div className="m-2 flex items-center gap-x-2 rounded-lg px-1 py-1.5 text-sm">
        <Loader small />
        <span>Making collectible…</span>
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
      disabled={Boolean(submittingPost)}
      onClick={(event) => {
        stopEventPropagation(event);
        reset();
        setShowCollectFormModal(true, submit);
      }}
    >
      <div className="flex items-center gap-x-2">
        <ShoppingBagIcon className="size-4" />
        <div>Make collectible</div>
      </div>
    </MenuItem>
  );
};

export default MakeCollectible;
