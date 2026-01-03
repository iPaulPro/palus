import { LinkIcon } from "@heroicons/react/24/outline";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const ReplaceLensLinksToggle = () => {
  const { replaceLensLinks, setReplaceLensLinks } = usePreferencesStore();

  return (
    <ToggleWithHelper
      description="Overwrite Orb and Soclly links to open in Palus"
      heading="Replace Lens links"
      icon={<LinkIcon className="size-5" />}
      on={replaceLensLinks}
      setOn={setReplaceLensLinks}
    />
  );
};

export default ReplaceLensLinksToggle;
