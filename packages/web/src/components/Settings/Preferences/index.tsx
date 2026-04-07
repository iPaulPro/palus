import BackButton from "@/components/Shared/BackButton";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
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
    <PageLayout title="Preferences settings">
      <Card>
        <CardHeader
          icon={<BackButton path="/settings" />}
          title="Preferences"
        />
        <div className="space-y-6 p-5">
          <LowSignalNotificationToggle />
          <ReplaceLensLinksToggle />
        </div>
      </Card>
    </PageLayout>
  );
};

export default PreferencesSettings;
