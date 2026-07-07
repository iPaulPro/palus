import { XMarkIcon } from "@heroicons/react/16/solid";
import { ClockIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import plur from "plur";
import { useState } from "react";
import { Card, Input, Select, Tooltip } from "@/components/Shared/UI";
import {
  DEFAULT_DURATION_DAYS,
  usePostPollStore
} from "@/store/non-persisted/post/usePostPollStore";

const PollEditor = () => {
  const {
    pollConfig,
    resetPollConfig,
    updatePollConfig,
    addPollOption,
    removePollOption,
    updatePollOption,
    setShowPollEditor
  } = usePostPollStore();

  const options = [
    {
      helper: "Single choice",
      label: "Single",
      selected: !pollConfig.allowMultipleAnswers,
      value: "single"
    },
    {
      helper: "Multiple choices allowed per vote",
      label: "Multiple",
      selected: pollConfig.allowMultipleAnswers,
      value: "multiple"
    }
  ];

  const [durationInput, setDurationInput] = useState(
    String(pollConfig.durationInDays ?? DEFAULT_DURATION_DAYS)
  );

  return (
    <Card className="m-4 px-4 py-3 sm:m-5 sm:w-4/5" forceRounded>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2 text-sm">
          <Bars3BottomLeftIcon className="size-4" />
          <b>Poll</b>
        </div>
        <div className="flex items-center gap-x-2">
          <Select
            className="rounded-full font-bold"
            listBoxClassName="w-max"
            onChange={(option) => {
              updatePollConfig({
                allowMultipleAnswers: option === "multiple"
              });
            }}
            options={options}
            size="sm"
          />
          <Input
            className="no-spinner field-sizing-content min-w-4 max-w-10 py-0 pr-0.5 pl-1.5 text-center font-bold sm:max-w-24"
            iconLeft={<ClockIcon className="size-4" />}
            iconRight={
              <span className="font-bold text-on-surface text-sm">
                {plur("day", pollConfig.durationInDays)}
              </span>
            }
            min={1}
            onBlur={(e) => {
              const num = Number(e.target.value);
              if (!e.target.value || num < 1) {
                updatePollConfig({ durationInDays: DEFAULT_DURATION_DAYS });
                setDurationInput(String(DEFAULT_DURATION_DAYS));
              } else {
                updatePollConfig({ durationInDays: num });
              }
            }}
            onChange={(e) => {
              setDurationInput(e.target.value);
            }}
            type="number"
            value={durationInput}
            wrapperClassName="w-fit rounded-full"
          />
          <Tooltip content="Remove poll" placement="top">
            <button
              className="flex rounded-full border border-gray-300 p-1 hover:border-gray-500 focus:border-gray-500 dark:border-gray-800"
              onClick={() => {
                resetPollConfig();
                setShowPollEditor(false);
              }}
              type="button"
            >
              <XMarkIcon className="size-4 text-secondary" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {pollConfig.options.map((choice, index) => {
          return (
            <div className="flex items-center gap-x-2 text-sm" key={index}>
              <Input
                iconRight={
                  index > 1 ? (
                    <button
                      className="flex"
                      onClick={() => {
                        removePollOption(index);
                      }}
                      type="button"
                    >
                      <XMarkIcon className="size-5 text-red-500" />
                    </button>
                  ) : null
                }
                maxLength={25}
                onChange={(event) => {
                  updatePollOption(index, event.target.value);
                }}
                placeholder={`Choice ${index + 1}`}
                value={choice}
              />
            </div>
          );
        })}
        {pollConfig.options.length === 10 ? null : (
          <button
            className="mt-3 flex items-center gap-x-2 text-sm"
            onClick={() => {
              addPollOption();
            }}
            type="button"
          >
            <PlusIcon className="size-4" />
            <span>Add another option</span>
          </button>
        )}
      </div>
    </Card>
  );
};

export default PollEditor;
