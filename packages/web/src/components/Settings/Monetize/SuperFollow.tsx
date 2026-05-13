import {
  type AccountFollowRules,
  AccountFollowRuleType,
  useMeLazyQuery,
  useUpdateAccountFollowRulesMutation
} from "@palus/indexer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import Custom404 from "@/components/Shared/404";
import BackButton from "@/components/Shared/BackButton";
import {
  Button,
  Card,
  CardHeader,
  Form,
  Image,
  Input,
  Tooltip,
  useZodForm
} from "@/components/Shared/UI";
import { NATIVE_TOKEN_SYMBOL, STATIC_IMAGES_URL } from "@/data/constants";
import errorToast from "@/helpers/errorToast";
import { getSimplePaymentDetails } from "@/helpers/rules";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import useWaitForTransactionToBeIndexed from "@/hooks/useWaitForTransactionToBeIndexed";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { ApolloClientError } from "@/types/errors";

const ValidationSchema = z.object({
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be greater than zero"
    })
});

const SuperFollow = () => {
  const { currentAccount, setCurrentAccount } = useAccountStore();
  const [isSubmitting, setIsSubmitting] = useState<
    "update" | "remove" | undefined
  >();
  const handleTransactionLifecycle = useTransactionLifecycle();
  const waitForTransactionToComplete = useWaitForTransactionToBeIndexed();
  const [getCurrentAccountDetails] = useMeLazyQuery({
    fetchPolicy: "no-cache"
  });

  const simplePaymentRule = useMemo(
    () =>
      currentAccount &&
      [...currentAccount.rules.required, ...currentAccount.rules.anyOf].find(
        (rule) => rule.type === AccountFollowRuleType.SimplePayment
      ),
    [currentAccount]
  );

  const simplePaymentAmount = useMemo(() => {
    if (!currentAccount) {
      return undefined;
    }

    const details = getSimplePaymentDetails(
      currentAccount.rules as AccountFollowRules
    );
    return details?.amount;
  }, [currentAccount]);

  const form = useZodForm({
    defaultValues: { amount: simplePaymentAmount?.toString() ?? "" },
    schema: ValidationSchema
  });

  useEffect(() => {
    form.reset({ amount: simplePaymentAmount?.toString() ?? "" });
  }, [simplePaymentAmount, form]);

  const onCompleted = async (hash: string) => {
    try {
      await waitForTransactionToComplete(hash);
    } catch (e: any) {
      errorToast(e);
      return;
    }
    const accountData = await getCurrentAccountDetails();
    setCurrentAccount(accountData?.data?.me.loggedInAs.account);
    toast.success("Setting updated");
    setIsSubmitting(undefined);
  };

  const onError = useCallback(
    (error: ApolloClientError) => {
      form.reset();
      errorToast(error);
      setIsSubmitting(undefined);
    },
    [form]
  );

  const [updateAccountFollowRules] = useUpdateAccountFollowRulesMutation({
    onCompleted: async ({ updateAccountFollowRules }) => {
      if (
        updateAccountFollowRules.__typename ===
        "UpdateAccountFollowRulesResponse"
      ) {
        return onCompleted(updateAccountFollowRules.hash);
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: updateAccountFollowRules
      });
    },
    onError
  });

  if (!currentAccount) {
    return <Custom404 />;
  }

  const handleUpdateRule = (
    data: z.infer<typeof ValidationSchema>,
    remove: boolean
  ) => {
    setIsSubmitting(remove ? "remove" : "update");

    return updateAccountFollowRules({
      variables: {
        request: {
          ...(remove
            ? { toRemove: [simplePaymentRule?.id] }
            : {
                ...(simplePaymentRule && {
                  toRemove: [simplePaymentRule?.id]
                }),
                toAdd: {
                  required: [
                    {
                      simplePaymentRule: {
                        native: data.amount,
                        recipient: currentAccount.address
                      }
                    }
                  ]
                }
              })
        }
      }
    });
  };

  const handleRemove = async () => {
    const data = form.getValues();
    form.clearErrors();

    await form.handleSubmit(async () => {
      await handleUpdateRule(data, true);
    })();
  };

  return (
    <Card>
      <CardHeader icon={<BackButton path="/settings" />} title="Super follow" />
      <Form
        className="m-5 flex flex-col gap-y-4"
        form={form}
        onSubmit={(data) => handleUpdateRule(data, false)}
      >
        <div>
          Set an amount that accounts must to pay to follow you. You can update
          this amount or remove it anytime.
        </div>
        <Input
          className="no-spinner"
          label="Amount"
          placeholder="1"
          prefix={
            <Tooltip
              content={`Payable in ${NATIVE_TOKEN_SYMBOL}`}
              placement="top"
            >
              <Image
                alt={NATIVE_TOKEN_SYMBOL}
                className="size-5 rounded-full"
                src={`${STATIC_IMAGES_URL}/gho.svg`}
              />
            </Tooltip>
          }
          step="any"
          type="number"
          {...form.register("amount")}
        />
        <div className="flex justify-end space-x-2">
          {simplePaymentRule && (
            <Button
              disabled={Boolean(isSubmitting)}
              loading={isSubmitting === "remove"}
              onClick={handleRemove}
              outline
              type="button"
            >
              Remove
            </Button>
          )}
          <Button
            disabled={Boolean(isSubmitting)}
            loading={isSubmitting === "update"}
            type="submit"
          >
            Update
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default SuperFollow;
