import { createTrackedStore } from "@/store/createTrackedStore";

type AudioMetadata = {
  artist?: string;
  title?: string;
  poster?: string;
  postId?: string;
};

interface State {
  clear: () => void;
  metadata?: AudioMetadata;
  setMetadata: (metadata: AudioMetadata) => void;
}

const { useStore: useAudioMetadataStore } = createTrackedStore<State>(
  (set) => ({
    clear: () => set(() => ({ metadata: undefined })),
    metadata: undefined,
    setMetadata: (metadata: AudioMetadata) => set(() => ({ metadata }))
  })
);

export { useAudioMetadataStore };
