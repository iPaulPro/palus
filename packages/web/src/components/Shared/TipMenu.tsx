import {
  type AccountFragment,
  type PostFragment,
  useBalancesBulkQuery
} from "@palus/indexer";
import { memo, type RefObject, useEffect, useRef, useState } from "react";
import { z } from "zod";
import TopUpButton from "@/components/Shared/Account/TopUp/Button";
import LoginButton from "@/components/Shared/LoginButton";
import Skeleton from "@/components/Shared/Skeleton";
import { Button, Form, Input, useZodForm } from "@/components/Shared/UI";
import { NATIVE_TOKEN_SYMBOL } from "@/data/constants";
import usePreventScrollOnNumberInput from "@/hooks/usePreventScrollOnNumberInput";
import { useSendTip } from "@/hooks/useSendTip";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const ValidationSchema = z.object({
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be greater than zero"
    })
});

const submitButtonClassName = "w-full py-2 sm:py-1.5 text-base font-semibold";

interface TipMenuProps {
  closePopover: () => void;
  post?: PostFragment;
  account?: AccountFragment;
}

const formatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 6,
  minimumFractionDigits: 2
});

const TipMenu = ({ closePopover, post, account }: TipMenuProps) => {
  const { currentAccount } = useAccountStore();
  const [other, setOther] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  usePreventScrollOnNumberInput(inputRef as RefObject<HTMLInputElement>);

  const form = useZodForm({
    defaultValues: { amount: "0.01" },
    schema: ValidationSchema
  });

  const amount = Number(form.watch("amount")) || 0;

  const { send: handleTip, isSending: isSubmitting } = useSendTip({
    account,
    amount,
    onSuccess: closePopover,
    post
  });

  const { data: balances, loading: balanceLoading } = useBalancesBulkQuery({
    fetchPolicy: "no-cache",
    pollInterval: 3000,
    skip: !currentAccount?.address,
    variables: {
      request: { address: currentAccount?.address, includeNative: true }
    }
  });

  useEffect(() => {
    if (other) {
      inputRef.current?.focus();
    }
  }, [other]);

  const balance =
    balances?.balancesBulk[0].__typename === "NativeAmount"
      ? Number(balances.balancesBulk[0].value)
      : 0;
  const canTip = balance >= amount;
  const balanceFormatted = balance.toFixed(2);

  const handleSetAmount = (value: number) => {
    form.setValue("amount", String(value), { shouldValidate: true });
    setOther(false);
  };

  const { ref: registerRef, ...amountInputProps } = form.register("amount");

  const amountDisabled = isSubmitting || !currentAccount;

  if (!currentAccount) {
    return <LoginButton className="m-5" title="Login to Tip" />;
  }

  return (
    <Form form={form} onSubmit={() => handleTip()}>
      <div className="m-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-x-1 text-gray-500 text-xs dark:text-gray-200">
            <span>Balance:</span>
            <span>
              {balanceFormatted ? (
                `$${balanceFormatted} ${NATIVE_TOKEN_SYMBOL}`
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
            size="sm"
            variant={amount === 0.01 ? "primary" : "outline"}
          >
            $0.01
          </Button>
          <Button
            className="flex-1"
            disabled={amountDisabled}
            onClick={() => handleSetAmount(0.1)}
            size="sm"
            variant={amount === 0.1 ? "primary" : "outline"}
          >
            $0.10
          </Button>
          <Button
            className="flex-1"
            disabled={amountDisabled}
            onClick={() => handleSetAmount(0.5)}
            size="sm"
            variant={amount === 0.5 ? "primary" : "outline"}
          >
            $0.50
          </Button>
          <Button
            className="flex-1"
            disabled={amountDisabled}
            onClick={() => handleSetAmount(1)}
            size="sm"
            variant={amount === 1 ? "primary" : "outline"}
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
            size="sm"
            variant={other ? "primary" : "outline"}
          >
            &#8230;
          </Button>
        </div>
        {other ? (
          <div>
            <Input
              {...amountInputProps}
              autoComplete="off"
              className="no-spinner text-center"
              min={0}
              placeholder="10"
              ref={(el) => {
                registerRef(el);
                inputRef.current = el;
              }}
              step="any"
              type="number"
            />
          </div>
        ) : null}
        <div className="pt-1">
          {canTip || balanceLoading ? (
            <Button
              className={submitButtonClassName}
              disabled={!amount || isSubmitting || !canTip}
              loading={isSubmitting || balanceLoading}
              loadingText={
                isSubmitting ? "Waiting for wallet signature…" : "Loading…"
              }
              type="submit"
            >
              <b>Tip ${formatter.format(amount)}</b>
            </Button>
          ) : (
            <TopUpButton
              amountToTopUp={Math.ceil((amount - balance) * 20) / 20}
              className="w-full"
            />
          )}
        </div>
      </div>
    </Form>
  );
};

export default memo(TipMenu);
