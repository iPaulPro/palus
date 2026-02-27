import type {
  SelfFundedTransactionRequestFragment,
  SponsoredTransactionRequestFragment,
  TransactionWillFailFragment
} from "@palus/indexer";
import { createTrackedStore } from "@/store/createTrackedStore";

type AnyTransactionRequestFragment =
  | SelfFundedTransactionRequestFragment
  | SponsoredTransactionRequestFragment
  | TransactionWillFailFragment
  | { __typename?: string; hash?: unknown }
  | ((...args: never[]) => unknown);

interface State {
  showEmbeddedWalletModal: boolean;
  transactionData?: AnyTransactionRequestFragment;
  onCompleted?: (hash: string) => void;
  onError?: (error: Error) => void;
  setShowEmbeddedWalletModal: (params: {
    showEmbeddedWalletModal: boolean;
    transactionData?: AnyTransactionRequestFragment;
    onCompleted?: (hash: string) => void;
    onError?: (error: Error) => void;
  }) => void;
}

const { useStore: useEmbeddedWalletModalStore } = createTrackedStore<State>(
  (set) => ({
    onCompleted: undefined,
    onError: undefined,
    setShowEmbeddedWalletModal: ({
      showEmbeddedWalletModal,
      transactionData,
      onCompleted,
      onError
    }) =>
      set(() => ({
        onCompleted,
        onError,
        showEmbeddedWalletModal,
        transactionData
      })),
    showEmbeddedWalletModal: false,
    transactionData: undefined
  })
);

export { useEmbeddedWalletModalStore };
