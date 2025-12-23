import { HomeFeedType } from "@palus/data/enums";
import New from "@/components/Shared/Badges/New";
import { Tabs } from "@/components/Shared/UI";
import { useHomeTabStore } from "@/store/persisted/useHomeTabStore";

const FeedType = () => {
  const { feedType, setFeedType } = useHomeTabStore();

  const tabs = [
    { name: "Timeline", type: HomeFeedType.TIMELINE },
    { name: "Following", type: HomeFeedType.FOLLOWING },
    { name: "For You", type: HomeFeedType.FORYOU },
    { name: "Top Accounts", suffix: <New />, type: HomeFeedType.TOP_ACCOUNTS }
  ];

  return (
    <Tabs
      active={feedType}
      layoutId="home_tab"
      setActive={(type) => {
        const nextType = type as HomeFeedType;
        setFeedType(nextType);
      }}
      tabs={tabs}
    />
  );
};

export default FeedType;
