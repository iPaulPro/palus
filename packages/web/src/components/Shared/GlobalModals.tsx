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
import { useFundModalStore } from "@/store/non-persisted/modal/useFundModalStore";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePinPostModalStore } from "@/store/non-persisted/modal/usePinPostModalStore";
import { useReportAccountModalStore } from "@/store/non-persisted/modal/useReportAccountModalStore";
import { useReportPostModalStore } from "@/store/non-persisted/modal/useReportPostModalStore";
import { useSuperFollowModalStore } from "@/store/non-persisted/modal/useSuperFollowModalStore";
import { useSuperJoinModalStore } from "@/store/non-persisted/modal/useSuperJoinModalStore";
import { useSwitchAccountModalStore } from "@/store/non-persisted/modal/useSwitchAccountModalStore";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
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
      : null;

  const isSmallDevice = useMediaQuery(IS_MOBILE);

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

export default GlobalModals;
