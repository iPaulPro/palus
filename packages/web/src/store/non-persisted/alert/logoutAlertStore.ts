import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  showLogout: boolean;
  setShowLogout: (showLogout: boolean) => void;
}

const { useStore: useLogoutAlertStore } = createTrackedStore<State>((set) => ({
  onLogout: undefined,
  setShowLogout: (showLogout) => set(() => ({ showLogout })),
  showLogout: false
}));

export { useLogoutAlertStore };
