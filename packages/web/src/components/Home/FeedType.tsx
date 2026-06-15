import { useEffect } from "react";
import { Tabs } from "@/components/Shared/UI";
import { HomeFeedType } from "@/data/enums";
import useUmami from "@/hooks/useUmami";
import { useHomeTabStore } from "@/store/persisted/useHomeTabStore";
import Settings from "./Settings";

const FeedType = () => {
  const { feedType, setFeedType } = useHomeTabStore();
  const { track } = useUmami();

  const tabs = [
    { name: "Timeline", type: HomeFeedType.TIMELINE },
    // { name: "For You", type: HomeFeedType.FORYOU },
    { name: "Top Accounts", type: HomeFeedType.TOP_ACCOUNTS },
    { name: "All Posts", type: HomeFeedType.ALL_POSTS }
  ];

  useEffect(() => {
    if (
      feedType === HomeFeedType.FOLLOWING ||
      feedType === HomeFeedType.FORYOU
    ) {
      setFeedType(HomeFeedType.TIMELINE);
    }
  }, [feedType]);

  return (
    <div className="flex items-center justify-between">
      <Tabs
        active={feedType}
        layoutId="home_tab"
        setActive={(type) => {
          const nextType = type as HomeFeedType;
          setFeedType(nextType);
          track("Home Feed", { type: nextType.toLowerCase() });
        }}
        tabs={tabs}
      />
      <Settings />
    </div>
  );
};

export default FeedType;
