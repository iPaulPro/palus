import { createTrackedStore } from "@/store/createTrackedStore";

type UserChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

type BeforeInstallPromptEvent = {
  prompt: () => Promise<UserChoice>;
  platforms: string[];
};

interface State {
  event?: BeforeInstallPromptEvent;
  setEvent: (e: BeforeInstallPromptEvent) => void;
}

const { useStore: useInstallPromptStore } = createTrackedStore<State>(
  (set) => ({
    event: undefined,
    setEvent: (event: BeforeInstallPromptEvent) => set(() => ({ event }))
  })
);

export { useInstallPromptStore };
