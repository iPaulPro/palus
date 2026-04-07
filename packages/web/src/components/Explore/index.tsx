import type { MainContentFocus } from "@palus/indexer";
import { useState } from "react";
import FloatingNewPostButton from "@/components/Post/FloatingNewPostButton";
import Footer from "@/components/Shared/Footer";
import PageLayout from "@/components/Shared/PageLayout";
import ContentFeedType from "@/components/Shared/Post/ContentFeedType";
import WhoToFollow from "@/components/Shared/Sidebar/WhoToFollow";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import ExploreFeed from "./ExploreFeed";

const Explore = () => {
  const { currentAccount } = useAccountStore();
  const [focus, setFocus] = useState<MainContentFocus>();
  const loggedInWithAccount = Boolean(currentAccount);
  const [scrollOffset, setScrollOffset] = useState(0);

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
      <ContentFeedType
        focus={focus}
        layoutId="explore_tab"
        setFocus={setFocus}
      />
      <ExploreFeed focus={focus} onScroll={setScrollOffset} />
      {loggedInWithAccount ? (
        <FloatingNewPostButton scrollOffset={scrollOffset} />
      ) : null}
    </PageLayout>
  );
};

export default Explore;
