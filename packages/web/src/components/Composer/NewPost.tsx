import type { GroupFragment } from "@palus/indexer";
import { useState } from "react";
import { Card, Image } from "@/components/Shared/UI";
import getAvatar from "@/helpers/getAvatar";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import DraftList from "./DraftList";
import NewPublication from "./NewPublication";

interface NewPostProps {
  group?: GroupFragment;
}

const NewPost = ({ group }: NewPostProps) => {
  const { currentAccount } = useAccountStore();
  const { bannedAccounts } = useBannedAccountsStore();
  const [showComposer, setShowComposer] = useState(false);

  const handleOpenComposer = () => {
    setShowComposer(true);
  };

  if (currentAccount && bannedAccounts.includes(currentAccount.address)) {
    return null;
  }

  if (showComposer) {
    return <NewPublication group={group} />;
  }

  return (
    <>
      <Card
        className="cursor-pointer space-y-3 px-3 py-4 md:px-5"
        onClick={handleOpenComposer}
      >
        <div className="flex items-center space-x-3">
          <Image
            alt={currentAccount?.address}
            className="size-11 cursor-pointer rounded-full border border-gray-200 bg-gray-200 object-cover dark:border-gray-800"
            height={44}
            src={getAvatar(currentAccount)}
            width={44}
          />
          <span className="text-gray-500 dark:text-gray-200">What's new?</span>
        </div>
      </Card>
      <DraftList group={group} />
    </>
  );
};

export default NewPost;
