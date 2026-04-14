import { Square2StackIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import type { PostFragment } from "@palus/indexer";
import { Card } from "@/components/Shared/UI";
import { STATIC_IMAGES_URL } from "@/data/constants";
import sanitizeDStorageUrl from "@/helpers/sanitizeDStorageUrl";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

interface Props {
  post: PostFragment;
}

const PostMetadataDetails = ({ post }: Props) => {
  const contentUri = post.contentUri;
  const isGrove = contentUri.startsWith("lens://");
  const isIpfs = contentUri.startsWith("ipfs://");
  const isArweave = contentUri.startsWith("ar://");

  const copyUri = useCopyToClipboard(contentUri, "URI copied to clipboard!");

  return (
    <Card as="aside" className="gap-y-2.5 p-5">
      <div className="font-semibold">Post metadata</div>
      <div className="flex min-w-0 gap-x-1 text-secondary text-sm">
        <span className="font-bold">URI:</span>{" "}
        <a
          className="truncate"
          href={sanitizeDStorageUrl(contentUri)}
          rel="noopener"
          target="_blank"
        >
          {contentUri}
        </a>
        <button
          className="flex items-center gap-x-1 text-sm"
          onClick={copyUri}
          type="button"
        >
          <Square2StackIcon className="size-4 cursor-pointer hover:text-brand-500" />
        </button>
      </div>
      {isGrove ? (
        <div className="flex items-center gap-x-1.5 text-secondary text-sm">
          <img
            alt="Lens Logo"
            className="size-5 rounded-full border border-card bg-[#1EC6A2] p-1"
            height={12}
            src={`${STATIC_IMAGES_URL}/lens.svg`}
            width={19}
          />
          Stored on Lens Grove
        </div>
      ) : isIpfs ? (
        <div className="flex items-center gap-x-1.5 text-secondary text-sm">
          <img
            alt="IPFS Logo"
            className="size-5"
            height={20}
            src={`${STATIC_IMAGES_URL}/ipfs.svg`}
            width={20}
          />
          Stored on IPFS
        </div>
      ) : isArweave ? (
        <div className="flex items-center gap-x-1.5 text-secondary text-sm">
          <img
            alt="Arweave Logo"
            className="size-5"
            height={20}
            src={`${STATIC_IMAGES_URL}/arweave.svg`}
            width={20}
          />
          Stored on Arweave
        </div>
      ) : (
        <div className="flex items-center gap-x-1.5 text-secondary text-sm">
          <ExclamationTriangleIcon className="size-5 text-orange-400" />
          Stored on centralized server
        </div>
      )}
    </Card>
  );
};

export default PostMetadataDetails;
