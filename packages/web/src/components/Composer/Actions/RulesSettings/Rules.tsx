import type { FollowersOnlyPostRuleConfig } from "@palus/indexer";
import type { Dispatch, SetStateAction } from "react";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Button } from "@/components/Shared/UI";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";

interface RulesProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const Rules = ({ setShowModal }: RulesProps) => {
  const { rules = {}, setRules } = usePostRulesStore();

  const handleToggle = (key: keyof FollowersOnlyPostRuleConfig) => {
    const updated = { ...rules };

    if (updated[key]) {
      delete updated[key];
    } else {
      updated[key] = true;
    }

    const hasAny = Object.keys(updated).length > 0;
    setRules(hasAny ? updated : undefined);
  };

  return (
    <>
      <div className="m-5 space-y-5">
        <ToggleWithHelper
          description="Only people who follow you can reply"
          heading={
            <span className="font-semibold">
              Restrict <b>replies</b> to followers
            </span>
          }
          on={!!rules.repliesRestricted}
          setOn={() => handleToggle("repliesRestricted")}
        />
        <ToggleWithHelper
          description="Only people who follow you can quote this post"
          heading={
            <span className="font-semibold">
              Restrict <b>quotes</b> to followers
            </span>
          }
          on={!!rules.quotesRestricted}
          setOn={() => handleToggle("quotesRestricted")}
        />
        <ToggleWithHelper
          description="Only people who follow you can repost this"
          heading={
            <span className="font-semibold">
              Restrict <b>reposts</b> to followers
            </span>
          }
          on={!!rules.repostRestricted}
          setOn={() => handleToggle("repostRestricted")}
        />
      </div>
      <div className="divider" />
      <div className="flex space-x-2 p-5">
        <Button
          className="ml-auto"
          onClick={() => {
            setRules(undefined);
            setShowModal(false);
          }}
          outline
        >
          Cancel
        </Button>
        <Button onClick={() => setShowModal(false)}>Save</Button>
      </div>
    </>
  );
};

export default Rules;
