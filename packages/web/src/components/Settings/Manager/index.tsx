import { useConnection } from "wagmi";
import Signless from "@/components/Settings/Manager/Signless";
import BackButton from "@/components/Shared/BackButton";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
import WrongWallet from "@/components/Shared/Settings/WrongWallet";
import { Card, CardHeader } from "@/components/Shared/UI";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import AccountManager from "./AccountManager";

const ManagerSettings = () => {
  const { currentAccount } = useAccountStore();
  const { address } = useConnection();
  const disabled = currentAccount?.owner !== address;

  if (!currentAccount) {
    return <NotLoggedIn />;
  }

  return (
    <PageLayout title="Manager settings" zeroTopMargin>
      <Card>
        <CardHeader
          icon={<BackButton path="/settings" />}
          title="Manager settings"
        />
        {disabled ? <WrongWallet /> : <Signless />}
      </Card>
      <AccountManager />
    </PageLayout>
  );
};

export default ManagerSettings;
