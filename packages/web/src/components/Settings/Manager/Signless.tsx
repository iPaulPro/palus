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

  const Content = () => {
    return (
      <div className="m-5 flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-1.5">
          <div className="font-bold text-lg">
            {isSignless ? "Disable" : "Enable"} signless transactions
          </div>
          <div className="font-normal text-gray-500 dark:text-gray-200">
            Enable Signless to interact with Palus without signing transactions.
            This only applies to transactions that don't move tokens.
          </div>
        </div>
        <Button
          className="mr-auto"
          disabled={isSubmitting}
          loading={isSubmitting}
          onClick={handleToggleSignless}
          outline={isSignless}
          variant={isSignless ? "danger" : "primary"}
        >
          {isSignless ? "Disable" : "Enable"}
        </Button>
      </div>
    );
  };

  if (isCard) {
    return (
      <Card>
        <Content />
      </Card>
    );
  }

  return <Content />;
};

export default Signless;
