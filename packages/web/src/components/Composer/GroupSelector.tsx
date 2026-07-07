import type { GroupFragment } from "@palus/indexer";
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

interface GroupSelectorProps {
  groups: GroupFragment[] | undefined;
  selected?: GroupFragment;
  onChange: (group: GroupFragment | undefined) => void;
}

type Option = {
  icon: string;
  label: string;
  selected: boolean;
  value: GroupFragment | { address: string };
};

const GroupSelector = ({ groups, selected, onChange }: GroupSelectorProps) => {
  const { setGroupGate } = usePostRulesStore();

  const options = useMemo(() => {
    if (!groups) return [];
    return groups
      .reduce<Option[]>((acc, group: GroupFragment) => {
        if (group.feed?.address !== "") {
          acc.push({
            icon: getAvatar(group),
            label: group.metadata?.name ?? group.address,
            selected: group.feed?.address === selected?.feed?.address,
            value: group
          });
        }
        return acc;
      }, [])
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [groups, selected?.feed?.address]);

  if (!options.length) {
    return <div className="h-3" />;
  }

  const onValueChange = (value: string) => {
    const selectedGroup = groups?.find((group) => group.address === value);
    onChange(selectedGroup);
    if (!selectedGroup) {
      setGroupGate(undefined);
    }
  };

  return (
    <SelectUI defaultValue="global" onValueChange={onValueChange}>
      <SelectTrigger
        className="!h-6 w-fit border-none p-0 opacity-75 shadow-none"
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
