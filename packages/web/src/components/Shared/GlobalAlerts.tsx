import { useEffect } from "react";
import BlockOrUnblockAccount from "@/components/Shared/Alert/BlockOrUnblockAccount";
import ConfirmLogout from "@/components/Shared/Alert/ConfirmLogout";
import DeletePost from "@/components/Shared/Alert/DeletePost";
import MuteOrUnmuteAccount from "@/components/Shared/Alert/MuteOrUnmuteAccount";
import useInstallListener from "@/hooks/useInstallListener";
import { useLogoutAlertStore } from "@/store/non-persisted/alert/logoutAlertStore";
import { useBlockAlertStore } from "@/store/non-persisted/alert/useBlockAlertStore";
import { useMuteAlertStore } from "@/store/non-persisted/alert/useMuteAlertStore";

const GlobalAlerts = () => {
  const { mutingOrUnmutingAccount } = useMuteAlertStore();
  const { blockingOrUnblockingAccount } = useBlockAlertStore();
  const { showLogout: showLogoutAlert } = useLogoutAlertStore();
  const { prompt: promptInstall } = useInstallListener();

  useEffect(() => {
    promptInstall();
  }, [promptInstall]);

  return (
    <>
      <DeletePost />
      {blockingOrUnblockingAccount && <BlockOrUnblockAccount />}
      {mutingOrUnmutingAccount && <MuteOrUnmuteAccount />}
      {showLogoutAlert && <ConfirmLogout />}
    </>
  );
};

export default GlobalAlerts;
