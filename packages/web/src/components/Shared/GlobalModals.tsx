import { useMediaQuery } from "@uidotdev/usehooks";
import NewPublication from "@/components/Composer/NewPublication";
import SuperFollow from "@/components/Shared/Account/SuperFollow";
import SwitchAccounts from "@/components/Shared/Account/SwitchAccounts";
import TopUp from "@/components/Shared/Account/TopUp";
import { useSignupStore } from "@/components/Shared/Auth/Signup";
import CreateGroupModal from "@/components/Shared/Group/CreateGroupModal";
import GroupMinting from "@/components/Shared/Group/GroupMinting";
import GroupSuccess from "@/components/Shared/Group/GroupSuccess";
import SuperJoin from "@/components/Shared/Group/SuperJoin";
import PinPostConfirm from "@/components/Shared/Modal/PinPostConfirm";
import ReportAccount from "@/components/Shared/Modal/ReportAccount";
import ReportPost from "@/components/Shared/Modal/ReportPost";
import { Modal } from "@/components/Shared/UI";
import getAccount from "@/helpers/getAccount";
import { IS_MOBILE } from "@/helpers/mediaQueries";
import { useAuthModalStore } from "@/store/non-persisted/modal/useAuthModalStore";
import { useCreateGroupStore } from "@/store/non-persisted/modal/useCreateGroupStore";
import { useDraftModalStore } from "@/store/non-persisted/modal/useDraftModalStore";
import { useFundModalStore } from "@/store/non-persisted/modal/useFundModalStore";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePinPostModalStore } from "@/store/non-persisted/modal/usePinPostModalStore";
import { useReportAccountModalStore } from "@/store/non-persisted/modal/useReportAccountModalStore";
import { useReportPostModalStore } from "@/store/non-persisted/modal/useReportPostModalStore";
import { useSuperFollowModalStore } from "@/store/non-persisted/modal/useSuperFollowModalStore";
import { useSuperJoinModalStore } from "@/store/non-persisted/modal/useSuperJoinModalStore";
import { useSwitchAccountModalStore } from "@/store/non-persisted/modal/useSwitchAccountModalStore";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import { usePostAudioStore } from "@/store/non-persisted/post/usePostAudioStore";
import { usePostContentWarningStore } from "@/store/non-persisted/post/usePostContentWarningStore";
import { usePostLicenseStore } from "@/store/non-persisted/post/usePostLicenseStore";
import { usePostPollStore } from "@/store/non-persisted/post/usePostPollStore";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import { usePostVideoStore } from "@/store/non-persisted/post/usePostVideoStore";
import { toNewAttachment } from "@/types/draft";
import Auth from "./Auth";

