import { GlobeAltIcon } from "@heroicons/react/24/outline";
import getAvatar from "@palus/helpers/getAvatar";
import {
  type GroupFragment,
  GroupsOrderBy,
  type GroupsRequest,
  PageSize,
  useGroupsQuery
} from "@palus/indexer";
import { memo, useMemo } from "react";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectUI,
  SelectValue
} from "@/components/Shared/UI";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface GroupSelectorProps {
  selected?: string;
  onChange: (groupFeed: string) => void;
}

const GroupSelector = ({ selected, onChange }: GroupSelectorProps) => {
  const { currentAccount } = useAccountStore();

  const request: GroupsRequest = {
    filter: { member: currentAccount?.address },
    orderBy: GroupsOrderBy.LatestFirst,
    pageSize: PageSize.Fifty
  };

  const { data } = useGroupsQuery({
    skip: !currentAccount,
    variables: { request }
  });

  const options = useMemo(() => {
    const groups = data?.groups?.items ?? [];
    return groups
      .map((group: GroupFragment) => ({
        icon: getAvatar(group),
        label: group.metadata?.name ?? group.address,
        selected: group.feed?.address === selected,
        value: group.feed?.address ?? ""
      }))
      .filter((option) => option.value !== "");
  }, [data?.groups?.items, selected]);

  if (!options.length) {
    return null;
  }

  return (
    <SelectUI defaultValue="global" onValueChange={onChange}>
      <SelectTrigger
        className="!h-6 w-fit border-none px-0 py-0 opacity-75 shadow-none"
        size="sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className="gap-1" key="global" value="global">
          <GlobeAltIcon className="size-5 rounded-full bg-brand-600 p-0.5 text-white" />
          Global Feed
        </SelectItem>
        {options.map((option) => (
          <SelectItem
            className="min-w-48"
            key={option.value}
            value={option.value}
          >
            <img
              alt={option.label}
              className="size-5 rounded-full object-cover"
              src={option.icon}
            />
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectUI>
  );
};

export default memo(GroupSelector);
