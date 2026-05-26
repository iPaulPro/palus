import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import type { AccountFragment, RepostFragment } from "@palus/indexer";
import { useMemo } from "react";
import Accounts from "@/components/Shared/Account/Accounts";

interface RepostedProps {
  reposts: RepostFragment[];
}

const Reposted = ({ reposts }: RepostedProps) => {
  const accounts = useMemo(
    () =>
      reposts.reduce<AccountFragment[]>((acc, repost) => {
        if (!acc.some((a) => a.address === repost.author.address)) {
          acc.push(repost.author);
        }
        return acc;
      }, []),
    [reposts]
  );

  return (
    <div className="mb-3 flex items-center gap-x-1 text-[13px] text-gray-500 dark:text-gray-200">
      <ArrowsRightLeftIcon className="size-4" />
      <Accounts accounts={accounts} context="reposted" />
    </div>
  );
};

export default Reposted;
