import { HomeFeedType } from "@palus/data/enums";
import { Tabs } from "@/components/Shared/UI";
import { useHomeTabStore } from "@/store/persisted/useHomeTabStore";

const FeedType = () => {
  const { feedType, setFeedType } = useHomeTabStore();

  const tabs = [
    { name: "Timeline", type: HomeFeedType.TIMELINE },
    { name: "Following", type: HomeFeedType.FOLLOWING },
    { name: "For You", type: HomeFeedType.FORYOU }
  ];

  return (
    <Tabs
      active={feedType}
      className="mx-5 mb-5 gap-6 md:mx-0 md:gap-2"
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
