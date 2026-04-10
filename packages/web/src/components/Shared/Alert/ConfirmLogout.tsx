import { Alert } from "@/components/Shared/UI";
import errorToast from "@/helpers/errorToast";
import reloadAllTabs from "@/helpers/reloadAllTabs";
import { useLogoutAlertStore } from "@/store/non-persisted/alert/logoutAlertStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { signOut } from "@/store/persisted/useAuthStore";

const ConfirmLogout = () => {
  const { showLogout, setShowLogout, onLogout } = useLogoutAlertStore();
  const { currentAccount } = useAccountStore();

  const handleLogout = async () => {
    try {
      signOut();
      sessionStorage.clear();
      setShowLogout(false);
      onLogout?.();
      reloadAllTabs();
    } catch (error) {
      errorToast(error);
    }
  };

  if (!currentAccount) return null;

  return (
    <Alert
      confirmText="Logout"
      description="Are you sure you want to log out?"
      onClose={() => setShowLogout(false)}
      onConfirm={handleLogout}
      show={showLogout}
      title="Confirm Logout"
    />
  );
};

export default ConfirmLogout;
