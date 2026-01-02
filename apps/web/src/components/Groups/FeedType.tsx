import type { Dispatch, SetStateAction } from "react";
import { Tabs } from "@/components/Shared/UI";
import { GroupsFeedType } from "@/data/enums";

interface FeedTypeProps {
  feedType: GroupsFeedType;
  setFeedType: Dispatch<SetStateAction<GroupsFeedType>>;
}

const FeedType = ({ feedType, setFeedType }: FeedTypeProps) => {
  const tabs = [
    { name: "Your groups", type: GroupsFeedType.Member },
    { name: "Managed groups", type: GroupsFeedType.Managed }
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
