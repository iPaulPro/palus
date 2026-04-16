import {
  type GroupFragment,
  type PostActionConfigInput,
  type PostFragment,
  usePostLazyQuery
} from "@palus/indexer";
import { useDebounce, useMediaQuery } from "@uidotdev/usehooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import Attachment from "@/components/Composer/Actions/Attachment";
import CollectSettings from "@/components/Composer/Actions/CollectSettings";
import ContentWarning from "@/components/Composer/Actions/ContentWarning";
import Gif from "@/components/Composer/Actions/Gif";
import PollSettings from "@/components/Composer/Actions/PollSettings";
import PollEditor from "@/components/Composer/Actions/PollSettings/PollEditor";
import RulesSettings from "@/components/Composer/Actions/RulesSettings";
import NewAttachments from "@/components/Composer/NewAttachments";
import NotificationShare from "@/components/Composer/NotificationShare";
import Shimmer from "@/components/Composer/Shimmer";
import QuotedPost from "@/components/Post/QuotedPost";
import ThreadBody from "@/components/Post/ThreadBody";
import { AudioPostSchema } from "@/components/Shared/Audio";
import Wrapper from "@/components/Shared/Embed/Wrapper";
import EmojiPicker from "@/components/Shared/EmojiPicker";
import { Button, Card, H6, WarningMessage } from "@/components/Shared/UI";
import { ERRORS } from "@/data/errors";
import cn from "@/helpers/cn";
import collectActionParams from "@/helpers/collectActionParams";
import { componentToPng } from "@/helpers/componentToPng";
import errorToast from "@/helpers/errorToast";
import getAccount from "@/helpers/getAccount";
import getMentions from "@/helpers/getMentions";
import getPostData from "@/helpers/getPostData";
import getURLs from "@/helpers/getURLs";
import { getPostIdFromLensUrl } from "@/helpers/lensURLs";
import { IS_STANDALONE } from "@/helpers/mediaQueries";
import pollActionParams from "@/helpers/pollActionParams";
import postRuleParams from "@/helpers/postRuleParams";
import { uploadImage } from "@/helpers/uploadFiles";
import uploadMetadata from "@/helpers/uploadMetadata";
import useCanComment from "@/hooks/useCanComment";
import useCreatePost from "@/hooks/useCreatePost";
import useEditPost from "@/hooks/useEditPost";
import usePostMetadata from "@/hooks/usePostMetadata";
import useUmami from "@/hooks/useUmami";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import {
  DEFAULT_AUDIO_POST,
  usePostAudioStore
} from "@/store/non-persisted/post/usePostAudioStore";
import { usePostContentWarningStore } from "@/store/non-persisted/post/usePostContentWarningStore";
import { usePostLicenseStore } from "@/store/non-persisted/post/usePostLicenseStore";
import { usePostPollStore } from "@/store/non-persisted/post/usePostPollStore";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import {
  DEFAULT_VIDEO_THUMBNAIL,
  usePostVideoStore
} from "@/store/non-persisted/post/usePostVideoStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { IGif } from "@/types/giphy";
import type { NewAttachment } from "@/types/misc";
import { Editor, useEditorContext, withEditorContext } from "./Editor";

interface NewPublicationProps {
  className?: string;
  post?: PostFragment;
  group?: GroupFragment;
  isModal?: boolean;
}

