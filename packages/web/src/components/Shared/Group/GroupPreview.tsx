import {
  type GroupFragment,
  type GroupStatsResponse,
  useFullGroupLazyQuery
} from "@palus/indexer";
import * as HoverCard from "@radix-ui/react-hover-card";
import type { ReactNode } from "react";
import JoinLeaveButton from "@/components/Shared/Group/JoinLeaveButton";
import Markup from "@/components/Shared/Markup";
import { Card, Image } from "@/components/Shared/UI";
import getAvatar from "@/helpers/getAvatar";
import getMentions from "@/helpers/getMentions";
import nFormatter from "@/helpers/nFormatter";
import truncateByWords from "@/helpers/truncateByWords";

interface Props {
  children: ReactNode;
  name?: string;
  address?: string;
  showGroupPreview?: boolean;
  className?: string;
}

const GroupAvatar = ({ group }: { group: GroupFragment }) => (
  <Image
    alt={group.address}
    className="size-12 rounded-full border border-gray-200 bg-gray-200 object-cover dark:border-gray-800"
    height={48}
    loading="lazy"
    src={getAvatar(group)}
    width={48}
  />
);

const Name = ({ group }: { group: GroupFragment }) => (
  <div>
    <div className="flex min-w-0 max-w-sm items-center gap-1">
      <div className="truncate font-semibold">
        {group?.metadata?.name ?? "unnamed"}
      </div>
    </div>
  </div>
);

const Preview = ({
  group,
  loading,
  address,
  stats,
  name
}: {
  group: GroupFragment | null | undefined;
  loading: boolean;
  address?: string;
  stats: GroupStatsResponse | null | undefined;
  name?: string;
}) => {
  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex p-3">
          <div>{name || `#${address}`}</div>
        </div>
      </div>
    );
  }

  if (!group) {
    return <div className="flex h-12 items-center px-3">No group found</div>;
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <GroupAvatar group={group} />
        <JoinLeaveButton group={group} small />
      </div>
      <Name group={group} />
      {group.metadata?.description && (
        <Markup
          className="linkify markup wrap-break-word mt-2 text-sm leading-6"
          mentions={getMentions(group.metadata.description)}
        >
          {truncateByWords(group.metadata?.description, 20)}
        </Markup>
      )}
      <div className="mt-4 flex items-center gap-x-3">
        <div className="flex items-center gap-x-1">
          <div className="text-base">
            {nFormatter(stats?.totalMembers ?? 0)}
          </div>
          <div className="text-gray-500 text-sm dark:text-gray-200">
            Members
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupPreview = ({
  children,
  address,
  name,
  showGroupPreview = true,
  className
}: Props) => {
  const [loadGroup, { data, loading }] = useFullGroupLazyQuery();
  const group = data?.group;
  const stats = data?.groupStats;

  const onPreviewStart = async () => {
    if (group || loading) return;

    await loadGroup({
      variables: {
        groupRequest: { group: address },
        groupStatsRequest: { group: address }
      }
    });
  };

  if (!address && !name) {
    return null;
  }

  if (!showGroupPreview) {
    return <span>{children}</span>;
  }

  return (
    <span onFocus={onPreviewStart} onMouseOver={onPreviewStart}>
      <HoverCard.Root>
        <HoverCard.Trigger asChild>
          <span className={className}>{children}</span>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            asChild
            className="z-10 w-72"
            side="bottom"
            sideOffset={5}
          >
            <div>
              <Card forceRounded>
                <Preview
                  address={address}
                  group={group}
                  loading={loading}
                  stats={stats}
                />
              </Card>
            </div>
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </span>
  );
};

export default GroupPreview;
