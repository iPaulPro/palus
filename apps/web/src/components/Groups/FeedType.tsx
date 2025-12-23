import { GroupsFeedType } from "@palus/data/enums";
import type { Dispatch, SetStateAction } from "react";
import { Tabs } from "@/components/Shared/UI";

interface FeedTypeProps {
  feedType: GroupsFeedType;
  setFeedType: Dispatch<SetStateAction<GroupsFeedType>>;
}

const FeedType = ({ feedType, setFeedType }: FeedTypeProps) => {
  const tabs = [
    { name: "Managed groups", type: GroupsFeedType.Managed },
    { name: "Your groups", type: GroupsFeedType.Member }
  ];

  return (
    <Tabs
      active={feedType}
      layoutId="groups_tab"
      setActive={(type) => {
        const nextType = type as GroupsFeedType;
        setFeedType(nextType);
      }}
      tabs={tabs}
    />
  );
};

export default FeedType;
