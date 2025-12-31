import { HomeFeedType } from "@palus/data/enums";
import { useEffect, useState } from "react";
import NewPost from "@/components/Composer/NewPost";
import ExploreFeed from "@/components/Explore/ExploreFeed";
import TopAccounts from "@/components/Home/TopAccounts";
import FloatingNewPostButton from "@/components/Post/FloatingNewPostButton";
import PageLayout from "@/components/Shared/PageLayout";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { useHomeTabStore } from "@/store/persisted/useHomeTabStore";
import FeedType from "./FeedType";
import ForYou from "./ForYou";
import Hero from "./Hero";
import Timeline from "./Timeline";

const Home = () => {
  const { currentAccount } = useAccountStore();
  const { feedType } = useHomeTabStore();
  const loggedInWithAccount = Boolean(currentAccount);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    setScrollOffset(0);
  }, [feedType]);

  return (
    <PageLayout>
      {loggedInWithAccount ? (
        <>
          <FeedType />
          <NewPost />
          {feedType === HomeFeedType.TIMELINE ? (
            <Timeline followingOnly={false} onScroll={setScrollOffset} />
          ) : feedType === HomeFeedType.FOLLOWING ? (
            <Timeline followingOnly={true} onScroll={setScrollOffset} />
          ) : feedType === HomeFeedType.TOP_ACCOUNTS ? (
            <TopAccounts onScroll={setScrollOffset} />
          ) : feedType === HomeFeedType.FORYOU ? (
            <ForYou onScroll={setScrollOffset} />
          ) : null}
          <FloatingNewPostButton scrollOffset={scrollOffset} />
        </>
      ) : (
        <>
          <Hero />
          <ExploreFeed />
        </>
      )}
    </PageLayout>
  );
};

export default Home;
