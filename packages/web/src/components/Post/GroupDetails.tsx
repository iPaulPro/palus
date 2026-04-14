import { type PostFragment, useFullGroupQuery } from "@palus/indexer";
import JoinLeaveButton from "@/components/Shared/Group/JoinLeaveButton";
import Markup from "@/components/Shared/Markup";
import SingleAccountShimmer from "@/components/Shared/Shimmer/SingleAccountShimmer";
import Skeleton from "@/components/Shared/Skeleton";
import { Card, Image } from "@/components/Shared/UI";
import getAvatar from "@/helpers/getAvatar";
import getMentions from "@/helpers/getMentions";
import nFormatter from "@/helpers/nFormatter";
import truncateByWords from "@/helpers/truncateByWords";

interface Props {
  post: PostFragment;
}

export const GroupDetails = ({ post }: Props) => {
  const groupInfo = post.feed.group;

  const { data, loading } = useFullGroupQuery({
    skip: !groupInfo?.address,
    variables: {
      groupRequest: {
        group: groupInfo?.address
      },
      groupStatsRequest: {
        group: groupInfo?.address
      }
    }
  });

  if (loading) {
    return (
      <Card as="aside" className="space-y-4 p-5">
        <SingleAccountShimmer showFollowUnfollowButton />
        <div className="pt-2 pb-1">
          <Skeleton className="h-3 w-5/12 rounded-full" />
        </div>
      </Card>
    );
  }

  const group = data?.group;
  const stats = data?.groupStats;
  if (!group) return null;

  const GroupAvatar = () => (
    <Image
      alt={group.address}
      className="size-12 rounded-full border border-gray-200 bg-gray-200 object-cover dark:border-gray-800"
      height={48}
      loading="lazy"
      src={getAvatar(group)}
      width={48}
    />
  );

  return (
    <Card as="aside" className="space-y-2 p-4">
      <div className="flex items-center">
        <GroupAvatar />
        <div className="flex min-w-0 max-w-sm flex-grow flex-col justify-center gap-x-1 px-3">
          <div className="truncate font-semibold">
            {group?.metadata?.name ?? "unnamed"}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-secondary text-sm">
              <span>{nFormatter(stats?.totalMembers ?? 0)}</span>
              <span>Members</span>
            </div>
          </div>
        </div>
        <JoinLeaveButton group={group} small />
      </div>
      {group.metadata?.description && (
        <Markup
          className="linkify markup break-words text-sm leading-6"
          mentions={getMentions(group.metadata.description)}
        >
          {truncateByWords(group.metadata?.description, 20)}
        </Markup>
      )}
    </Card>
  );
};

export default GroupDetails;
