import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Tabs } from "@/components/Shared/UI";
import { NotificationFeedType } from "@/data/enums";
import Settings from "./Settings";

interface FeedTypeProps {
  feedType: NotificationFeedType;
  setFeedType: Dispatch<SetStateAction<NotificationFeedType>>;
}

const FeedType = ({ feedType, setFeedType }: FeedTypeProps) => {
  const tabs = [
    { name: "All", type: NotificationFeedType.All },
    { name: "Mentions", type: NotificationFeedType.Mentions },
    { name: "Comments", type: NotificationFeedType.Comments },
    { name: "Likes", type: NotificationFeedType.Likes },
    { name: "Actions", type: NotificationFeedType.Actions },
    { name: "Rewards", type: NotificationFeedType.Rewards }
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("type");

  useEffect(() => {
    if (!tab) return;
    setFeedType(tab.toUpperCase() as NotificationFeedType);
  }, [tab]);

  return (
    <div className="flex items-center justify-between">
      <Tabs
        active={feedType}
        layoutId="notification_tab"
        setActive={(type) => {
          setFeedType(type as NotificationFeedType);
          setSearchParams(
            type !== NotificationFeedType.All
              ? `type=${type.toLowerCase()}`
              : undefined
          );
        }}
        tabs={tabs}
      />
      <Settings />
    </div>
  );
};

export default FeedType;
