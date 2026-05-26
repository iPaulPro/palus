import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { PostFragment } from "@palus/indexer";
import { Button } from "@/components/Shared/UI";
import useMakePostCollectible from "@/hooks/useMakePostCollectible";
import { useCollectFormModalStore } from "@/store/non-persisted/modal/useCollectFormModalStore";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { usePostLicenseStore } from "@/store/non-persisted/post/usePostLicenseStore";

interface Props {
  post: PostFragment;
}

const MakeCollectible = ({ post }: Props) => {
  const { setShowCollectFormModal, submittingPost } =
    useCollectFormModalStore();
  const { submit, isSubmitting } = useMakePostCollectible({ post });

  const { reset } = useCollectActionStore((state) => state);
  const { setLicense } = usePostLicenseStore();

  if (
    post.actions.find((action) => action.__typename === "SimpleCollectAction")
  ) {
    return null;
  }

  return (
    <Button
      className="font-semibold text-sm"
      disabled={isSubmitting || Boolean(submittingPost)}
      icon={<ShoppingBagIcon className="-mt-0.5 size-5" />}
      loading={isSubmitting}
      onClick={() => {
        reset();
        setLicense(null);
        setShowCollectFormModal(true, submit);
      }}
      outline
    >
      Make Collectible
    </Button>
  );
};

export default MakeCollectible;
