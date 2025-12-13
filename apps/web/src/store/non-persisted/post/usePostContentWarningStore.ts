import type { ContentWarning } from "@palus/indexer";
import { createTrackedStore } from "@/store/createTrackedStore";

interface State {
  contentWarning?: ContentWarning;
  setContentWarning: (warning?: ContentWarning) => void;
}

const { useStore: usePostContentWarningStore } = createTrackedStore<State>(
  (set) => ({
    contentWarning: undefined,
    setContentWarning: (contentWarning) => set(() => ({ contentWarning }))
  })
);

export { usePostContentWarningStore };
