import { createTrackedStore } from "@/store/createTrackedStore";

interface CreateGroupState {
  showCreateGroupModal: boolean;
  screen: "details" | "minting" | "success";
  transactionHash: string;
  groupAddress: string;
  setShowCreateGroupModal: (show: boolean) => void;
  setScreen: (screen: "details" | "minting" | "success") => void;
  setTransactionHash: (hash: string) => void;
  setGroupAddress: (address: string) => void;
}

const { useStore: useCreateGroupStore } = createTrackedStore<CreateGroupState>(
  (set) => ({
    groupAddress: "",
    screen: "details",
    setGroupAddress: (address) => set({ groupAddress: address }),
    setScreen: (screen) => set({ screen }),
    setShowCreateGroupModal: (show) => set({ showCreateGroupModal: show }),
    setTransactionHash: (hash) => set({ transactionHash: hash }),
    showCreateGroupModal: false,
    transactionHash: ""
  })
);

export { useCreateGroupStore };
