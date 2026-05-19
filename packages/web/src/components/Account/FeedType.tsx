import { useSearchParams } from "react-router";
import { Tabs } from "@/components/Shared/UI";
import { AccountFeedType } from "@/data/enums";

const tabs = [
  { name: "Feed", type: AccountFeedType.Feed },
  { name: "Replies", type: AccountFeedType.Replies },
  { name: "Media", type: AccountFeedType.Media },
  { name: "Collected", type: AccountFeedType.Collects }
];

const FeedType = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const active: AccountFeedType = tab
    ? (tab.toUpperCase() as AccountFeedType)
    : AccountFeedType.Feed;

  return (
    <Tabs
      active={active}
      layoutId="account_tab"
      setActive={(type) => {
        setSearchParams(
          type === AccountFeedType.Feed
            ? {}
            : { tab: (type as string).toLowerCase() }
        );
      }}
      tabs={tabs}
    />
  );
};

export default FeedType;
