import { TRANSFORMS } from "@palus/data/constants";
import type { GroupFragment } from "@palus/indexer";
import { memo } from "react";
import { Link } from "react-router";
import Markup from "@/components/Shared/Markup";
import { Image } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import getAvatar from "@/helpers/getAvatar";
import getMentions from "@/helpers/getMentions";
import JoinLeaveButton from "./JoinLeaveButton";

interface SingleGroupProps {
  hideJoinButton?: boolean;
  hideLeaveButton?: boolean;
  isBig?: boolean;
  linkToGroup?: boolean;
  showDescription?: boolean;
  group: GroupFragment;
}

const SingleGroup = ({
  hideJoinButton = false,
  hideLeaveButton = false,
  isBig = false,
  linkToGroup = true,
  showDescription = false,
  group
}: SingleGroupProps) => {
  const GroupAvatar = () => (
    <Image
      alt={group.address}
      className={cn(
        isBig ? "size-14" : "size-11",
        "rounded-lg border border-gray-200 bg-gray-200 dark:border-gray-800"
      )}
      height={isBig ? 56 : 44}
      loading="lazy"
      src={getAvatar(group, TRANSFORMS.AVATAR_BIG)}
      width={isBig ? 56 : 44}
    />
  );

  const GroupInfo = () => (
    <div className="flex items-center space-x-3">
      <GroupAvatar />
      <div>
        <div className="truncate font-bold">{group.metadata?.name}</div>
        {showDescription && group.metadata?.description && (
          <div
            className="linkify mt-1 text-base leading-6"
            style={{ wordBreak: "break-word" }}
          >
            <Markup mentions={getMentions(group.metadata.description)}>
              {group.metadata.description}
            </Markup>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between gap-x-4">
      {linkToGroup ? (
        <Link to={`/g/${group.address}`}>
          <GroupInfo />
        </Link>
      ) : (
        <GroupInfo />
      )}
      <JoinLeaveButton
        group={group}
        hideJoinButton={hideJoinButton}
        hideLeaveButton={hideLeaveButton}
        small
      />
    </div>
  );
};

export default memo(SingleGroup);
