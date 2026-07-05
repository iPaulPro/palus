import { createTrackedStore } from "@/store/createTrackedStore";
import type { PollConfig } from "@/types/palus";

export const DEFAULT_DURATION_DAYS = 7;

interface State {
  pollConfig: PollConfig;
  resetPollConfig: () => void;
  setPollConfig: (pollConfig: PollConfig) => void;
  updatePollConfig: (partial: Partial<PollConfig>) => void;
  addPollOption: () => void;
  removePollOption: (index: number) => void;
  updatePollOption: (index: number, value: string) => void;
  setShowPollEditor: (showPollEditor: boolean) => void;
  showPollEditor: boolean;
}

const { useStore: usePostPollStore } = createTrackedStore<State>((set) => ({
  addPollOption: () =>
    set((state) => ({
      pollConfig: {
        ...state.pollConfig,
        options: [...state.pollConfig.options, ""]
      }
    })),
  pollConfig: {
    allowMultipleAnswers: false,
    durationInDays: DEFAULT_DURATION_DAYS,
    options: ["", ""]
  },
  removePollOption: (index) =>
    set((state) => ({
      pollConfig: {
        ...state.pollConfig,
        options: state.pollConfig.options.filter((_, i) => i !== index)
      }
    })),
  resetPollConfig: () =>
    set(() => ({
      pollConfig: {
        allowMultipleAnswers: false,
        durationInDays: DEFAULT_DURATION_DAYS,
        options: ["", ""]
      }
    })),
  setPollConfig: (pollConfig) => set(() => ({ pollConfig })),
  setShowPollEditor: (showPollEditor) => set(() => ({ showPollEditor })),
  showPollEditor: false,
  updatePollConfig: (partial) =>
    set((state) => ({ pollConfig: { ...state.pollConfig, ...partial } })),
  updatePollOption: (index, value) =>
    set((state) => {
      const options = [...state.pollConfig.options];
      options[index] = value;
      return { pollConfig: { ...state.pollConfig, options } };
    })
}));

export { usePostPollStore };
