import { useSearchParams } from "react-router";
import { Tabs } from "@/components/Shared/UI";
import { NotificationFeedType } from "@/data/enums";
import Settings from "./Settings";

const tabs = [
  { name: "All", type: NotificationFeedType.All },
  { name: "Mentions", type: NotificationFeedType.Mentions },
  { name: "Comments", type: NotificationFeedType.Comments },
  { name: "Likes", type: NotificationFeedType.Likes },
  { name: "Actions", type: NotificationFeedType.Actions }
];

const FeedType = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("type");
  const active: NotificationFeedType = tab
    ? (tab.toUpperCase() as NotificationFeedType)
    : NotificationFeedType.All;

  return (
    <div className="flex items-center justify-between">
      <Tabs
        active={active}
        layoutId="notification_tab"
        setActive={(type) => {
          setSearchParams(
            type === NotificationFeedType.All
              ? undefined
              : `type=${(type as string).toLowerCase()}`
          );
        }}
        tabs={tabs}
      />
      <Settings />
    </div>
  );
};

export default FeedType;
