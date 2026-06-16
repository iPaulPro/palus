import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import {
  useEnableSignlessMutation,
  useRemoveSignlessMutation
} from "@palus/indexer";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useConnection } from "wagmi";
import { Button, Card } from "@/components/Shared/UI";
import errorToast from "@/helpers/errorToast";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { ApolloClientError } from "@/types/errors";

interface Props {
  isCard?: boolean;
}

const Content = ({
  isSignless,
  isSubmitting,
  handleToggleSignless
}: {
  isSignless: boolean;
  isSubmitting: boolean;
  handleToggleSignless: () => void;
}) => {
  return (
    <div className="m-5 flex flex-col gap-y-5">
      <div className="flex flex-col gap-y-1.5">
        <div className="flex items-center gap-x-2 font-bold text-lg">
          {isSignless ? (
            <CheckCircleIcon className="inline size-6 text-green-500" />
          ) : (
            <XCircleIcon className="inline size-6 text-red-500" />
          )}{" "}
          Signless transactions
        </div>
        <div className="pt-2 font-normal text-gray-500 dark:text-gray-200">
          Enable Signless to interact with Palus without signing transactions.
          This only applies to transactions that don't move tokens, like posting
          and following.
        </div>
      </div>
      <Button
        className="mr-auto"
        disabled={isSubmitting}
        loading={isSubmitting}
        onClick={handleToggleSignless}
        variant={isSignless ? "danger" : "primary"}
      >
        {isSignless ? "Disable Signless" : "Enable Signless"}
      </Button>
    </div>
  );
};

const Signless = ({ isCard }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleTransactionLifecycle = useTransactionLifecycle();

  const { currentAccount, isSignless, setIsSignless } = useAccountStore();
  const { address } = useConnection();
  const disabled = currentAccount?.owner !== address;

  const onCompleted = (enabled: boolean) => {
    setIsSubmitting(false);
    setIsSignless(enabled);
    toast.success(enabled ? "Signless enabled" : "Signless disabled");
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const [enableSignless] = useEnableSignlessMutation({
    onCompleted: async ({ enableSignless }) => {
      return await handleTransactionLifecycle({
        onCompleted: () => onCompleted(true),
        onError,
        transactionData: enableSignless
      });
    },
    onError
  });

  const [removeSignless] = useRemoveSignlessMutation({
    onCompleted: async ({ removeSignless }) => {
      return await handleTransactionLifecycle({
        onCompleted: () => onCompleted(false),
        onError,
        transactionData: removeSignless
      });
    },
    onError
  });

  if (disabled) {
    return null;
  }

  const handleToggleSignless = async () => {
    setIsSubmitting(true);

    if (isSignless) {
      return await removeSignless();
    }

    return await enableSignless();
  };

  if (isCard) {
    return (
      <Card>
        <Content
          handleToggleSignless={handleToggleSignless}
          isSignless={isSignless}
          isSubmitting={isSubmitting}
        />
      </Card>
    );
  }

  return (
    <Content
      handleToggleSignless={handleToggleSignless}
      isSignless={isSignless}
      isSubmitting={isSubmitting}
    />
  );
};

export default Signless;
