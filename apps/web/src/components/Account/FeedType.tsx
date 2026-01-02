import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Tabs } from "@/components/Shared/UI";
import { AccountFeedType } from "@/data/enums";
import generateUUID from "@/helpers/generateUUID";

interface FeedTypeProps {
  feedType: AccountFeedType;
  setFeedType: Dispatch<SetStateAction<AccountFeedType>>;
}

const FeedType = ({ feedType, setFeedType }: FeedTypeProps) => {
  const tabs = [
    { name: "Feed", type: AccountFeedType.Feed },
    { name: "Replies", type: AccountFeedType.Replies },
    { name: "Media", type: AccountFeedType.Media },
    { name: "Collected", type: AccountFeedType.Collects }
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  useEffect(() => {
    if (!tab) return;
    setFeedType(tab.toUpperCase() as AccountFeedType);
  }, [tab]);

  return (
    <Tabs
      active={feedType}
      key={generateUUID()}
      layoutId="account_tab"
      setActive={(type) => {
        setFeedType(type as AccountFeedType);
        setSearchParams(
          type !== AccountFeedType.Feed
            ? `tab=${type.toLowerCase()}`
            : undefined
        );
      }}
      tabs={tabs}
    />
  );
};

export default FeedType;
