import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { m } from "motion/react";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Input, Select, useZodForm } from "@/components/Shared/UI";
import { STATIC_IMAGES_URL } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import { TOKENS } from "@/data/tokens";
import { EXPANSION_EASE } from "@/helpers/variants";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { CollectActionType } from "@/types/palus";

const ValidationSchema = z.object({
  amount: z
    .string()
    .min(1, { message: "Price is required" })
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Price must be greater than zero"
    })
});

interface AmountConfigProps {
  setCollectType: (data: CollectActionType) => void;
}

const AmountConfig = ({ setCollectType }: AmountConfigProps) => {
  const { currentAccount } = useAccountStore();
  const { collectAction } = useCollectActionStore((state) => state);

  const [selectedToken, setSelectedToken] = useState<string>(
    collectAction.payToCollect?.erc20?.currency ?? CONTRACTS.nativeToken
  );

  const enabled = Boolean(
    collectAction.payToCollect?.native ??
      collectAction.payToCollect?.erc20?.value
  );

  const currentAmount = enabled
    ? ((selectedToken === CONTRACTS.nativeToken
        ? collectAction.payToCollect?.native
        : collectAction.payToCollect?.erc20?.value) ?? "1")
    : "1";

  const form = useZodForm({
    defaultValues: { amount: currentAmount },
    schema: ValidationSchema
  });

  const amount = form.watch("amount") || "0";

  useEffect(() => {
    form.reset({ amount: currentAmount });
  }, [enabled]);

  const tokens = TOKENS.filter((token) => token.contractAddress !== "").map(
    (token) => ({
      icon: `${STATIC_IMAGES_URL}/${token.symbol.toLowerCase()}.svg`,
      label: token.name,
      selected: token.contractAddress === selectedToken,
      value: token.contractAddress
    })
  );

  return (
    <div>
      <ToggleWithHelper
        description="Get paid whenever someone collects your post"
        heading="Charge for collecting"
        icon={<CurrencyDollarIcon className="size-5" />}
        on={enabled}
        setOn={() => {
          setCollectType({
            payToCollect: enabled
              ? undefined
              : (collectAction.payToCollect ?? {
                  native: "1",
                  recipients: [
                    { address: currentAccount?.address, percent: 100 }
                  ], // 2.45% for the Palus platform fees after the 1.5% lens fees cut
                  referralShare: 3
                })
          });
          if (!collectAction.payToCollect) {
            setSelectedToken(CONTRACTS.nativeToken);
          }
        }}
      />
      {enabled ? (
        <m.div
          animate="visible"
          className="mt-4 ml-8"
          initial="hidden"
          transition={{ duration: 0.2, ease: EXPANSION_EASE }}
          variants={{
            hidden: { height: 0, opacity: 0, y: -20 },
            visible: { height: "auto", opacity: 1, y: 0 }
          }}
        >
          <FormProvider {...form}>
            <div className="flex gap-x-2 text-sm">
              <Input
                autoComplete="off"
                label="Price"
                min="0"
                placeholder="0.5"
                type="number"
                {...form.register("amount", {
                  onChange: (event) => {
                    if (!collectAction.payToCollect) return;
                    setCollectType({
                      payToCollect: {
                        ...collectAction.payToCollect,
                        ...(selectedToken === CONTRACTS.nativeToken
                          ? {
                              erc20: undefined,
                              native: event.target.value
                                ? event.target.value
                                : "0"
                            }
                          : {
                              erc20: {
                                currency: selectedToken,
                                value: event.target.value
                                  ? event.target.value
                                  : "0"
                              },
                              native: undefined
                            })
                      }
                    });
                  }
                })}
              />
              <div className="w-5/6">
                <div className="label">Select currency</div>
                <Select
                  iconClassName="size-4 rounded-full"
                  onChange={(token) => {
                    if (!collectAction.payToCollect) return;
                    setSelectedToken(token);
                    setCollectType({
                      payToCollect: {
                        ...collectAction.payToCollect,
                        ...(token === CONTRACTS.nativeToken
                          ? {
                              erc20: undefined,
                              native: amount
                            }
                          : {
                              erc20: {
                                currency: token,
                                value: amount
                              },
                              native: undefined
                            })
                      }
                    });
                  }}
                  options={tokens}
                />
              </div>
            </div>
          </FormProvider>
        </m.div>
      ) : null}
    </div>
  );
};

export default AmountConfig;
