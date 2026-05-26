import { createTrackedStore } from "@/store/createTrackedStore";

interface VideoThumbnail {
  mimeType: string;
  uploading: boolean;
  url: string;
}

export const DEFAULT_VIDEO_THUMBNAIL: VideoThumbnail = {
  mimeType: "",
  uploading: false,
  url: ""
};

interface State {
  setVideoDurationInSeconds: (videoDurationInSeconds: string) => void;
  setVideoThumbnail: (videoThumbnail: VideoThumbnail) => void;
  updateVideoThumbnail: (partial: Partial<VideoThumbnail>) => void;
  videoDurationInSeconds: string;
  videoThumbnail: VideoThumbnail;
}

const { useStore: usePostVideoStore } = createTrackedStore<State>((set) => ({
  setVideoDurationInSeconds: (videoDurationInSeconds) =>
    set(() => ({ videoDurationInSeconds })),
  setVideoThumbnail: (videoThumbnail) => set(() => ({ videoThumbnail })),
  updateVideoThumbnail: (partial) =>
    set((state) => ({
      videoThumbnail: { ...state.videoThumbnail, ...partial }
    })),
  videoDurationInSeconds: "",
  videoThumbnail: DEFAULT_VIDEO_THUMBNAIL
}));

export { usePostVideoStore };
