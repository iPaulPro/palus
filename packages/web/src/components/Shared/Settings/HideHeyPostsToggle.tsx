import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const HideHeyPostsToggle = () => {
  const { hideHeyPosts, setHideHeyPosts } = usePreferencesStore();

  return (
    <ToggleWithHelper
      description="Hide posts created from the Hey app"
      heading="Hide posts from Hey"
      icon={<img alt="Hey" className="size-5" src="/images/hey.svg" />}
      on={hideHeyPosts}
      setOn={setHideHeyPosts}
    />
  );
};

export default HideHeyPostsToggle;
