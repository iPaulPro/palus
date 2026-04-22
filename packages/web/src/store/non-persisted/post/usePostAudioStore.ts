import { createTrackedStore } from "@/store/createTrackedStore";

interface AudioPost {
  artist: string;
  cover: string;
  mimeType: string;
  title: string;
  duration: number;
}

export const DEFAULT_AUDIO_POST: AudioPost = {
  artist: "",
  cover: "",
  duration: 0,
  mimeType: "",
  title: ""
};

interface State {
  audioPost: AudioPost;
  setAudioPost: (audioPost: AudioPost) => void;
}

const { useStore: usePostAudioStore } = createTrackedStore<State>((set) => ({
  audioPost: DEFAULT_AUDIO_POST,
  setAudioPost: (audioPost) => set(() => ({ audioPost }))
}));

export { usePostAudioStore };
