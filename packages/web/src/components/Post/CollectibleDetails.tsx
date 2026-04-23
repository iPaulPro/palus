import { Square2StackIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import type { PostFragment, SimpleCollectAction } from "@palus/indexer";
import { Card } from "@/components/Shared/UI";
import { BLOCK_EXPLORER_URL, STATIC_IMAGES_URL } from "@/data/constants";
import formatAddress from "@/helpers/formatAddress";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

interface Props {
  post: PostFragment;
}

const CollectibleDetails = ({ post }: Props) => {
  const collectAction = post.actions.find(
    (action) => action.__typename === "SimpleCollectAction"
  ) as SimpleCollectAction;

  const copyAddress = useCopyToClipboard(
    collectAction?.collectNftAddress,
    "URI copied to clipboard!"
  );

  if (!collectAction) return null;

  return (
    <Card as="aside" className="gap-y-2.5 p-5">
      <div className="font-bold text-lg">Collectible Details</div>
      <div className="flex min-w-0 gap-x-1 text-sm">
        <span className="font-bold text-secondary">Address:</span>{" "}
        <a
          className="truncate"
          href={`${BLOCK_EXPLORER_URL}/address/${collectAction.collectNftAddress}`}
          rel="noopener"
          target="_blank"
        >
          {formatAddress(collectAction.collectNftAddress)}
        </a>
        <button
          className="flex items-center gap-x-1 text-sm"
          onClick={copyAddress}
          type="button"
        >
          <Square2StackIcon className="size-4 cursor-pointer hover:text-brand-500" />
        </button>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-x-1.5 text-secondary text-sm">
          {collectAction.isImmutable ? (
            <CheckCircleIcon className="size-5" />
          ) : (
            <XCircleIcon className="size-5" />
          )}
          Immutable
        </div>
        <div className="flex items-center gap-x-1.5 text-secondary text-sm">
          <img
            alt="Lens Logo"
            className="size-5 rounded-full border border-card bg-[#1EC6A2] p-1"
            height={12}
            src={`${STATIC_IMAGES_URL}/lens.svg`}
            width={19}
          />
          Lens Chain
        </div>
      </div>
    </Card>
  );
};

export default CollectibleDetails;
