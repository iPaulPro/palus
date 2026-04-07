import { PlusIcon } from "@heroicons/react/24/outline";
import type { Dispatch, SetStateAction } from "react";
import { Button, Tabs } from "@/components/Shared/UI";
import { GroupsFeedType } from "@/data/enums";
import { useCreateGroupStore } from "@/store/non-persisted/modal/useCreateGroupStore";

interface FeedTypeProps {
  feedType: GroupsFeedType;
  setFeedType: Dispatch<SetStateAction<GroupsFeedType>>;
}

const FeedType = ({ feedType, setFeedType }: FeedTypeProps) => {
  const { setShowCreateGroupModal } = useCreateGroupStore();

  const tabs = [
    { name: "Your groups", type: GroupsFeedType.Member },
    { name: "Managed groups", type: GroupsFeedType.Managed }
  ];

  return (
    <div className="mr-4 flex items-center justify-between">
      <Tabs
        active={feedType}
        layoutId="groups_tab"
        setActive={(type) => {
          const nextType = type as GroupsFeedType;
          setFeedType(nextType);
        }}
        tabs={tabs}
      />
      <Button
        className="!px-1.5 block sm:hidden"
        onClick={() => setShowCreateGroupModal(true)}
        outline
      >
        <PlusIcon className="size-5" />
      </Button>
    </div>
  );
};

export default FeedType;
