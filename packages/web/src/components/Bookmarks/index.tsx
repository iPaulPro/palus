import type { MainContentFocus } from "@palus/indexer";
import { useSearchParams } from "react-router";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
import ContentFeedType from "@/components/Shared/Post/ContentFeedType";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import BookmarksFeed from "./BookmarksFeed";

const Bookmarks = () => {
  const { currentAccount } = useAccountStore();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("type");
  const focus = tab ? (tab.toUpperCase() as MainContentFocus) : undefined;

  if (!currentAccount) {
    return <NotLoggedIn />;
  }

  return (
    <PageLayout title="Bookmarks">
      <ContentFeedType layoutId="bookmarks_tab" />
      <BookmarksFeed focus={focus} />
    </PageLayout>
  );
};

export default Bookmarks;
