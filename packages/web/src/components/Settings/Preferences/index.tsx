import BackButton from "@/components/Shared/BackButton";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
import HideHeyPostsToggle from "@/components/Shared/Settings/HideHeyPostsToggle";
import HideShareImagePostsToggle from "@/components/Shared/Settings/HideShareImagePostsToggle";
import LowSignalNotificationToggle from "@/components/Shared/Settings/LowSignalNotificationToggle";
import { Card, CardHeader } from "@/components/Shared/UI";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import ReplaceLensLinksToggle from "./ReplaceLensLinksToggle";

const PreferencesSettings = () => {
  const { currentAccount } = useAccountStore();

  if (!currentAccount) {
    return <NotLoggedIn />;
  }

  return (
    <PageLayout title="Preferences settings" zeroTopMargin>
      <Card>
        <CardHeader
          icon={<BackButton path="/settings" />}
          title="Preferences"
        />
        <div className="space-y-6 p-5">
          <LowSignalNotificationToggle />
          <ReplaceLensLinksToggle />
          <HideShareImagePostsToggle />
          <HideHeyPostsToggle />
        </div>
      </Card>
    </PageLayout>
  );
};

export default PreferencesSettings;
