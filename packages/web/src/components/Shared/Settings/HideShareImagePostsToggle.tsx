import { PhotoIcon } from "@heroicons/react/24/outline";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const HideShareImagePostsToggle = () => {
  const { hideShareImagePosts, setHideShareImagePosts } = usePreferencesStore();

  return (
    <ToggleWithHelper
      description="Hide posts with tip and collect share images in feeds"
      heading="Hide share image posts"
      icon={<PhotoIcon className="size-5" />}
      on={hideShareImagePosts}
      setOn={setHideShareImagePosts}
    />
  );
};

export default HideShareImagePostsToggle;
