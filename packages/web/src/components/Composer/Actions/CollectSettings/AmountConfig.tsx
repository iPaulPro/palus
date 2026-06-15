import {
  CurrencyDollarIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { m } from "motion/react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Input, Select } from "@/components/Shared/UI";
import { STATIC_IMAGES_URL } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import { TOKENS } from "@/data/tokens";
import { EXPANSION_EASE } from "@/helpers/variants";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { CollectActionType } from "@/types/palus";

interface AmountConfigProps {
  setCollectType: (data: CollectActionType) => void;
}

type Option = {
  icon: string;
  label: string;
  selected: boolean;
  value: string;
};

const FIELD_NAME_AMOUNT = "amount";
const FIELD_NAME_TOKEN = "token";

const AmountConfig = ({ setCollectType }: AmountConfigProps) => {
  const { currentAccount } = useAccountStore();
  const { collectAction } = useCollectActionStore((state) => state);
  const [enabled, setEnabled] = useState(
    Boolean(
      collectAction.payToCollect?.native ??
        collectAction.payToCollect?.erc20?.value
    )
  );

  const { control, register, watch, resetField, getFieldState } =
    useFormContext();

  const amount: string = watch(FIELD_NAME_AMOUNT) || "0";
  const token: string = watch(FIELD_NAME_TOKEN) || CONTRACTS.nativeToken;

  const tokens = TOKENS.reduce<Option[]>((acc, t) => {
    if (t.contractAddress !== "") {
      acc.push({
        icon: `${STATIC_IMAGES_URL}/${t.symbol.toLowerCase()}.svg`,
        label: t.name,
        selected: t.contractAddress === token,
        value: t.contractAddress
      });
    }
    return acc;
  }, []);

  useEffect(() => {
    resetField(FIELD_NAME_AMOUNT);
  }, [enabled]);

  const onAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!collectAction.payToCollect) return;
      setCollectType({
        payToCollect: {
          ...collectAction.payToCollect,
          ...(token === CONTRACTS.nativeToken
            ? {
                erc20: undefined,
                native: e.target.value ?? "0"
              }
            : {
                erc20: {
                  currency: token,
                  value: e.target.value ?? "0"
                },
                native: undefined
              })
        }
      });
    },
    [collectAction.payToCollect, setCollectType]
  );

  const onTokenChange = useCallback(
    (token: string) => {
      if (!collectAction.payToCollect) return;
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
    },
    [collectAction.payToCollect, setCollectType]
  );

  return (
    <div>
      <ToggleWithHelper
        description="Get paid whenever someone collects your post"
        heading="Charge for collecting"
        icon={<CurrencyDollarIcon className="size-5" />}
        on={enabled}
        setOn={(on) => {
          setEnabled(on);
          setCollectType({
            payToCollect: on
              ? (collectAction.payToCollect ?? {
                  native: "0",
                  recipients: [
                    { address: currentAccount?.address, percent: 100 }
                  ]
                })
              : undefined
          });
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
          <div className="flex gap-x-2 text-sm">
            <Input
              autoComplete="off"
              className="no-spinner text-right"
              error={Boolean(getFieldState(FIELD_NAME_AMOUNT).error)}
              iconRight="$"
              label="Price"
              min="0"
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="0.5"
              step="any"
              type="number"
              {...register(FIELD_NAME_AMOUNT, {
                onChange: onAmountChange
              })}
            />
            <div className="w-5/6">
              <div className="label">Select currency</div>
              <Controller
                control={control}
                name={FIELD_NAME_TOKEN}
                render={({ field }) => (
                  <Select
                    iconClassName="size-4 rounded-full"
                    onChange={(token) => {
                      field.onChange(token);
                      onTokenChange(token);
                    }}
                    options={tokens}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-x-1 pt-2 text-secondary text-sm">
            <InformationCircleIcon className="inline size-4" />
            3.5% fee for Lens Protocol (1.5%) and Palus (2%) deducted
          </div>
        </m.div>
      ) : null}
    </div>
  );
};

export default AmountConfig;
