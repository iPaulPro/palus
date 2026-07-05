import type {
  SelfFundedTransactionRequestFragment,
  SponsoredTransactionRequestFragment,
  TransactionWillFailFragment
} from "@palus/indexer";
import { getWalletClient } from "@wagmi/core";
import { sendEip712Transaction, sendTransaction } from "viem/zksync";
import { useConfig } from "wagmi";
import { CHAIN } from "@/data/constants";
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
  const handleWrongNetwork = useHandleWrongNetwork();
  const config = useConfig();

  const handleSponsoredTransaction = async (
    transactionData: AnyTransactionRequestFragment,
    onCompleted: (hash: string) => void,
    onError: (error: ApolloClientError) => void
  ) => {
    if (
      typeof transactionData === "function" ||
      transactionData.__typename !== "SponsoredTransactionRequest" ||
      !("raw" in transactionData)
    ) {
      return onError({
        message: ERRORS.SomethingWentWrong,
        name: ERROR_NAMES.UnknownError
      });
    }

    try {
      const walletClient = await getWalletClient(config, {
        chainId: CHAIN.id
      });
      if (!walletClient) {
        return onError({
          message: ERRORS.SignWallet,
          name: transactionData.__typename
        });
      }

      await handleWrongNetwork();

      return onCompleted(
        await sendEip712Transaction(walletClient, {
          account: walletClient.account,
          ...getTransactionData(transactionData.raw, { sponsored: true })
        })
      );
    } catch (e) {
      return onError({
        message:
          e instanceof Error && "details" in e
            ? (e.details as string)
            : ERRORS.SomethingWentWrong,
        name: ERROR_NAMES.UnknownError
      });
    }
  };

  const handleSelfFundedTransaction = async (
    transactionData: AnyTransactionRequestFragment,
    onCompleted: (hash: string) => void,
    onError: (error: ApolloClientError) => void
  ) => {
    if (
      typeof transactionData === "function" ||
      transactionData.__typename !== "SelfFundedTransactionRequest" ||
      !("raw" in transactionData)
    ) {
      return onError({
        message: ERRORS.SomethingWentWrong,
        name: ERROR_NAMES.UnknownError
      });
    }

    try {
      await handleWrongNetwork();
    } catch {
      return onError({
        message: ERRORS.SignWallet,
        name: transactionData.__typename
      });
    }

    try {
      const walletClient = await getWalletClient(config);
      if (!walletClient) {
        return onError({
          message: ERRORS.SignWallet,
          name: transactionData.__typename
        });
      }
      return onCompleted(
        await sendTransaction(walletClient, {
          account: walletClient.account,
          ...getTransactionData(transactionData.raw)
        })
      );
    } catch {
      return onError({
        message: ERRORS.SomethingWentWrong,
        name: ERROR_NAMES.UnknownError
      });
    }
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
          return await handleSponsoredTransaction(
            transactionData,
            onCompleted,
            onError
          );
        case "SelfFundedTransactionRequest":
          return await handleSelfFundedTransaction(
            transactionData,
            onCompleted,
            onError
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
