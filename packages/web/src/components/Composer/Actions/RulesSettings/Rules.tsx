import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useGroupQuery } from "@palus/indexer";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Button, Tooltip } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";

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
      setCollectorsOnly(false);
    }
  }, [collectAction.enabled]);

  return (
    <>
      <div className="m-5 space-y-5">
        <ToggleWithHelper
          description="Only people who follow you can reply, quote, or repost"
          heading={
            <span className="font-semibold">
              Restrict to <span className="font-bold">my followers</span>
            </span>
          }
          on={!!followersOnly}
          setOn={() => setFollowersOnly(!followersOnly)}
        />
        <ToggleWithHelper
          description="Only people who you follow can reply, quote, or repost"
          heading={
            <span className="font-semibold">
              Restrict to <span className="font-bold">accounts I follow</span>
            </span>
          }
          on={!!followingOnly}
          setOn={() => setFollowingOnly(!followingOnly)}
        />
        {groupAddress ? (
          <ToggleWithHelper
            description="Only members of the group can reply"
            disabled={isGroupGatedFeed || groupLoading}
            heading={
              <span className="font-semibold">
                Restrict to <span className="font-bold">group members</span>
              </span>
            }
            icon={
              isGroupGatedFeed ? (
                <Tooltip content="This group only allows members to reply">
                  <InformationCircleIcon className="h-5 w-5 text-gray-400" />
                </Tooltip>
              ) : null
            }
            on={!!groupGate || !!isGroupGatedFeed}
            setOn={() =>
              setGroupGate(
                groupGate || isGroupGatedFeed ? undefined : groupAddress
              )
            }
          />
        ) : null}
        {collectAction.enabled ? (
          <ToggleWithHelper
            description="Only collectors of this post can reply"
            heading={
              <span className="font-semibold">
                Restrict to <span className="font-bold">collectors</span>
              </span>
            }
            on={!!collectorsOnly}
            setOn={() => setCollectorsOnly(!collectorsOnly)}
          />
        ) : null}
      </div>
      <div className="divider" />
      <div className="flex space-x-2 px-5 py-3">
        <Button
          className="ml-auto"
          onClick={() => {
            setFollowersOnly(false);
            setFollowingOnly(false);
            setGroupGate(undefined);
            setShowModal(false);
          }}
          outline
        >
          Reset
        </Button>
        <Button onClick={() => setShowModal(false)}>Save</Button>
      </div>
    </>
  );
};

export default Rules;
