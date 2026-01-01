import { ERRORS } from "@palus/data/errors";
import getAccount from "@palus/helpers/getAccount";
import type { PostFragment } from "@palus/indexer";
import type { IGif } from "@palus/types/giphy";
import type { NewAttachment } from "@palus/types/misc";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import Attachment from "@/components/Composer/Actions/Attachment";
import CollectSettings from "@/components/Composer/Actions/CollectSettings";
import ContentWarning from "@/components/Composer/Actions/ContentWarning";
import Gif from "@/components/Composer/Actions/Gif";
import RulesSettings from "@/components/Composer/Actions/RulesSettings";
import NewAttachments from "@/components/Composer/NewAttachments";
import QuotedPost from "@/components/Post/QuotedPost";
import ThreadBody from "@/components/Post/ThreadBody";
import { AudioPostSchema } from "@/components/Shared/Audio";
import Wrapper from "@/components/Shared/Embed/Wrapper";
import EmojiPicker from "@/components/Shared/EmojiPicker";
import { Button, Card, H6 } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import collectActionParams from "@/helpers/collectActionParams";
import errorToast from "@/helpers/errorToast";
import getMentions from "@/helpers/getMentions";
import { IS_STANDALONE } from "@/helpers/mediaQueries";
import uploadMetadata from "@/helpers/uploadMetadata";
import useCreatePost from "@/hooks/useCreatePost";
import useEditPost from "@/hooks/useEditPost";
import usePostMetadata from "@/hooks/usePostMetadata";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import {
  DEFAULT_AUDIO_POST,
  usePostAudioStore
} from "@/store/non-persisted/post/usePostAudioStore";
import { usePostContentWarningStore } from "@/store/non-persisted/post/usePostContentWarningStore";
import { usePostLicenseStore } from "@/store/non-persisted/post/usePostLicenseStore";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import {
  DEFAULT_VIDEO_THUMBNAIL,
  usePostVideoStore
} from "@/store/non-persisted/post/usePostVideoStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { Editor, useEditorContext, withEditorContext } from "./Editor";
import LinkPreviews from "./LinkPreviews";

interface NewPublicationProps {
  className?: string;
  post?: PostFragment;
  feed?: string;
  isModal?: boolean;
}

