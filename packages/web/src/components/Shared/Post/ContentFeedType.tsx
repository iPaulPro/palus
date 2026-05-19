import { MainContentFocus } from "@palus/indexer";
import { memo } from "react";
import { useSearchParams } from "react-router";
import { Tabs } from "@/components/Shared/UI";

interface ContentFeedTypeProps {
  layoutId: string;
}

const tabs = [
  { name: "All posts", type: "" },
  { name: "Text", type: MainContentFocus.TextOnly },
  { name: "Video", type: MainContentFocus.Video },
  { name: "Audio", type: MainContentFocus.Audio },
  { name: "Images", type: MainContentFocus.Image }
];

const ContentFeedType = ({ layoutId }: ContentFeedTypeProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("type");
  const active = tab ? (tab.toUpperCase() as MainContentFocus) : "";

  return (
    <Tabs
      active={active}
      layoutId={layoutId}
      setActive={(type) => {
        setSearchParams(
          type ? `type=${(type as string).toLowerCase()}` : undefined
        );
      }}
      tabs={tabs}
    />
  );
};

export default memo(ContentFeedType);
