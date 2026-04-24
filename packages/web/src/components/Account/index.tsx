import { NoSymbolIcon } from "@heroicons/react/24/outline";
import { useAccountQuery } from "@palus/indexer";
import { useState } from "react";
import { useParams } from "react-router";
import NewPost from "@/components/Composer/NewPost";
import Custom404 from "@/components/Shared/404";
import Custom500 from "@/components/Shared/500";
import Cover from "@/components/Shared/Cover";
import PageLayout from "@/components/Shared/PageLayout";
import { EmptyState } from "@/components/Shared/UI";
import { STATIC_IMAGES_URL } from "@/data/constants";
import { AccountFeedType } from "@/data/enums";
import getAccount from "@/helpers/getAccount";
import { getBlockedByMeMessage } from "@/helpers/getBlockedMessage";
import isAccountDeleted from "@/helpers/isAccountDeleted";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useAccountLinkStore } from "@/store/non-persisted/navigation/useAccountLinkStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import AccountFeed from "./AccountFeed";
import DeletedDetails from "./DeletedDetails";
import Details from "./Details";
import FeedType from "./FeedType";
import AccountPageShimmer from "./Shimmer";

const ViewAccount = () => {
  const { address, username } = useParams<{
    address: string;
    username: string;
  }>();
  const [feedType, setFeedType] = useState<AccountFeedType>(
    AccountFeedType.Feed
  );

  const { currentAccount } = useAccountStore();
  const { cachedAccount, setCachedAccount } = useAccountLinkStore();
  const { bannedAccounts } = useBannedAccountsStore();

  const { data, error, loading } = useAccountQuery({
    onCompleted: (data) => {
      if (data?.account) {
        setCachedAccount(null);
      }
    },
    skip: address ? !address : !username,
    variables: {
      request: {
        ...(address
          ? { address }
          : {
              username: { localName: username?.replace(".lens", "") as string }
            })
      }
    }
  });

  const account = data?.account ?? cachedAccount;

  if ((!username && !address) || (loading && !cachedAccount)) {
    return <AccountPageShimmer />;
  }

  if (!account) {
    return <Custom404 />;
  }

  if (error) {
    return <Custom500 />;
  }

  const isDeleted = isAccountDeleted(account);
  const isBlockedByMe = account?.operations?.isBlockedByMe;
  const isBanned = bannedAccounts.includes(account.address);

  const accountInfo = getAccount(account);

  const renderAccountDetails = () => {
    if (isDeleted || isBanned) return <DeletedDetails account={account} />;

    return (
      <Details
        account={account}
        hasBlockedMe={account?.operations?.hasBlockedMe || false}
        isBlockedByMe={account?.operations?.isBlockedByMe || false}
      />
    );
  };

  const renderEmptyState = () => {
    const message = isDeleted
      ? "Account Deleted"
      : isBanned
        ? "Account Banned"
        : isBlockedByMe
          ? getBlockedByMeMessage(account)
          : null;

    return (
      <EmptyState
        icon={<NoSymbolIcon className="size-8" />}
        message={message}
      />
    );
  };

  return (
    <PageLayout
      title={`${accountInfo.name} (${accountInfo.username}) • Palus`}
      zeroTopMargin
    >
      <Cover
        cover={account?.metadata?.coverPicture || `${STATIC_IMAGES_URL}/2.webp`}
      />
      {renderAccountDetails()}
      {isDeleted || isBlockedByMe || isBanned ? (
        renderEmptyState()
      ) : (
        <div className="flex flex-col gap-y-4 pt-2">
          <FeedType feedType={feedType} setFeedType={setFeedType} />
          {currentAccount?.address === account?.address && <NewPost />}
          {(feedType === AccountFeedType.Feed ||
            feedType === AccountFeedType.Replies ||
            feedType === AccountFeedType.Media ||
            feedType === AccountFeedType.Collects) && (
            <AccountFeed
              address={account.address}
              type={feedType}
              username={accountInfo.username}
            />
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default ViewAccount;
