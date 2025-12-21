import { NotificationFeedType } from "@palus/data/enums";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Tabs } from "@/components/Shared/UI";

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
    <Tabs
      active={feedType}
      className="mx-5 mb-5 md:mx-0"
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
  );
};

export default FeedType;
