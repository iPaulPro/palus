import type {
  SelfFundedTransactionRequestFragment,
  SponsoredTransactionRequestFragment,
  TransactionWillFailFragment
} from "@palus/indexer";
import type { WalletClient } from "viem";
import { sendEip712Transaction, sendTransaction } from "viem/zksync";
import { useWalletClient } from "wagmi";
import { ERROR_NAMES, ERRORS } from "@/data/errors";
import getTransactionData from "@/helpers/getTransactionData";
import type { ApolloClientError } from "@/types/errors";
import useHandleWrongNetwork from "./useHandleWrongNetwork";

type AnyTransactionRequestFragment =
  | SelfFundedTransactionRequestFragment
  | SponsoredTransactionRequestFragment
  | TransactionWillFailFragment
  | { __typename?: string; hash?: unknown }
  | ((...args: never[]) => unknown);

const useTransactionLifecycle = () => {
  const { data } = useWalletClient();
  const handleWrongNetwork = useHandleWrongNetwork();

  const handleSponsoredTransaction = async (
    transactionData: AnyTransactionRequestFragment,
    onCompleted: (hash: string) => void,
    walletClient: WalletClient
  ) => {
    if (
      typeof transactionData === "function" ||
      transactionData.__typename !== "SponsoredTransactionRequest" ||
      !("raw" in transactionData)
    ) {
      return;
    }
    await handleWrongNetwork();
    return onCompleted(
      await sendEip712Transaction(walletClient, {
        account: walletClient.account!,
        chain: walletClient.chain,
        ...getTransactionData(transactionData.raw, { sponsored: true })
      })
    );
  };

  const handleSelfFundedTransaction = async (
    transactionData: AnyTransactionRequestFragment,
    onCompleted: (hash: string) => void,
    walletClient: WalletClient
  ) => {
    if (
      typeof transactionData === "function" ||
      transactionData.__typename !== "SelfFundedTransactionRequest" ||
      !("raw" in transactionData)
    ) {
      return;
    }
    await handleWrongNetwork();
    return onCompleted(
      await sendTransaction(walletClient, {
        account: walletClient.account!,
        chain: walletClient.chain,
        ...getTransactionData(transactionData.raw)
      })
    );
  };

  const handleTransactionLifecycle = async ({
    client,
    transactionData,
    onCompleted,
    onError
  }: {
    client?: WalletClient;
    transactionData: AnyTransactionRequestFragment;
    onCompleted: (hash: string) => void;
    onError: (error: ApolloClientError) => void;
  }) => {
    try {
      if (typeof transactionData === "function") {
        return onError({
          message: ERRORS.SomethingWentWrong,
          name: ERROR_NAMES.UnknownError
        });
      }

      const walletClient = client ?? data;
      if (!walletClient) {
        return onError({
          message: ERRORS.SomethingWentWrong,
          name: ERROR_NAMES.UnknownError
        });
      }

      switch (transactionData.__typename) {
        case "SponsoredTransactionRequest":
          return await handleSponsoredTransaction(
            transactionData,
            onCompleted,
            walletClient
          );
        case "SelfFundedTransactionRequest":
          return await handleSelfFundedTransaction(
            transactionData,
            onCompleted,
            walletClient
          );
        case "TransactionWillFail":
          if ("reason" in transactionData) {
            return onError({
              message: transactionData.reason,
              name: transactionData.__typename
            });
          }
          return onError({
            message: ERRORS.SomethingWentWrong,
            name: ERROR_NAMES.UnknownError
          });
        default:
          onError({
            message: ERRORS.SomethingWentWrong,
            name: ERROR_NAMES.UnknownError
          });
          return;
      }
    } catch (error) {
      return onError(error as ApolloClientError);
    }
  };

  return handleTransactionLifecycle;
};

export default useTransactionLifecycle;
