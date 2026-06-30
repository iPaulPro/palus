import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useGroupQuery } from "@palus/indexer";
import { m } from "motion/react";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Button, Tooltip } from "@/components/Shared/UI";
import Checkbox from "@/components/Shared/UI/Checkbox";
import { CONTRACTS } from "@/data/contracts";
import { EXPANSION_EASE } from "@/helpers/variants";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { usePostContentWarningStore } from "@/store/non-persisted/post/usePostContentWarningStore";
import {
  type RuleState,
  usePostRulesStore
} from "@/store/non-persisted/post/usePostRulesStore";

const ALL_RESTRICTED: RuleState = {
  quotesRestricted: true,
  repliesRestricted: true,
  repostsRestricted: true
};

interface RuleOptionsProps {
  value: RuleState | undefined;
  onChange: (value: RuleState | undefined) => void;
}

const RuleOptions = ({ value, onChange }: RuleOptionsProps) => {
  return (
    <m.div
      animate={value ? "visible" : "hidden"}
      className="overflow-hidden"
      initial="hidden"
      transition={{ duration: 0.2, ease: EXPANSION_EASE }}
      variants={{
        hidden: { height: 0, opacity: 0, y: -8 },
        visible: { height: "auto", opacity: 1, y: 0 }
      }}
    >
      <div className="flex gap-x-4 pt-3">
        <Checkbox
          checked={value?.repliesRestricted ?? false}
          label="Replies"
          labelClassName="text-sm"
          onChange={(e) => {
            const next = {
              ...(value ?? ALL_RESTRICTED),
              repliesRestricted: e.target.checked
            };
            onChange(
              next.repliesRestricted ||
                next.repostsRestricted ||
                next.quotesRestricted
                ? next
                : undefined
            );
          }}
        />
        <Checkbox
          checked={value?.quotesRestricted ?? false}
          label="Quotes"
          labelClassName="text-sm"
          onChange={(e) => {
            const next = {
              ...(value ?? ALL_RESTRICTED),
              quotesRestricted: e.target.checked
            };
            onChange(
              next.repliesRestricted ||
                next.repostsRestricted ||
                next.quotesRestricted
                ? next
                : undefined
            );
          }}
        />
        <Checkbox
          checked={value?.repostsRestricted ?? false}
          label="Reposts"
          labelClassName="text-sm"
          onChange={(e) => {
            const next = {
              ...(value ?? ALL_RESTRICTED),
              repostsRestricted: e.target.checked
            };
            onChange(
              next.repliesRestricted ||
                next.repostsRestricted ||
                next.quotesRestricted
                ? next
                : undefined
            );
          }}
        />
      </div>
    </m.div>
  );
};

interface RulesProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  groupAddress?: string;
}

const Rules = ({ setShowModal, groupAddress }: RulesProps) => {
  const {
    followersOnly,
    followingOnly,
    groupGate,
    collectorsOnly,
    setFollowersOnly,
    setFollowingOnly,
    setGroupGate,
    setCollectorsOnly
  } = usePostRulesStore();
  const { setContentWarning } = usePostContentWarningStore();

  const { collectAction } = useCollectActionStore();

  const { data, loading: groupLoading } = useGroupQuery({
    skip: !groupAddress,
    variables: {
      request: {
        group: groupAddress
      }
    }
  });

  const groupGatedFeedConfig = data?.group?.feed?.rules?.required
    ?.find((feedRule) => feedRule.address === CONTRACTS.groupGatedFeedRule)
    ?.config.find(
      (keyValue) =>
        keyValue.__typename === "BooleanKeyValue" &&
        keyValue.key === "groupRepliesRestricted"
    );
  const isGroupGatedFeed =
    groupGatedFeedConfig?.__typename === "BooleanKeyValue" &&
    groupGatedFeedConfig.boolean;

  useEffect(() => {
    if (isGroupGatedFeed) {
      setGroupGate(undefined);
    }
  }, [isGroupGatedFeed]);

  useEffect(() => {
    if (!collectAction.enabled) {
      setCollectorsOnly(undefined);
    }
  }, [collectAction.enabled]);

  return (
    <>
      <div className="space-y-5 px-5 pt-1 pb-6">
        <div>
          <ToggleWithHelper
            description="Only people who follow you can reply, quote, or repost"
            heading={
              <span className="font-semibold">
                Restrict to <span className="font-bold">my followers</span>
              </span>
            }
            on={!!followersOnly}
            setOn={() =>
              setFollowersOnly(followersOnly ? undefined : ALL_RESTRICTED)
            }
          />
          <RuleOptions onChange={setFollowersOnly} value={followersOnly} />
        </div>
        <div>
          <ToggleWithHelper
            description="Only people who you follow can reply, quote, or repost"
            heading={
              <span className="font-semibold">
                Restrict to <span className="font-bold">accounts I follow</span>
              </span>
            }
            on={!!followingOnly}
            setOn={() =>
              setFollowingOnly(followingOnly ? undefined : ALL_RESTRICTED)
            }
          />
          <RuleOptions onChange={setFollowingOnly} value={followingOnly} />
        </div>
        {groupAddress ? (
          <ToggleWithHelper
            description="Only members of the group can reply"
            disabled={isGroupGatedFeed || groupLoading}
            heading={
              <span className="flex items-center gap-x-2 font-semibold">
                Restrict to <span className="font-bold">group members</span>
                {isGroupGatedFeed ? (
                  <Tooltip
                    content="This group only allows members to reply"
                    placement="top"
                    showOnClick
                  >
                    <InformationCircleIcon className="size-5 text-gray-400" />
                  </Tooltip>
                ) : null}
              </span>
            }
            on={!!groupGate || isGroupGatedFeed}
            setOn={() =>
              setGroupGate(
                groupGate || isGroupGatedFeed ? undefined : groupAddress
              )
            }
          />
        ) : null}
        {collectAction.enabled ? (
          <div>
            <ToggleWithHelper
              description="Only collectors of this post can reply, quote, or repost"
              heading={
                <span className="font-semibold">
                  Restrict to <span className="font-bold">collectors</span>
                </span>
              }
              on={!!collectorsOnly}
              setOn={() =>
                setCollectorsOnly(collectorsOnly ? undefined : ALL_RESTRICTED)
              }
            />
            <RuleOptions onChange={setCollectorsOnly} value={collectorsOnly} />
          </div>
        ) : null}
      </div>
      <div className="divider" />
      <div className="flex gap-x-2 px-5 py-3">
        <Button
          className="ml-auto"
          onClick={() => {
            setFollowersOnly(undefined);
            setFollowingOnly(undefined);
            setGroupGate(undefined);
            setCollectorsOnly(undefined);
            setContentWarning(undefined);
            setShowModal(false);
          }}
          variant="outline"
        >
          Reset
        </Button>
        <Button onClick={() => setShowModal(false)}>Done</Button>
      </div>
    </>
  );
};

export default Rules;
