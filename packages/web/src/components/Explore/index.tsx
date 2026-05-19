import type { MainContentFocus } from "@palus/indexer";
import { useState } from "react";
import { useSearchParams } from "react-router";
import FloatingNewPostButton from "@/components/Post/FloatingNewPostButton";
import Footer from "@/components/Shared/Footer";
import PageLayout from "@/components/Shared/PageLayout";
import ContentFeedType from "@/components/Shared/Post/ContentFeedType";
import WhoToFollow from "@/components/Shared/Sidebar/WhoToFollow";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import ExploreFeed from "./ExploreFeed";

const Explore = () => {
  const { currentAccount } = useAccountStore();
  const loggedInWithAccount = Boolean(currentAccount);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("type");
  const focus = tab ? (tab.toUpperCase() as MainContentFocus) : undefined;

  return (
    <PageLayout
      sidebar={
        <>
          {currentAccount ? <WhoToFollow /> : null}
          <Footer />
        </>
      }
      title="Explore"
    >
      <ContentFeedType layoutId="explore_tab" />
      <ExploreFeed focus={focus} onScroll={setScrollOffset} />
      {loggedInWithAccount ? (
        <FloatingNewPostButton scrollOffset={scrollOffset} />
      ) : null}
    </PageLayout>
  );
};

export default Explore;
