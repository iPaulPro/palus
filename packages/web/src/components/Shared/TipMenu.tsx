import { useApolloClient } from "@apollo/client";
import {
  type AccountFragment,
  type PostFragment,
  type TippingAmountInput,
  useBalancesBulkQuery,
  useExecuteAccountActionMutation,
  useExecutePostActionMutation
} from "@palus/indexer";
import type { ChangeEvent, RefObject } from "react";
import { memo, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import TopUpButton from "@/components/Shared/Account/TopUp/Button";
import LoginButton from "@/components/Shared/LoginButton";
import Skeleton from "@/components/Shared/Skeleton";
import { Button, Input, Spinner } from "@/components/Shared/UI";
import { NATIVE_TOKEN_SYMBOL } from "@/data/constants";
import cn from "@/helpers/cn";
import errorToast from "@/helpers/errorToast";
import usePreventScrollOnNumberInput from "@/hooks/usePreventScrollOnNumberInput";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import useUmami from "@/hooks/useUmami";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { ApolloClientError } from "@/types/errors";

const submitButtonClassName = "w-full py-2 sm:py-1.5 text-base font-semibold";

interface TipMenuProps {
  closePopover: () => void;
  post?: PostFragment;
  account?: AccountFragment;
}

const TipMenu = ({ closePopover, post, account }: TipMenuProps) => {
  const { currentAccount } = useAccountStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(0.01);
  const [other, setOther] = useState(false);
  const handleTransactionLifecycle = useTransactionLifecycle();
  const { cache } = useApolloClient();
  const inputRef = useRef<HTMLInputElement>(null);
  usePreventScrollOnNumberInput(inputRef as RefObject<HTMLInputElement>);
  const { track } = useUmami();

  const { data: balance, loading: balanceLoading } = useBalancesBulkQuery({
    fetchPolicy: "no-cache",
    pollInterval: 3000,
    skip: !currentAccount?.address,
    variables: {
      request: { address: currentAccount?.address, includeNative: true }
    }
  });

  const updateCache = () => {
    if (post) {
      if (!post.operations) {
        return;
      }

      cache.modify({
        fields: { hasTipped: () => true },
        id: cache.identify(post.operations)
      });
      cache.modify({
        fields: {
          stats: (existingData) => ({
            ...existingData,
            tips: existingData.tips + 1
          })
        },
        id: cache.identify(post)
      });
    }
  };

  const onCompleted = () => {
    setIsSubmitting(false);
    closePopover();
    updateCache();
    toast.success(`Tipped ${amount.toFixed(2)} ${NATIVE_TOKEN_SYMBOL}`);
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const cryptoRate = Number(amount);
  const nativeBalance =
    balance?.balancesBulk[0].__typename === "NativeAmount"
      ? Number(balance.balancesBulk[0].value).toFixed(2)
      : 0;
  const canTip = Number(nativeBalance) >= cryptoRate;

  const [executePostAction] = useExecutePostActionMutation({
    onCompleted: async ({ executePostAction }) => {
      if (executePostAction.__typename === "ExecutePostActionResponse") {
        return onCompleted();
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: executePostAction
      });
    },
    onError
  });

  const [executeAccountAction] = useExecuteAccountActionMutation({
    onCompleted: async ({ executeAccountAction }) => {
      if (executeAccountAction.__typename === "ExecuteAccountActionResponse") {
        return onCompleted();
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: executeAccountAction
      });
    },
    onError
  });

  const handleSetAmount = (amount: number) => {
    setAmount(amount);
    setOther(false);
  };

  const onOtherAmount = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setAmount(value);
  };

  const handleTip = async () => {
    setIsSubmitting(true);

    const tipping: TippingAmountInput = {
      native: cryptoRate.toString()
    };

    if (post) {
      track("Tip", { amount, type: "Post" });
      return executePostAction({
        variables: { request: { action: { tipping }, post: post.id } }
      });
    }

    if (account) {
      track("Tip", { amount, type: "Account" });
      return executeAccountAction({
        variables: {
          request: { account: account.address, action: { tipping } }
        }
      });
    }
  };

  const amountDisabled = isSubmitting || !currentAccount;

  if (!currentAccount) {
    return <LoginButton className="m-5" title="Login to Tip" />;
  }

  return (
    <div className="m-4 space-y-3">
      <div className="space-y-2">
        <div className="flex items-center space-x-1 text-gray-500 text-xs dark:text-gray-200">
          <span>Balance:</span>
          <span>
            {nativeBalance ? (
              `$${nativeBalance} ${NATIVE_TOKEN_SYMBOL}`
            ) : (
              <Skeleton className="h-2.5 w-14 rounded-full" />
            )}
          </span>
        </div>
      </div>
      <div className="flex gap-x-2">
        <Button
          className="flex-1 py-2 sm:py-1"
          disabled={amountDisabled}
          onClick={() => handleSetAmount(0.01)}
          outline={amount !== 0.01}
          size="sm"
        >
          $0.01
        </Button>
        <Button
          className="flex-1"
          disabled={amountDisabled}
          onClick={() => handleSetAmount(0.1)}
          outline={amount !== 0.1}
          size="sm"
        >
          $0.10
        </Button>
        <Button
          className="flex-1"
          disabled={amountDisabled}
          onClick={() => handleSetAmount(0.5)}
          outline={amount !== 0.5}
          size="sm"
        >
          $0.50
        </Button>
        <Button
          className="flex-1"
          disabled={amountDisabled}
          onClick={() => handleSetAmount(1)}
          outline={amount !== 5}
          size="sm"
        >
          $1
        </Button>
        <Button
          className="flex-1"
          disabled={amountDisabled}
          onClick={() => {
            handleSetAmount(other ? 0.01 : 5);
            setOther(!other);
          }}
          outline={!other}
          size="sm"
        >
          &#8230;
        </Button>
      </div>
      {other ? (
        <div>
          <Input
            className="no-spinner"
            max={1000}
            min={0}
            onChange={onOtherAmount}
            placeholder="300"
            ref={inputRef}
            type="number"
            value={amount}
          />
        </div>
      ) : null}
      <div className="pt-1">
        {isSubmitting || balanceLoading ? (
          <Button
            className={cn("flex justify-center", submitButtonClassName)}
            disabled
            icon={<Spinner className="my-0.5" size="xs" />}
          />
        ) : canTip ? (
          <Button
            className={submitButtonClassName}
            disabled={!amount || isSubmitting || !canTip}
            onClick={handleTip}
          >
            <b>Tip ${amount.toFixed(2)}</b>
          </Button>
        ) : (
          <TopUpButton
            amountToTopUp={
              Math.ceil((amount - Number(nativeBalance)) * 20) / 20
            }
            className="w-full"
          />
        )}
      </div>
    </div>
  );
};

export default memo(TipMenu);