const GlobalModals = () => {
  const { setShow: setShowSwitchAccountModal, show: showSwitchAccountModal } =
    useSwitchAccountModalStore();
  const { show: showNewPostModal, setShow: setShowNewPostModal } =
    useNewPostModalStore();
  const {
    editingPost,
    parentPost,
    quotedPost,
    setEditingPost,
    setQuotedPost,
    setPostContent,
    setParentPost,
    setNotificationShare
  } = usePostStore();
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
  const { draft, showDraftModal, setShowDraftModal } = useDraftModalStore();
  const { authModalType, showAuthModal, setShowAuthModal } =
    useAuthModalStore();
  const {
    reportingAccount,
    showReportAccountModal,
    setShowReportAccountModal
  } = useReportAccountModalStore();
  const { reportingPostId, showReportPostModal, setShowReportPostModal } =
    useReportPostModalStore();
  const { showFundModal, setShowFundModal } = useFundModalStore();
  const { showSuperJoinModal, setShowSuperJoinModal, superJoiningGroup } =
    useSuperJoinModalStore();
  const {
    showSuperFollowModal,
    setShowSuperFollowModal,
    superFollowingAccount
  } = useSuperFollowModalStore();
  const { screen: signupScreen } = useSignupStore();
  const {
    screen: groupScreen,
    setScreen: setGroupScreen,
    showCreateGroupModal,
    setShowCreateGroupModal
  } = useCreateGroupStore();
  const { isPinned, showPinPostModal, setShowPinPostModal } =
    usePinPostModalStore();

  const authModalTitle =
    authModalType === "signup"
      ? signupScreen === "choose"
        ? "Signup"
        : null
      : "Login";

  const isSmallDevice = useMediaQuery(IS_MOBILE);

  const loadDraftIntoStores = (d: NonNullable<typeof draft>) => {
    setPostContent(d.postContent);
    setAttachments(d.attachments.map(toNewAttachment));
    setAudioPost(d.audioPost);
    setVideoThumbnail({ ...d.videoThumbnail, uploading: false });
    setVideoDurationInSeconds(d.videoDurationInSeconds);
    setQuotedPost(d.quotedPost);
    setParentPost(d.parentPost);
    setContentWarning(d.contentWarning);
    setPollConfig(d.pollConfig);
    setShowPollEditor(d.showPollEditor);
    setLicense(d.license);
    setCollectorsOnly(d.collectorsOnly);
    setFollowersOnly(d.followersOnly);
    setFollowingOnly(d.followingOnly);
    setGroupGate(d.groupGate);
  };

  return (
    <>
      <Modal
        onClose={() => setShowReportPostModal(false, reportingPostId)}
        show={showReportPostModal}
        title="Report Post"
      >
        <ReportPost postId={reportingPostId} />
      </Modal>
      <Modal
        onClose={() => setShowReportAccountModal(false, reportingAccount)}
        show={showReportAccountModal}
        title="Report account"
      >
        <ReportAccount account={reportingAccount} />
      </Modal>
      <Modal
        onClose={() => setShowSwitchAccountModal(false)}
        show={showSwitchAccountModal}
        size="xs"
        title="Switch Account"
      >
        <SwitchAccounts />
      </Modal>
      <Modal
        onClose={() => setShowAuthModal(false, authModalType)}
        show={showAuthModal}
        title={authModalTitle}
      >
        <Auth />
      </Modal>
      <Modal
        afterLeave={() => {
          setPostContent("");
          setEditingPost(undefined);
          setQuotedPost(undefined);
          setParentPost(undefined);
          setNotificationShare(undefined);
          setAttachments([]);
        }}
        onClose={() => setShowNewPostModal(false)}
        preventClose={true}
        show={showNewPostModal}
        size={isSmallDevice ? "full" : "md"}
        title={
          editingPost
            ? "Edit post"
            : parentPost
              ? `Reply to @${getAccount(parentPost.author).username}`
              : quotedPost
                ? "Quote post"
                : "New post"
        }
      >
        <NewPublication
          className="!rounded-b-xl !rounded-t-none border-none"
          isModal
          post={parentPost}
        />
      </Modal>
      {draft ? (
        <Modal
          afterLeave={() => {
            setPostContent("");
            setQuotedPost(undefined);
            setParentPost(undefined);
            setNotificationShare(undefined);
            setAttachments([]);
          }}
          onClose={() => setShowDraftModal(false)}
          preventClose={true}
          show={showDraftModal}
          size={isSmallDevice ? "full" : "md"}
          title={
            draft.parentPost
              ? `Reply to @${getAccount(draft.parentPost.author).username}`
              : draft.quotedPost
                ? "Quote post"
                : "Draft"
          }
        >
          <DraftModalContent
            draft={draft}
            loadDraftIntoStores={loadDraftIntoStores}
          />
        </Modal>
      ) : null}
      <Modal
        onClose={() => setShowFundModal({ showFundModal: false })}
        show={showFundModal}
        title="Deposit"
      >
        <TopUp />
      </Modal>
      <Modal
        onClose={() => setShowSuperJoinModal(false, superJoiningGroup)}
        show={showSuperJoinModal}
        title="Super Join"
      >
        <SuperJoin />
      </Modal>
      <Modal
        onClose={() => setShowSuperFollowModal(false, superFollowingAccount)}
        show={showSuperFollowModal}
        title="Super Follow"
      >
        <SuperFollow />
      </Modal>
      <Modal
        afterLeave={() => {
          setGroupScreen("details");
        }}
        onClose={() => setShowCreateGroupModal(false)}
        show={showCreateGroupModal}
        title={groupScreen === "details" ? "Create a group" : undefined}
      >
        {groupScreen === "details" ? (
          <CreateGroupModal />
        ) : groupScreen === "minting" ? (
          <GroupMinting />
        ) : (
          <GroupSuccess />
        )}
      </Modal>
      <Modal
        onClose={() => setShowPinPostModal(false)}
        show={showPinPostModal}
        size="xs"
        title={isPinned ? "Unpin post from profile?" : "Pin post to profile?"}
      >
        <PinPostConfirm />
      </Modal>
    </>
  );
};

/**
 * Separate component so that NewPublication gets its own EditorContext when
 * rendered inside the draft modal (independent from the main new-post modal).
 */
const DraftModalContent = ({
  draft,
  loadDraftIntoStores
}: {
  draft: NonNullable<ReturnType<typeof useDraftModalStore>["draft"]>;
  loadDraftIntoStores: (
    d: NonNullable<ReturnType<typeof useDraftModalStore>["draft"]>
  ) => void;
}) => {
  // Load draft data into stores on mount
  loadDraftIntoStores(draft);

  return (
    <NewPublication
      className="!rounded-b-xl !rounded-t-none border-none"
      draftId={draft.id}
      group={draft.group}
      isModal
      post={draft.parentPost}
    />
  );
};

export default GlobalModals;
