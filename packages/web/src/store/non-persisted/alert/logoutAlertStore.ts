import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  showLogout: boolean;
  setShowLogout: (showLogout: boolean, onLogout?: () => void) => void;
  onLogout?: () => void;
}

const { useStore: useLogoutAlertStore } = createTrackedStore<State>((set) => ({
  onLogout: undefined,
  setShowLogout: (showLogout, onLogout) =>
    set(() => ({ onLogout, showLogout })),
  showLogout: false
}));

export { useLogoutAlertStore };
