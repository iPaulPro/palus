import dayjs from "dayjs";
import { m } from "motion/react";
import { useCallback, useMemo } from "react";
import { isAddress, parseUnits } from "viem";
import { z } from "zod";
import ReferralShareConfig from "@/components/Composer/Actions/CollectSettings/ReferralShareConfig";
import LicensePicker from "@/components/Composer/LicensePicker";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Button, Form, useZodForm } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import { findToken, NATIVE_TOKEN } from "@/data/tokens";
import { EXPANSION_EASE } from "@/helpers/variants";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import type { CollectActionType } from "@/types/palus";
import AmountConfig from "./AmountConfig";
import CollectLimitConfig from "./CollectLimitConfig";
import FollowersConfig from "./FollowersConfig";
import SplitConfig from "./SplitConfig";
import TimeLimitConfig from "./TimeLimitConfig";

interface CollectFormProps {
  setShowModal: (show: boolean) => void;
  onSubmit?: (values: CollectActionType) => void;
}

const CollectForm = ({ setShowModal, onSubmit }: CollectFormProps) => {
  const { collectAction, updateCollectAction, reset } = useCollectActionStore();
  const { attachments } = usePostAttachmentStore();

  const recipients = collectAction.payToCollect?.recipients || [];
  const splitTotal = recipients.reduce((acc, { percent }) => acc + percent, 0);

  const validationSchema = useMemo(() => {
    const token = findToken(
      collectAction.payToCollect?.erc20?.currency ?? CONTRACTS.nativeToken
    );
    const hasReferralShare =
      collectAction.payToCollect?.referralShare !== null &&
      collectAction.payToCollect?.referralShare !== undefined;
    const hasCollectLimit =
      collectAction.collectLimit !== null &&
      collectAction.collectLimit !== undefined;
    return z
      .object({
        amount: collectAction.payToCollect
          ? z
              .string()
              .min(1, { message: "Price is required" })
              .refine(
                (val) =>
                  val !== undefined &&
                  parseUnits(val, token?.decimals ?? NATIVE_TOKEN.decimals) >
                    0n,
                {
                  message: "Price must be greater than zero"
                }
              )
          : z.any(),
        collectLimit: hasCollectLimit
          ? z
              .string()
              .min(1, { message: "Collect limit must be set if enabled" })
              .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
                message: "Collect limit must be greater than zero if enabled"
              })
          : z.any(),
        endAtDate: collectAction.endsAt ? z.date() : z.any(),
        endAtTime: collectAction.endsAt ? z.string() : z.any(),
        referralShare: hasReferralShare
          ? z
              .string()
              .min(1, { message: "Share must be set if enabled" })
              .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
                message: "Share must be greater than zero if enabled"
              })
          : z.any(),
        token: z.any()
      })
      .superRefine((data, ctx) => {
        const { endAtDate, endAtTime } = data;
        if (!endAtDate || !endAtTime) return;

        const isDateInPast = dayjs(endAtDate as Date)
          .startOf("day")
          .isBefore(dayjs().startOf("day"));
        if (isDateInPast) {
          ctx.addIssue({
            code: "custom",
            message: "End date cannot be in the past",
            path: ["endAtDate"]
          });
        }

        const [hours, minutes, seconds = 0] = (endAtTime as string)
          .split(":")
          .map(Number);
        const newEndAt = dayjs(endAtDate as Date)
          .hour(hours)
          .minute(minutes)
          .second(seconds)
          .millisecond(0);
        if (!newEndAt.isAfter(dayjs())) {
          ctx.addIssue({
            code: "custom",
            message: "End time must be in the future",
            path: ["endAtTime"]
          });
        }
      });
  }, [
    collectAction.payToCollect,
    collectAction.collectLimit,
    collectAction.payToCollect?.referralShare,
    collectAction.endsAt
  ]);

  const form = useZodForm({
    defaultValues: {
      amount:
        collectAction.payToCollect?.native ??
        collectAction.payToCollect?.erc20?.value,
      collectLimit: collectAction.collectLimit,
      endAtDate: collectAction.endsAt
        ? new Date(collectAction.endsAt)
        : undefined,
      endAtTime: collectAction.endsAt
        ? dayjs(collectAction.endsAt).format("HH:mm:ss")
        : undefined,
      referralShare: collectAction.payToCollect?.referralShare?.toString(),
      token: collectAction.payToCollect?.native
        ? CONTRACTS.nativeToken
        : collectAction.payToCollect?.erc20?.currency
    },
    schema: validationSchema
  });

  const validationChecks = {
    hasEmptyRecipients: recipients.some(({ address }) => !address),
    hasImproperSplits: recipients.length > 1 && splitTotal !== 100,
    hasInvalidEthAddress: recipients.some(
      ({ address }) => address && !isAddress(address)
    ),
    hasZeroSplits: recipients.some(({ percent }) => percent === 0),
    isRecipientsDuplicated:
      new Set(recipients.map(({ address }) => address)).size !==
      recipients.length
  };

  const setCollectType = (data: CollectActionType) => {
    updateCollectAction(data);
  };

  const toggleCollect = () => {
    if (collectAction.enabled) {
      reset();
    } else {
      setCollectType({ enabled: true });
    }
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const handleSubmit = useCallback(() => {
    if (onSubmit && collectAction.enabled) {
      onSubmit(collectAction);
      reset();
    }
    setShowModal(false);
  }, [onSubmit, collectAction, reset, setShowModal]);

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <div className="p-5">
        <ToggleWithHelper
          description="This post can be collected"
          heading="Enable Collect"
          on={collectAction.enabled || false}
          setOn={toggleCollect}
        />
      </div>
      <div className="divider" />
      {collectAction.enabled && (
        <>
          <m.div
            animate="visible"
            className="m-5 overflow-hidden"
            initial="hidden"
            transition={{ duration: 0.2, ease: EXPANSION_EASE }}
            variants={{
              hidden: { height: 0, opacity: 0, y: -20 },
              visible: { height: "auto", opacity: 1, y: 0 }
            }}
          >
            <AmountConfig setCollectType={setCollectType} />
            {(collectAction.payToCollect?.native ||
              collectAction.payToCollect?.erc20?.value) && (
              <>
                <SplitConfig
                  isRecipientsDuplicated={
                    validationChecks.isRecipientsDuplicated
                  }
                  setCollectType={setCollectType}
                />
                <ReferralShareConfig setCollectType={setCollectType} />
              </>
            )}
            <CollectLimitConfig setCollectType={setCollectType} />
            <TimeLimitConfig />
            <FollowersConfig setCollectType={setCollectType} />
          </m.div>
          {attachments.length > 0 && (
            <>
              <div className="divider" />
              <div className="mx-5">
                <LicensePicker />
              </div>
            </>
          )}
          <div className="divider" />
        </>
      )}
      <div className="flex gap-x-2 p-5">
        <Button className="ml-auto" onClick={handleClose} variant="outline">
          {collectAction.enabled ? "Reset" : "Cancel"}
        </Button>
        <Button
          disabled={Object.values(validationChecks).some(Boolean)}
          type="submit"
        >
          {onSubmit && collectAction.enabled ? "Submit" : "Done"}
        </Button>
      </div>
    </Form>
  );
};

export default CollectForm;
