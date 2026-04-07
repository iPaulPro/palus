import { memo } from "react";
import Signless from "@/components/Settings/Manager/Signless";
import SignupCard from "@/components/Shared/Auth/SignupCard";
import Footer from "@/components/Shared/Footer";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import WhoToFollow from "./WhoToFollow";

const Sidebar = () => {
  const { currentAccount, isSignless } = useAccountStore();
  const loggedInWithAccount = Boolean(currentAccount);
  const loggedOut = !loggedInWithAccount;

  return (
    <>
      {loggedOut && <SignupCard />}
      {loggedInWithAccount && (
        <>
          {isSignless ? null : <Signless isCard />}
          <WhoToFollow />
        </>
      )}
      <Footer />
    </>
  );
};

export default memo(Sidebar);