const NewPublication = ({
  className,
  post,
  group,
  isModal
}: NewPublicationProps) => {
  const { currentAccount } = useAccountStore();
  const { bannedAccounts } = useBannedAccountsStore();

  // New post modal store
  const { setShow: setShowNewPostModal } = useNewPostModalStore();

  // Post store
  const {
    postContent,
    editingPost,
    quotedPost,
    parentPost,
    ignoreQuotedPostId,
    notificationShare,
    setPostContent,
    setEditingPost,
    setParentPost,
    setQuotedPost,
    setIgnoreQuotedPostId,
    setNotificationShare
  } = usePostStore();

  // Audio store
  const { audioPost, setAudioPost } = usePostAudioStore();

  // Video store
  const { setVideoThumbnail, videoThumbnail } = usePostVideoStore();

  // Attachment store
  const { addAttachments, attachments, isUploading, setAttachments } =
    usePostAttachmentStore();

  // Poll store
  const { pollConfig, resetPollConfig, setShowPollEditor, showPollEditor } =
    usePostPollStore();

  // License store
  const { setLicense } = usePostLicenseStore();

  // Collect module store
  const { collectAction, reset: resetCollectSettings } = useCollectActionStore(
    (state) => state
  );

  const {
    followersOnly,
    followingOnly,
    groupGate,
    collectorsOnly,
    setFollowersOnly,
    setFollowingOnly,
    setGroupGate,
    setCollectorsOnly
  } = usePostRulesStore();
  const { setContentWarning } = usePostContentWarningStore();

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postContentError, setPostContentError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupFragment | undefined>(
    group
  );

  const notificationShareRef = useRef<HTMLDivElement>(null);

  const editor = useEditorContext();
  const getMetadata = usePostMetadata();

  const { track } = useUmami();

  const isComment = Boolean(post);
  const isQuote = Boolean(quotedPost);
  const hasAudio = attachments[0]?.type === "Audio";
  const hasVideo = attachments[0]?.type === "Video";

  const isStandalone = useMediaQuery(IS_STANDALONE);

  const [getPost] = usePostLazyQuery();
  const debouncedPostContent = useDebounce(postContent, 1000);

  const reset = () => {
    editor?.setMarkdown("");
    setIsSubmitting(false);
    setPostContent("");
    setAttachments([]);
    setQuotedPost(undefined);
    setIgnoreQuotedPostId(undefined);
    setEditingPost(undefined);
    setParentPost(undefined);
    setFollowersOnly(false);
    setFollowingOnly(false);
    setGroupGate(undefined);
    setCollectorsOnly(false);
    setContentWarning(undefined);
    setShowPollEditor(false);
    setNotificationShare(undefined);
    resetPollConfig();
    setVideoThumbnail(DEFAULT_VIDEO_THUMBNAIL);
    setAudioPost(DEFAULT_AUDIO_POST);
    setLicense(null);
    resetCollectSettings();
    setSelectedGroup(group);
    setShowNewPostModal(false);
  };

  const onCompleted = () => {
    reset();
  };

  const onError = useCallback((error?: unknown) => {
    setIsSubmitting(false);
    errorToast(error);
    track("Create Post Error", { error });
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
    setSelectedGroup(group);
  }, [group]);

  useEffect(() => {
    setPostContentError("");
  }, [audioPost]);

  useEffect(() => {
    if (!editingPost) return;
    const contentWarning = getPostData(editingPost.metadata)?.contentWarning;
    setContentWarning(contentWarning ?? undefined);
  }, [editingPost]);

  useEffect(() => {
    if (
      isQuote ||
      !postContent ||
      !debouncedPostContent ||
      debouncedPostContent !== postContent
    ) {
      return;
    }

    const lookForPostIdInURLs = async () => {
      const urls = getURLs(debouncedPostContent);
      if (urls.length) {
        const postId = getPostIdFromLensUrl(urls[0]);
        if (!postId || postId === ignoreQuotedPostId) {
          return;
        }
        const { data } = await getPost({
          variables: { request: { post: postId } }
        });
        if (data?.post && data.post.__typename === "Post") {
          setQuotedPost(data.post);
        }
      }
    };

    lookForPostIdInURLs();
  }, [isQuote, ignoreQuotedPostId, debouncedPostContent, postContent]);

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

  const {
    data: canComment,
    isLoading: canCommentIsLoading,
    reason: cantCommentReason
  } = useCanComment({ post });

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
      setPostContentError("");
      setIsSubmitting(true);

      if (hasAudio) {
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

      const baseMetadata = {
        content: postContent.length > 0 ? postContent : undefined,
        title: hasAudio
          ? audioPost.title
          : `${getTitlePrefix()} by ${getAccount(currentAccount).username}`
      };

      const shareImage = await componentToPng(notificationShareRef.current);
      let attachment: NewAttachment | undefined;
      if (shareImage) {
        const upload = await uploadImage(shareImage, currentAccount.address);
        if (!upload.uri) {
          throw new Error("Failed to upload image");
        }
        attachment = {
          mimeType: "image/png",
          previewUri: shareImage,
          type: "Image",
          uri: upload.uri
        };
      }

      const metadata = getMetadata({
        attachment,
        baseMetadata,
        isCollectible: Boolean(collectAction.enabled)
      });
      if (!metadata) {
        throw new Error("Failed to generate metadata");
      }
      const contentUri = await uploadMetadata(metadata, currentAccount.address);

      if (editingPost) {
        return await editPost({
          variables: { request: { contentUri, post: editingPost?.id } }
        });
      }

      const actions: PostActionConfigInput[] = [];
      if (collectAction.enabled) {
        actions.push({ ...collectActionParams(collectAction) });
      }
      if (showPollEditor) {
        actions.push({ ...pollActionParams(pollConfig) });
      }

      const rules = postRuleParams({
        collectorsOnly,
        followersOnly,
        followingOnly,
        groupGate
      });

      track("Create Post", {
        attachments: attachments.length,
        collectible: Boolean(collectAction.enabled),
        comment: isComment,
        contentWarning: "contentWarning" in metadata && metadata.contentWarning,
        group: Boolean(group || selectedGroup),
        modal: Boolean(isModal),
        poll: showPollEditor,
        quote: isQuote,
        rules: {
          collectorsOnly,
          followersOnly,
          followingOnly,
          groupGate: Boolean(groupGate)
        },
        type: metadata.lens.mainContentFocus
      });

      return await createPost({
        variables: {
          request: {
            contentUri,
            ...((group || selectedGroup) && {
              feed: group?.feed?.address || selectedGroup?.feed?.address
            }),
            ...(isComment && { commentOn: { post: post?.id } }),
            ...(isQuote && { quoteOf: { post: quotedPost?.id } }),
            ...(Boolean(actions.length) && { actions }),
            ...(rules && { rules })
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

  const isSubmitDisabledByPoll = showPollEditor
    ? !pollConfig.options.length ||
      pollConfig.options.some((option) => !option.length) ||
      pollConfig.durationInDays < 1
    : false;

  if (currentAccount && bannedAccounts.includes(currentAccount.address)) {
    return (
      <div className={isModal ? "p-4" : ""}>
        <WarningMessage
          message="Your account is banned"
          title="You cannot post"
        />
      </div>
    );
  }

  return canCommentIsLoading ? (
    <Shimmer />
  ) : isComment && !canComment ? (
    <div className={isModal ? "p-4" : ""}>
      <WarningMessage
        message={
          cantCommentReason ??
          "You don't have permission to comment on this post."
        }
        title="You cannot comment on this post"
      />
    </div>
  ) : (
    <Card
      className={cn(
        {
          "!drop-shadow-none flex h-full flex-col overflow-hidden pt-4": isModal
        },
        className
      )}
    >
      {parentPost && isModal ? (
        <div className="mx-3 shrink-0 md:mx-5">
          <ThreadBody embedded post={parentPost} />
        </div>
      ) : null}
      <div
        className={cn("min-h-0 flex-1 overflow-y-auto", {
          isModal: "overscroll-contain"
        })}
      >
        <Editor
          fullHeight={
            isModal &&
            !isQuote &&
            attachments.length === 0 &&
            !showPollEditor &&
            !notificationShare
          }
          group={group}
          isComment={isComment}
          isEditing={Boolean(editingPost)}
          isInModal={isModal}
          isQuote={isQuote}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
        {postContentError ? (
          <H6 className="mt-1 px-5 pb-3 text-red-500">{postContentError}</H6>
        ) : null}
        {showPollEditor ? <PollEditor /> : null}
        {notificationShare ? (
          <div className="px-4 pb-5 sm:w-4/5 sm:px-5">
            <NotificationShare ref={notificationShareRef} />
          </div>
        ) : (
          <NewAttachments attachments={attachments} />
        )}
        {quotedPost ? (
          <Wrapper className="m-5" zeroPadding>
            <QuotedPost isNew post={quotedPost} />
          </Wrapper>
        ) : null}
      </div>
      <div className="block shrink-0 items-center border-border border-t px-5 py-3 sm:flex">
        <div
          className={cn("flex w-full items-center space-x-5", {
            "pb-6 sm:pb-0": isStandalone && isModal
          })}
        >
          <Attachment
            anchor={isModal ? "top" : "bottom"}
            disabled={Boolean(notificationShare)}
          />
          <EmojiPicker
            anchor={isModal ? "top start" : "bottom start"}
            setEmoji={(emoji: string) => {
              editor?.insertText(emoji);
            }}
          />
          <Gif
            disabled={Boolean(notificationShare)}
            setGifAttachment={(gif: IGif) => setGifAttachment(gif)}
          />
          <ContentWarning />
          {editingPost ? null : (
            <>
              <PollSettings />
              <CollectSettings />
            </>
          )}
          <div className="flex w-full items-center justify-end gap-x-4">
            {editingPost || isComment ? null : (
              <RulesSettings group={selectedGroup} />
            )}
            <Button
              className="flex-none"
              disabled={
                isSubmitting ||
                isUploading ||
                videoThumbnail.uploading ||
                postContentError.length > 0 ||
                isSubmitDisabledByPoll
              }
              loading={isSubmitting}
              onClick={handleCreatePost}
            >
              {editingPost ? "Update" : isComment ? "Reply" : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default withEditorContext(NewPublication);
