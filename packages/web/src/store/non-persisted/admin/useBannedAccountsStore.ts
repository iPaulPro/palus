import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  bannedAccounts: string[];
  setBannedAccounts: (accounts: string[]) => void;
}

const { useStore: useBannedAccountsStore } = createTrackedStore<State>(
  (set) => ({
    bannedAccounts: [],
    setBannedAccounts: (accounts: string[]) =>
      set(() => ({ bannedAccounts: accounts }))
  })
);

export { useBannedAccountsStore };
