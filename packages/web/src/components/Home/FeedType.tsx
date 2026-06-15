import { useApolloClient } from "@apollo/client";
import { PostsDocument, TimelineDocument } from "@palus/indexer";
import { useEffect, useState } from "react";
import { Spinner, Tabs } from "@/components/Shared/UI";
import { HomeFeedType } from "@/data/enums";
import useUmami from "@/hooks/useUmami";
import { useHomeTabStore } from "@/store/persisted/useHomeTabStore";
import Settings from "./Settings";

const FeedType = () => {
  const { feedType, setFeedType } = useHomeTabStore();
  const { track } = useUmami();
  const client = useApolloClient();

  const [isRefreshing, setRefreshing] = useState(false);

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

  const refresh = async (type: string) => {
    const refreshDoc =
      type === HomeFeedType.TIMELINE ? TimelineDocument : PostsDocument;
    setRefreshing(true);
    try {
      await client.refetchQueries({ include: [refreshDoc] });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Tabs
        active={feedType}
        layoutId="home_tab"
        setActive={async (type) => {
          if (type === feedType) {
            await refresh(type);
            return;
          }
          const nextType = type as HomeFeedType;
          setFeedType(nextType);
          track("Home Feed", { type: nextType.toLowerCase() });
        }}
        tabs={tabs}
      />
      <div className="flex items-center gap-x-2 pr-3">
        {isRefreshing && <Spinner size="sm" />}
        <Settings />
      </div>
    </div>
  );
};

export default FeedType;
