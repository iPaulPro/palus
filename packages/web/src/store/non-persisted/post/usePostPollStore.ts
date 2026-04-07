import { createTrackedStore } from "@/store/createTrackedStore";

export interface PollConfig {
  durationInDays: number;
  options: string[];
}

interface State {
  pollConfig: PollConfig;
  resetPollConfig: () => void;
  setPollConfig: (pollConfig: PollConfig) => void;
  setShowPollEditor: (showPollEditor: boolean) => void;
  showPollEditor: boolean;
}

const { useStore: usePostPollStore } = createTrackedStore<State>((set) => ({
  pollConfig: { durationInDays: 7, options: ["", ""] },
  resetPollConfig: () =>
    set(() => ({ pollConfig: { durationInDays: 7, options: ["", ""] } })),
  setPollConfig: (pollConfig) => set(() => ({ pollConfig })),
  setShowPollEditor: (showPollEditor) => set(() => ({ showPollEditor })),
  showPollEditor: false
}));

export { usePostPollStore };
