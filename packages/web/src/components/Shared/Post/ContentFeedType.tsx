import { MainContentFocus } from "@palus/indexer";
import { type Dispatch, memo, type SetStateAction, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Tabs } from "@/components/Shared/UI";

interface ContentFeedTypeProps {
  focus?: MainContentFocus;
  setFocus: Dispatch<SetStateAction<MainContentFocus | undefined>>;
  layoutId: string;
}

const ContentFeedType = ({
  focus,
  setFocus,
  layoutId
}: ContentFeedTypeProps) => {
  const tabs = [
    { name: "All posts", type: "" },
    { name: "Text", type: MainContentFocus.TextOnly },
    { name: "Video", type: MainContentFocus.Video },
    { name: "Audio", type: MainContentFocus.Audio },
    { name: "Images", type: MainContentFocus.Image }
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("type");

  useEffect(() => {
    if (!tab) return;
    setFocus(tab.toUpperCase() as MainContentFocus);
  }, [tab]);

  return (
    <Tabs
      active={focus ?? tab ?? ""}
      layoutId={layoutId}
      setActive={(type) => {
        setFocus(type as MainContentFocus);
        setSearchParams(type ? `type=${type.toLowerCase()}` : undefined);
      }}
      tabs={tabs}
    />
  );
};

export default memo(ContentFeedType);
