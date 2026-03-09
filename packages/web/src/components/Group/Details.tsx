import type { GroupFragment } from "@palus/indexer";
import { useCallback, useState } from "react";
import AdminCount from "@/components/Group/Admins";
import LazySmallSingleAccount from "@/components/Shared/Account/LazySmallSingleAccount";
import JoinLeaveButton from "@/components/Shared/Group/JoinLeaveButton";
import Markup from "@/components/Shared/Markup";
import { H3, Image, LightBox } from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
import getAvatar from "@/helpers/getAvatar";
import getMentions from "@/helpers/getMentions";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import MembersCount from "./Members";
import GroupMenu from "./Menu";
import RequestsCount from "./Requests";

interface DetailsProps {
  group: GroupFragment;
}

const Details = ({ group }: DetailsProps) => {
  const { currentAccount } = useAccountStore();
  const [showLightBox, setShowLightBox] = useState<boolean>(false);

  const handleShowLightBox = useCallback(() => {
    setShowLightBox(true);
  }, []);

  const handleCloseLightBox = useCallback(() => {
    setShowLightBox(false);
  }, []);

  return (
    <div className="mb-4 space-y-3 px-4 md:px-0">
      <div className="flex items-start justify-between">
        <div className="-mt-24 sm:-mt-24 relative ml-5 size-32 sm:size-36">
          <Image
            alt={group.address}
            className="size-32 cursor-pointer rounded-xl bg-gray-200 object-cover ring-3 ring-gray-50 sm:size-36 dark:bg-gray-700 dark:ring-black"
            height={128}
            onClick={handleShowLightBox}
            src={getAvatar(group, TRANSFORMS.AVATAR_BIG)}
            width={128}
          />
          <LightBox
            images={[getAvatar(group, TRANSFORMS.EXPANDED_AVATAR)]}
            onClose={handleCloseLightBox}
            show={showLightBox}
          />
        </div>
        {currentAccount?.address === group.owner ? (
          <GroupMenu group={group} />
        ) : (
          <JoinLeaveButton group={group} />
        )}
      </div>
      <H3 className="truncate py-2">{group.metadata?.name}</H3>
      {group.metadata?.description ? (
        <Markup
          className="markup linkify mr-0 break-words sm:mr-10"
          mentions={getMentions(group.metadata?.description)}
        >
          {group.metadata?.description}
        </Markup>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1.5">
        <div className="flex items-center gap-x-2">
          <span className="text-secondary">Owned by</span>
          <LazySmallSingleAccount
            address={group.owner}
            hideSlug
            linkToAccount
            smallAvatar={false}
          />
        </div>
        <div className="flex items-center gap-x-2">
          <span className="text-secondary">Created</span>
          <span>
            {Intl.DateTimeFormat("default", { dateStyle: "medium" }).format(
              new Date(group.timestamp)
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <MembersCount group={group} />
        <AdminCount group={group} />
        {group.owner === currentAccount?.address && (
          <RequestsCount groupAddress={group.address} />
        )}
      </div>
    </div>
  );
};

export default Details;
