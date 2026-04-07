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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectUI,
  SelectValue
} from "@/components/Shared/UI";
import getAvatar from "@/helpers/getAvatar";
import { usePostRulesStore } from "@/store/non-persisted/post/usePostRulesStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface GroupSelectorProps {
  selected?: GroupFragment;
  onChange: (group: GroupFragment | undefined) => void;
}

const GroupSelector = ({ selected, onChange }: GroupSelectorProps) => {
  const { currentAccount } = useAccountStore();
  const { setGroupGate } = usePostRulesStore();

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
        selected: group.feed?.address === selected?.feed?.address,
        value: group ?? ""
      }))
      .filter((option) => option.value.feed?.address !== "");
  }, [data?.groups?.items, selected]);

  if (!options.length) {
    return <div className="h-3" />;
  }

  const onValueChange = (value: string) => {
    const selectedGroup = data?.groups?.items?.find(
      (item) => item.address === value
    );
    onChange(selectedGroup);
    if (!selectedGroup) {
      setGroupGate(undefined);
    }
  };

  return (
    <SelectUI defaultValue="global" onValueChange={onValueChange}>
      <SelectTrigger
        className="!h-6 w-fit border-none px-0 py-0 opacity-75 shadow-none"
        size="sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className="gap-1" key="global" value="global">
          Global Feed
        </SelectItem>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Your Groups</SelectLabel>
          {options.map((option) => (
            <SelectItem
              className="min-w-48"
              key={option.value.address}
              value={option.value.address}
            >
              <img
                alt={option.label}
                className="size-5 rounded-full object-cover"
                src={option.icon}
              />
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectUI>
  );
};

export default memo(GroupSelector);
