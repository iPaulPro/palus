import type { GroupFragment } from "@palus/indexer";
import { memo } from "react";
import { Link } from "react-router";
import Markup from "@/components/Shared/Markup";
import { Image } from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
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

const GroupAvatar = (props: SingleGroupProps) => (
  <Image
    alt={props.group.address}
    className={cn(
      props.isBig ? "size-14" : "size-11",
      "rounded-lg border border-gray-200 bg-gray-200 object-cover dark:border-gray-800"
    )}
    height={props.isBig ? 56 : 44}
    loading="lazy"
    src={getAvatar(props.group, TRANSFORMS.AVATAR_BIG)}
    width={props.isBig ? 56 : 44}
  />
);

const GroupInfo = (props: SingleGroupProps) => (
  <div className="flex items-center space-x-3">
    <GroupAvatar group={props.group} />
    <div>
      <div className="truncate font-bold">{props.group.metadata?.name}</div>
      {props.showDescription && props.group.metadata?.description && (
        <div
          className="linkify mt-1 text-base leading-6"
          style={{ wordBreak: "break-word" }}
        >
          <Markup
            className="line-clamp-1"
            mentions={getMentions(props.group.metadata.description)}
          >
            {props.group.metadata.description}
          </Markup>
        </div>
      )}
    </div>
  </div>
);

const SingleGroup = ({ linkToGroup = true, ...props }: SingleGroupProps) => {
  return (
    <div className="flex items-center justify-between gap-x-4">
      {linkToGroup ? (
        <Link to={`/g/${props.group.address}`}>
          <GroupInfo {...props} />
        </Link>
      ) : (
        <GroupInfo {...props} />
      )}
      <JoinLeaveButton
        group={props.group}
        hideJoinButton={props.hideJoinButton}
        hideLeaveButton={props.hideLeaveButton}
        small
      />
    </div>
  );
};

export default memo(SingleGroup);
