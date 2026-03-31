import { DocumentTextIcon, TrashIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { memo, useCallback } from "react";
import cn from "@/helpers/cn";
import { useDraftModalStore } from "@/store/non-persisted/modal/useDraftModalStore";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import { usePostAudioStore } from "@/store/non-persisted/post/usePostAudioStore";
import { usePostContentWarningStore } from "@/store/non-persisted/post/usePostContentWarningStore";
import { usePostLicenseStore } from "@/store/non-persisted/post/usePostLicenseStore";
import { usePostPollStore } from "@/store/non-persisted/post/usePostPollStore";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import { usePostVideoStore } from "@/store/non-persisted/post/usePostVideoStore";
import { useDraftStore } from "@/store/persisted/useDraftStore";
import type { PostDraft } from "@/types/draft";
import { toNewAttachment } from "@/types/draft";

dayjs.extend(relativeTime);

interface DraftListProps {
  group?: { address: string; feed?: { address: string } | null };
  parentPostId?: string;
}

const DraftList = ({ group, parentPostId }: DraftListProps) => {
  const { drafts, removeDraft } = useDraftStore();
  const { setShowDraftModal } = useDraftModalStore();
  const { setShow: setShowNewPostModal } = useNewPostModalStore();

  const { setPostContent, setQuotedPost, setParentPost } = usePostStore();
  const { setAttachments } = usePostAttachmentStore();
  const { setAudioPost } = usePostAudioStore();
  const { setVideoThumbnail, setVideoDurationInSeconds } = usePostVideoStore();
  const { setContentWarning } = usePostContentWarningStore();
  const { setPollConfig, setShowPollEditor } = usePostPollStore();
  const { setLicense } = usePostLicenseStore();
  const {
    setCollectorsOnly,
    setFollowersOnly,
    setFollowingOnly,
    setGroupGate
  } = usePostRulesStore();

  const draftList = Object.values(drafts).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  const loadDraftIntoStores = useCallback(
    (draft: PostDraft) => {
      setPostContent(draft.postContent);
      setAttachments(draft.attachments.map(toNewAttachment));
      setAudioPost(draft.audioPost);
      setVideoThumbnail({ ...draft.videoThumbnail, uploading: false });
      setVideoDurationInSeconds(draft.videoDurationInSeconds);
      setQuotedPost(draft.quotedPost);
      setParentPost(draft.parentPost);
      setContentWarning(draft.contentWarning);
      setPollConfig(draft.pollConfig);
      setShowPollEditor(draft.showPollEditor);
      setLicense(draft.license);
      setCollectorsOnly(draft.collectorsOnly);
      setFollowersOnly(draft.followersOnly);
      setFollowingOnly(draft.followingOnly);
      setGroupGate(draft.groupGate);
    },
    [
      setPostContent,
      setAttachments,
      setAudioPost,
      setVideoThumbnail,
      setVideoDurationInSeconds,
      setQuotedPost,
      setParentPost,
      setContentWarning,
      setPollConfig,
      setShowPollEditor,
      setLicense,
      setCollectorsOnly,
      setFollowersOnly,
      setFollowingOnly,
      setGroupGate
    ]
  );

  const handleOpenDraft = useCallback(
    (draft: PostDraft) => {
      const contextMatches =
        draft.parentPost?.id === parentPostId &&
        draft.group?.address === group?.address;

      if (contextMatches) {
        loadDraftIntoStores(draft);
        setShowNewPostModal(true);
      } else {
        setShowDraftModal(true, draft);
      }
    },
    [
      group,
      parentPostId,
      loadDraftIntoStores,
      setShowNewPostModal,
      setShowDraftModal
    ]
  );

  const handleDeleteDraft = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      removeDraft(id);
    },
    [removeDraft]
  );

  if (draftList.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h6 className="px-3 font-bold text-gray-500 text-sm md:px-0">Drafts</h6>
      <div className="space-y-1">
        {draftList.map((draft) => (
          <button
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left",
              "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            key={draft.id}
            onClick={() => handleOpenDraft(draft)}
            type="button"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <DocumentTextIcon className="size-5 shrink-0 text-gray-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  {draft.postContent || "Untitled draft"}
                </p>
                <p className="text-gray-500 text-xs">
                  {dayjs(draft.updatedAt).fromNow()}
                  {draft.parentPost ? " · Reply" : ""}
                  {draft.quotedPost ? " · Quote" : ""}
                  {draft.group
                    ? ` · ${draft.group.metadata?.name || "Group"}`
                    : ""}
                </p>
              </div>
            </div>
            <button
              className="ml-2 shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-red-500 dark:hover:bg-gray-700"
              onClick={(e) => handleDeleteDraft(e, draft.id)}
              type="button"
            >
              <TrashIcon className="size-4" />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(DraftList);
