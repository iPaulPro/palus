import type {
  SelfFundedTransactionRequestFragment,
  SponsoredTransactionRequestFragment,
  TransactionWillFailFragment
} from "@palus/indexer";
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
    onCompleted: (hash: string) => void
  ) => {
    if (
      typeof transactionData === "function" ||
      transactionData.__typename !== "SponsoredTransactionRequest" ||
      !("raw" in transactionData)
    ) {
      return;
    }
    await handleWrongNetwork();
    if (!data) return;
    return onCompleted(
      await sendEip712Transaction(data, {
        account: data.account,
        ...getTransactionData(transactionData.raw, { sponsored: true })
      })
    );
  };

  const handleSelfFundedTransaction = async (
    transactionData: AnyTransactionRequestFragment,
    onCompleted: (hash: string) => void
  ) => {
    if (
      typeof transactionData === "function" ||
      transactionData.__typename !== "SelfFundedTransactionRequest" ||
      !("raw" in transactionData)
    ) {
      return;
    }
    await handleWrongNetwork();
    if (!data) return;
    return onCompleted(
      await sendTransaction(data, {
        account: data.account,
        ...getTransactionData(transactionData.raw)
      })
    );
  };

  const handleTransactionLifecycle = async ({
    transactionData,
    onCompleted,
    onError
  }: {
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
      switch (transactionData.__typename) {
        case "SponsoredTransactionRequest":
          return await handleSponsoredTransaction(transactionData, onCompleted);
        case "SelfFundedTransactionRequest":
          return await handleSelfFundedTransaction(
            transactionData,
            onCompleted
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
