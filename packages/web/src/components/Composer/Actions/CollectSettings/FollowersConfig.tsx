import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useComposerStore } from "@/components/Composer/ComposerStore";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import type { CollectActionType } from "@/types/palus";

interface FollowersConfigProps {
  setCollectType: (data: CollectActionType) => void;
}

const FollowersConfig = ({ setCollectType }: FollowersConfigProps) => {
  const collectAction = useComposerStore((state) => state.collectAction);

  return (
    <div className="mt-5">
      <ToggleWithHelper
        description="Only followers can collect"
        heading="Exclusivity"
        icon={<UserGroupIcon className="size-5" />}
        on={collectAction.followerOnly || false}
        setOn={() =>
          setCollectType({ followerOnly: !collectAction.followerOnly })
        }
      />
    </div>
  );
};

export default FollowersConfig;
