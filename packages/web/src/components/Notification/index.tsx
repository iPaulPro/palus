import { useSearchParams } from "react-router";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
import { NotificationFeedType } from "@/data/enums";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import FeedType from "./FeedType";
import List from "./List";

const Notification = () => {
  const { currentAccount } = useAccountStore();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("type");
  const feedType: NotificationFeedType = tab
    ? (tab.toUpperCase() as NotificationFeedType)
    : NotificationFeedType.All;

  if (!currentAccount) {
    return <NotLoggedIn />;
  }

  return (
    <PageLayout title="Notifications">
      <FeedType />
      <List feedType={feedType} />
    </PageLayout>
  );
};

export default Notification;
