import {
  ArrowsRightLeftIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { m } from "motion/react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Input } from "@/components/Shared/UI";
import { EXPANSION_EASE } from "@/helpers/variants";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import type { CollectActionType } from "@/types/palus";

interface CollectReferralConfigProps {
  setCollectType: (data: CollectActionType) => void;
}

const FIELD_NAME = "referralShare";

const ReferralShareConfig = ({
  setCollectType
}: CollectReferralConfigProps) => {
  const { collectAction } = useCollectActionStore((state) => state);
  const [enabled, setEnabled] = useState(
    Boolean(collectAction.payToCollect?.referralShare)
  );

  const { register, getFieldState, resetField } = useFormContext();

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!collectAction.payToCollect) return;
      const referralShare = e.target.value;
      setCollectType({
        payToCollect: {
          ...collectAction.payToCollect,
          referralShare: referralShare ? Number(referralShare) : undefined
        }
      });
    },
    [collectAction.payToCollect, setCollectType]
  );

  useEffect(() => {
    resetField(FIELD_NAME);
  }, [enabled]);

  return (
    <div className="mt-5">
      <ToggleWithHelper
        description="Share the collect fee with accounts that repost"
        heading="Referral share"
        icon={<ArrowsRightLeftIcon className="size-5" />}
        on={enabled}
        setOn={(on) => {
          setEnabled(on);
          if (!collectAction.payToCollect) return;
          setCollectType({
            payToCollect: {
              ...collectAction.payToCollect,
              referralShare: collectAction.payToCollect.referralShare
            }
          });
        }}
      />
      {enabled ? (
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
          <Input
            autoComplete="off"
            className="no-spinner text-right"
            error={Boolean(getFieldState(FIELD_NAME).error)}
            iconRight="%"
            label="Referral share"
            max="100"
            min="0"
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="5"
            step="any"
            type="number"
            {...register(FIELD_NAME, { onChange })}
          />
          <div className="flex items-center gap-x-1 pt-2 text-secondary text-sm">
            <InformationCircleIcon className="inline size-4" />
            <span>
              This is <b>after</b> the 3.5% fee taken by Lens and Palus
            </span>
          </div>
        </m.div>
      ) : null}
    </div>
  );
};

export default ReferralShareConfig;
