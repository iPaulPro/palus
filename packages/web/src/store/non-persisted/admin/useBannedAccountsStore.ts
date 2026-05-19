import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  bannedAccounts: string[];
  addBannedAccount: (address: string) => void;
  setBannedAccounts: (accounts: string[]) => void;
}

const { useStore: useBannedAccountsStore } = createTrackedStore<State>(
  (set) => ({
    addBannedAccount: (address: string) =>
      set((state) => ({ bannedAccounts: [...state.bannedAccounts, address] })),
    bannedAccounts: [],
    setBannedAccounts: (accounts: string[]) =>
      set(() => ({ bannedAccounts: accounts }))
  })
);

export { useBannedAccountsStore };
