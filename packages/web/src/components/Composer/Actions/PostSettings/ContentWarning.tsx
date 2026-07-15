import { ContentWarning as ContentWarningType } from "@palus/indexer";
import { useComposerStore } from "@/components/Composer/ComposerStore";
import { Select } from "@/components/Shared/UI";

const ContentWarning = () => {
  const contentWarning = useComposerStore((state) => state.contentWarning);
  const setContentWarning = useComposerStore(
    (state) => state.setContentWarning
  );

  const options = [
    {
      label: "None",
      selected: !contentWarning,
      value: "none"
    },
    {
      label: "NSFW",
      selected: contentWarning === ContentWarningType.Nsfw,
      value: ContentWarningType.Nsfw
    },
    {
      label: "Spoiler",
      selected: contentWarning === ContentWarningType.Spoiler,
      value: ContentWarningType.Spoiler
    },
    {
      label: "Sensitive",
      selected: contentWarning === ContentWarningType.Sensitive,
      value: ContentWarningType.Sensitive
    }
  ];

  return (
    <div className="flex items-center justify-between gap-x-2 p-5 sm:gap-x-6">
      <div className="flex flex-col">
        <span className="font-bold">Content Warning</span>
        <span className="text-secondary text-sm">
          Blur the post until the reader engages
        </span>
      </div>
      <Select
        className="shrink-0"
        onChange={(value) => {
          setContentWarning(value === "none" ? null : value);
        }}
        options={options}
      />
    </div>
  );
};

export default ContentWarning;