const NewPublication = ({
  className,
  post,
  feed,
  isModal
}: NewPublicationProps) => {
  const { currentAccount } = useAccountStore();

  // New post modal store
  const { setShow: setShowNewPostModal } = useNewPostModalStore();

  // Post store
  const {
    postContent,
    editingPost,
    quotedPost,
    parentPost,
    setPostContent,
    setEditingPost,
    setParentPost,
    setQuotedPost
  } = usePostStore();

  // Audio store
  const { audioPost, setAudioPost } = usePostAudioStore();

  // Video store
  const { setVideoThumbnail, videoThumbnail } = usePostVideoStore();

  // Attachment store
  const { addAttachments, attachments, isUploading, setAttachments } =
    usePostAttachmentStore();

  // License store
  const { setLicense } = usePostLicenseStore();

  // Collect module store
  const { collectAction, reset: resetCollectSettings } = useCollectActionStore(
    (state) => state
  );

  const { rules, setRules } = usePostRulesStore();
  const { setContentWarning } = usePostContentWarningStore();

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postContentError, setPostContentError] = useState("");
  const [selectedFeed, setSelectedFeed] = useState<string>(feed || "");

  const editor = useEditorContext();
  const getMetadata = usePostMetadata();

  const isComment = Boolean(post);
  const isQuote = Boolean(quotedPost);
  const hasAudio = attachments[0]?.type === "Audio";
  const hasVideo = attachments[0]?.type === "Video";

  const isStandalone = useMediaQuery(IS_STANDALONE);

  const reset = () => {
    editor?.setMarkdown("");
    setIsSubmitting(false);
    setPostContent("");
    setAttachments([]);
    setQuotedPost(undefined);
    setEditingPost(undefined);
    setParentPost(undefined);
    setRules(undefined);
    setContentWarning(undefined);
    setVideoThumbnail(DEFAULT_VIDEO_THUMBNAIL);
    setAudioPost(DEFAULT_AUDIO_POST);
    setLicense(null);
    resetCollectSettings();
    setSelectedFeed(feed || "");
    setShowNewPostModal(false);
  };

  const onCompleted = () => {
    reset();
  };

  const onError = useCallback((error?: unknown) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const { createPost } = useCreatePost({
    commentOn: post,
    onCompleted,
    onError
  });

  const { editPost } = useEditPost({
    onCompleted,
    onError
  });

  useEffect(() => {
    setSelectedFeed(feed || "");
  }, [feed]);

  useEffect(() => {
    setPostContentError("");
  }, [audioPost]);

  useEffect(() => {
    if (postContent.length > 25000) {
      setPostContentError("Content should not exceed 25000 characters!");
      return;
    }

    if (getMentions(postContent).length > 50) {
      setPostContentError("You can only mention 50 people at a time!");
      return;
    }

    setPostContentError("");
  }, [postContent]);

  const getTitlePrefix = () => {
    if (hasVideo) {
      return "Video";
    }

    return isComment ? "Comment" : isQuote ? "Quote" : "Post";
  };

  const handleCreatePost = async () => {
    if (!currentAccount) {
      return toast.error(ERRORS.SignWallet);
    }

    try {
      setIsSubmitting(true);
      if (hasAudio) {
        setPostContentError("");
        const parsedData = AudioPostSchema.safeParse(audioPost);
        if (!parsedData.success) {
          const issue = parsedData.error.issues[0];
          setIsSubmitting(false);
          return setPostContentError(issue.message);
        }
      }

      if (!postContent.length && !attachments.length) {
        setIsSubmitting(false);
        return setPostContentError(
          `${
            isComment ? "Comment" : isQuote ? "Quote" : "Post"
          } should not be empty!`
        );
      }

      setPostContentError("");

      const baseMetadata = {
        content: postContent.length > 0 ? postContent : undefined,
        title: hasAudio
          ? audioPost.title
          : `${getTitlePrefix()} by ${getAccount(currentAccount).username}`
      };

      const metadata = getMetadata({ baseMetadata });
      const contentUri = await uploadMetadata(metadata);

      if (editingPost) {
        return await editPost({
          variables: { request: { contentUri, post: editingPost?.id } }
        });
      }

      return await createPost({
        variables: {
          request: {
            contentUri,
            ...((feed || (selectedFeed && selectedFeed !== "global")) && {
              feed: feed || selectedFeed
            }),
            ...(isComment && { commentOn: { post: post?.id } }),
            ...(isQuote && { quoteOf: { post: quotedPost?.id } }),
            ...(collectAction.enabled && {
              actions: [{ ...collectActionParams(collectAction) }]
            }),
            ...(rules && {
              rules: { required: [{ followersOnlyRule: rules }] }
            })
          }
        }
      });
    } catch (error) {
      onError(error);
    }
  };

  const setGifAttachment = (gif: IGif) => {
    const attachment: NewAttachment = {
      mimeType: "image/gif",
      previewUri: gif.images.original.url,
      type: "Image",
      uri: gif.images.original.url
    };
    addAttachments([attachment]);
  };

  useHotkeys("mod+enter", () => handleCreatePost(), {
    enableOnContentEditable: true
  });

  return (
    <Card
      className={cn(
        { "flex h-full flex-col overflow-hidden pt-5": isModal },
        className
      )}
    >
      {parentPost && isModal ? (
        <div className="mx-3 shrink-0 md:mx-5">
          <ThreadBody embedded post={parentPost} />
        </div>
      ) : null}
      <div className={"min-h-0 flex-1 overflow-y-auto"}>
        <Editor
          feed={feed}
          isComment={isComment}
          isEditing={Boolean(editingPost)}
          isInModal={isModal}
          isQuote={isQuote}
          selectedFeed={selectedFeed}
          setSelectedFeed={setSelectedFeed}
          zeroPadding={isModal}
        />
        {postContentError ? (
          <H6 className="mt-1 px-5 pb-3 text-red-500">{postContentError}</H6>
        ) : null}
        <LinkPreviews />
        <NewAttachments attachments={attachments} />
        {quotedPost ? (
          <Wrapper className="m-5" zeroPadding>
            <QuotedPost isNew post={quotedPost} />
          </Wrapper>
        ) : null}
      </div>
      <div className="block shrink-0 items-center border-border border-t px-5 py-3 sm:flex">
        <div
          className={cn("flex w-full items-center space-x-4", {
            "pb-6": isStandalone && isModal,
            "space-x-5": !isModal
          })}
        >
          <Attachment anchor={isModal ? "top" : "bottom"} />
          <EmojiPicker
            anchor={isModal ? "top start" : "bottom start"}
            setEmoji={(emoji: string) => {
              editor?.insertText(emoji);
            }}
          />
          <Gif setGifAttachment={(gif: IGif) => setGifAttachment(gif)} />
          <ContentWarning />
          {editingPost ? null : <CollectSettings />}
          <div className="flex w-full items-center justify-end gap-x-4">
            {editingPost ? null : <RulesSettings />}
            <Button
              className="flex-none"
              disabled={
                isSubmitting ||
                isUploading ||
                videoThumbnail.uploading ||
                postContentError.length > 0
              }
              loading={isSubmitting}
              onClick={handleCreatePost}
            >
              {editingPost ? "Update" : isComment ? "Comment" : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default withEditorContext(NewPublication);
