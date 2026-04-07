import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { getSrc } from "@livepeer/react/external";
import { type AnyPostFragment, ContentWarning } from "@palus/indexer";
import { memo, useEffect, useRef, useState } from "react";
import HiddenPost from "@/components/Post/HiddenPost";
import PollAction from "@/components/Post/OpenAction/PollAction";
import Quote from "@/components/Shared/Embed/Quote";
import Markup from "@/components/Shared/Markup";
import Attachments from "@/components/Shared/Post/Attachments";
import PostLink from "@/components/Shared/Post/PostLink";
import Video from "@/components/Shared/Post/Video";
import { Button } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import cn from "@/helpers/cn";
import getPostData from "@/helpers/getPostData";
import { isRepost } from "@/helpers/postHelpers";

interface PostBodyProps {
  contentClassName?: string;
  post: AnyPostFragment;
  showMore?: boolean;
  embedded?: boolean;
}

const PostBody = ({
  contentClassName = "",
  post,
  showMore = false,
  embedded = false
}: PostBodyProps) => {
  const targetPost = isRepost(post) ? post.repostOf : post;
  const { metadata } = targetPost;

  const filteredContent = getPostData(metadata)?.content || "";
  const filteredAttachments = getPostData(metadata)?.attachments || [];
  const filteredAsset = getPostData(metadata)?.asset;

  const markupRef = useRef<HTMLElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = markupRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [filteredContent]);

  const unknownActions =
    post.__typename === "Post"
      ? post.actions.filter(
          (action) => action.__typename === "UnknownPostAction"
        )
      : null;
  const pollAction = unknownActions?.find(
    (action) => action.address === CONTRACTS.pollVoteAction
  );

  // Show live if it's there
  const showLive = metadata.__typename === "LivestreamMetadata";
  // Show attachments if they're there
  const showAttachments = filteredAttachments.length > 0 || filteredAsset;

  const [showCensored, setShowCensored] = useState(false);
  const contentWarning =
    "contentWarning" in metadata ? metadata.contentWarning : undefined;
  const contentWarningText =
    contentWarning === ContentWarning.Spoiler
      ? "spoiler"
      : contentWarning === ContentWarning.Nsfw
        ? "NSFW content"
        : contentWarning === ContentWarning.Sensitive
          ? "sensitive content"
          : "content";

  return (
    <div className="relative">
      {contentWarning && !showCensored && (
        <div className="absolute z-10 flex h-full min-h-12 w-full items-center justify-center">
          <Button
            onClick={(event) => {
              event.stopPropagation();
              setShowCensored(true);
            }}
            size="sm"
          >
            Show {contentWarningText}
          </Button>
        </div>
      )}
      {targetPost.isDeleted ? (
        <HiddenPost />
      ) : (
        <div
          className={cn("break-words", {
            "opacity-50 blur-2xl": contentWarning && !showCensored
          })}
        >
          <Markup
            className={cn(
              { "line-clamp-2": embedded, "line-clamp-7": showMore },
              "markup linkify break-words",
              contentClassName
            )}
            mentions={targetPost.mentions}
            ref={markupRef}
          >
            {filteredContent}
          </Markup>
          {isClamped ? (
            <div className="flex items-center space-x-1 pt-1 font-semibold text-brand-500 text-sm">
              <PostLink post={post}>Show more</PostLink>
            </div>
          ) : null}
          {unknownActions?.length && !embedded ? (
            pollAction && post.__typename === "Post" ? (
              <div className="pt-3 pb-2">
                <PollAction post={post} />
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-x-2 rounded-xl border border-gray-200 px-4 py-2 text-gray-700 text-sm md:w-3/4 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                <ExclamationCircleIcon className="size-4" />
                Includes unsupported actions
              </div>
            )
          ) : null}
          {/* Attachments and Quotes */}
          {showAttachments && !embedded ? (
            <Attachments
              asset={filteredAsset}
              attachments={filteredAttachments}
            />
          ) : null}
          {showLive && !embedded ? (
            <div className="mt-3">
              <Video src={getSrc(metadata.liveUrl || metadata.playbackUrl)} />
            </div>
          ) : null}
          {targetPost.quoteOf && !embedded ? (
            <Quote post={targetPost.quoteOf} />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default memo(PostBody);
