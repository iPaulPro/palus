import { StarIcon } from "@heroicons/react/24/outline";
import { m } from "motion/react";
import plur from "plur";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useComposerStore } from "@/components/Composer/ComposerStore";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Input } from "@/components/Shared/UI";
import { EXPANSION_EASE } from "@/helpers/variants";
import type { CollectActionType } from "@/types/palus";

interface CollectLimitConfigProps {
  setCollectType: (data: CollectActionType) => void;
}

const FIELD_NAME = "collectLimit";

const CollectLimitConfig = ({ setCollectType }: CollectLimitConfigProps) => {
  const collectAction = useComposerStore((state) => state.collectAction);
  const [enabled, setEnabled] = useState(Boolean(collectAction.collectLimit));

  const { register, watch, resetField, getFieldState } = useFormContext();

  const collectLimit = watch(FIELD_NAME);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const collectLimit = e.target.value;
      setCollectType({
        ...collectAction,
        collectLimit: collectLimit ? Number(collectLimit) : undefined
      });
    },
    [setCollectType, collectAction]
  );

  useEffect(() => {
    resetField(FIELD_NAME);
  }, [enabled]);

  return (
    <div className="mt-5">
      <ToggleWithHelper
        description="Make collects limited edition"
        heading="Exclusive content"
        icon={<StarIcon className="size-5" />}
        on={enabled}
        setOn={(on) => {
          setEnabled(on);
          setCollectType({
            collectLimit: collectAction.collectLimit
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
            className="no-spinner text-right"
            error={Boolean(getFieldState(FIELD_NAME).error)}
            iconRight={plur("edition", Number(collectLimit ?? 0))}
            label="Collect limit"
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="5"
            type="number"
            {...register(FIELD_NAME, { onChange })}
          />
        </m.div>
      ) : null}
    </div>
  );
};

export default CollectLimitConfig;
