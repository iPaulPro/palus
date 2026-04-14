import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  type AccountFragment,
  type PostFragment,
  PostType,
  useTopAccountsQuery
} from "@palus/indexer";
import { memo, useMemo, useState } from "react";
import Suggested from "@/components/Home/Suggested";
import DismissRecommendedAccount from "@/components/Shared/Account/DismissRecommendedAccount";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import SingleAccountShimmer from "@/components/Shared/Shimmer/SingleAccountShimmer";
import Skeleton from "@/components/Shared/Skeleton";
import { Card, ErrorMessage, H5, Modal } from "@/components/Shared/UI";
import { useBannedAccountsStore } from "@/store/non-persisted/admin/useBannedAccountsStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const Title = memo(() => <H5>Who to Follow</H5>);

const WhoToFollow = () => {
  const { currentAccount } = useAccountStore();
  const { bannedAccounts } = useBannedAccountsStore();
  const [showMore, setShowMore] = useState(false);

  // const { data, error, loading } = useAccountRecommendationsQuery({
  //   variables: {
  //     request: {
  //       account: currentAccount?.address,
  //       pageSize: PageSize.Fifty,
  //       shuffle: true
  //     }
  //   }
  // });

  // TODO revert back to useAccountRecommendationsQuery when API is fixed
  const { data, error, loading } = useTopAccountsQuery({
    variables: {
      request: {
        filter: {
          accountScore: {
            atLeast: 9000
          },
          postTypes: [PostType.Root]
        }
      }
    }
  });

  const accounts = useMemo(() => {
    const authors = data?.posts.items.map(
      (post) => (post as PostFragment).author
    );
    const uniqueAuthors = new Set(authors);
    return Array.from(uniqueAuthors);
  }, [data?.posts.items]);

  if (loading) {
    return (
      <Card className="space-y-4 p-5">
        <Title />
        {Array.from({ length: 5 }, (_, index) => `placeholder-${index}`).map(
          (id) => (
            <div className="flex items-center gap-x-3" key={id}>
              <div className="w-full">
                <SingleAccountShimmer showFollowUnfollowButton />
              </div>
              <XMarkIcon className="size-4 text-gray-500" />
            </div>
          )
        )}
        <div className="pt-2 pb-1">
          <Skeleton className="h-3 w-5/12 rounded-full" />
        </div>
      </Card>
    );
  }

  if (!accounts.length) {
    return null;
  }

  const recommendedAccounts = accounts.filter(
    (account) =>
      !account.operations?.isBlockedByMe &&
      !account.operations?.isMutedByMe &&
      !account.operations?.isFollowedByMe &&
      !account.operations?.hasBlockedMe &&
      !bannedAccounts.includes(account.address)
  ) as AccountFragment[];

  if (!recommendedAccounts?.length) {
    return null;
  }

  return (
    <>
      <Card className="max-w-88 space-y-4 p-5">
        <Title />
        <ErrorMessage error={error} title="Failed to load recommendations" />
        {recommendedAccounts?.slice(0, 5).map((account) => (
          <div className="flex items-center gap-x-3" key={account?.address}>
            <SingleAccount
              account={account}
              className="flex-1"
              hideFollowButton={currentAccount?.address === account.address}
              hideUnfollowButton={currentAccount?.address === account.address}
            />
            <DismissRecommendedAccount account={account} />
          </div>
        ))}
        {recommendedAccounts.length > 5 && (
          <button
            className="text-start font-bold text-gray-500 dark:text-gray-200"
            onClick={() => setShowMore(true)}
            type="button"
          >
            Show more
          </button>
        )}
      </Card>
      <Modal
        onClose={() => setShowMore(false)}
        show={showMore}
        title="Suggested for you"
      >
        <Suggested accounts={recommendedAccounts} />
      </Modal>
    </>
  );
};

export default memo(WhoToFollow);
