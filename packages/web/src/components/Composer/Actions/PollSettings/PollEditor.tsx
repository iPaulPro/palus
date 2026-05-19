import { ClockIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Bars3BottomLeftIcon, XCircleIcon } from "@heroicons/react/24/solid";
import plur from "plur";
import { useState } from "react";
import { Button, Card, Input, Modal, Tooltip } from "@/components/Shared/UI";
import { usePostPollStore } from "@/store/non-persisted/post/usePostPollStore";

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
  const [showPollLengthModal, setShowPollLengthModal] = useState(false);

  return (
    <Card className="m-5 px-5 py-3 sm:w-4/5" forceRounded>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2 text-sm">
          <Bars3BottomLeftIcon className="size-4" />
          <b>Poll</b>
        </div>
        <div className="flex items-center gap-x-3">
          <Button
            icon={<ClockIcon className="size-4" />}
            onClick={() => setShowPollLengthModal(true)}
            outline
            size="sm"
          >
            {pollConfig.durationInDays} {plur("day", pollConfig.durationInDays)}
          </Button>
          <Modal
            onClose={() => setShowPollLengthModal(false)}
            show={showPollLengthModal}
            title="Poll length"
          >
            <div className="p-5">
              <Input
                label="Poll length (days)"
                max={365}
                min={1}
                onChange={(e) => {
                  updatePollConfig({ durationInDays: Number(e.target.value) });
                }}
                type="number"
                value={pollConfig.durationInDays}
              />
              <div className="mt-5 flex gap-x-2">
                <Button
                  className="ml-auto"
                  onClick={() => {
                    resetPollConfig();
                    setShowPollLengthModal(false);
                  }}
                  outline
                  variant="danger"
                >
                  Cancel
                </Button>
                <Button
                  className="ml-auto"
                  onClick={() => setShowPollLengthModal(false)}
                >
                  Save
                </Button>
              </div>
            </div>
          </Modal>
          <Tooltip content="Delete" placement="top">
            <button
              className="flex"
              onClick={() => {
                resetPollConfig();
                setShowPollEditor(false);
              }}
              type="button"
            >
              <XCircleIcon className="size-5 text-red-400" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {pollConfig.options.map((choice, index) => {
          const key = `${choice}_${index}`;
          return (
            <div className="flex items-center gap-x-2 text-sm" key={key}>
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
            className="mt-2 flex items-center gap-x-2 text-sm"
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
