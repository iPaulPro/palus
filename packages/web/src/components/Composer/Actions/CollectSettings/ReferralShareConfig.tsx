import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { m } from "motion/react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Input, useZodForm } from "@/components/Shared/UI";
import { EXPANSION_EASE } from "@/helpers/variants";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import type { CollectActionType } from "@/types/palus";

interface CollectReferralConfigProps {
  setCollectType: (data: CollectActionType) => void;
}

const ValidationSchema = z.object({
  referralShare: z
    .string()
    .min(1, { message: "Share must be set if enabled" })
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Share must be greater than zero"
    })
});

const ReferralShareConfig = ({
  setCollectType
}: CollectReferralConfigProps) => {
  const { collectAction } = useCollectActionStore((state) => state);

  const hasReferralShare =
    collectAction.payToCollect?.referralShare !== null &&
    collectAction.payToCollect?.referralShare !== undefined;

  const form = useZodForm({
    defaultValues: {
      referralShare:
        collectAction.payToCollect?.referralShare?.toString() ?? undefined
    },
    schema: ValidationSchema
  });

  return (
    <div className="mt-5">
      <ToggleWithHelper
        description="Share the collect fee with accounts that repost"
        heading="Referral share"
        icon={<ArrowsRightLeftIcon className="size-5" />}
        on={hasReferralShare}
        setOn={(on) => {
          if (!collectAction.payToCollect) return;
          setCollectType({
            payToCollect: {
              ...collectAction.payToCollect,
              referralShare: on
                ? (collectAction.payToCollect.referralShare ?? 0)
                : null
            }
          });
        }}
      />
      {hasReferralShare ? (
        <m.div
          animate="visible"
          className="mt-4 ml-8 text-sm"
          initial="hidden"
          transition={{ duration: 0.2, ease: EXPANSION_EASE }}
          variants={{
            hidden: { height: 0, opacity: 0, y: -20 },
            visible: { height: "auto", opacity: 1, y: 0 }
          }}
        >
          <FormProvider {...form}>
            <Input
              autoComplete="off"
              className="no-spinner text-right"
              iconRight="%"
              label="Referral share"
              max="100"
              min="1"
              {...form.register("referralShare", {
                onChange: (event) => {
                  if (!collectAction.payToCollect) return;
                  setCollectType({
                    payToCollect: {
                      ...collectAction.payToCollect,
                      referralShare: Number(event.target.value || 0)
                    }
                  });
                }
              })}
              placeholder="5"
              type="number"
            />
          </FormProvider>
          <div className="pt-2 text-orange-600 text-sm">
            This is <b>after</b> the 3.5% fee taken by Lens and Palus
          </div>
        </m.div>
      ) : null}
    </div>
  );
};

export default ReferralShareConfig;
