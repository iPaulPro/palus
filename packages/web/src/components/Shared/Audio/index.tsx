import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { MediaAudioType } from "@palus/indexer";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import Loader from "@/components/Shared/Loader";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { usePostAudioStore } from "@/store/non-persisted/post/usePostAudioStore";
import CoverImage from "./CoverImage";
import Player from "./Player";

export const AudioPostSchema = z.object({
  artist: z.string().trim().min(1, { message: "Invalid artist name" }),
  cover: z.string().trim().min(1, { message: "Invalid cover image" }),
  title: z.string().trim().min(1, { message: "Invalid audio title" })
});

interface AudioProps {
  poster: string;
  src: string;
  type?: MediaAudioType;
  artist?: string | null;
  isNew?: boolean;
  title?: string;
}

const getFormat = (type?: MediaAudioType) => {
  if (!type) return undefined;
  switch (type) {
    case MediaAudioType.AudioWav:
    case MediaAudioType.AudioVndWave:
      return "wav";
    case MediaAudioType.AudioMpeg:
      return "mp3";
    case MediaAudioType.AudioMp_4:
      return "mp4";
    case MediaAudioType.AudioAac:
      return "m4a";
    case MediaAudioType.AudioWebm:
      return "webm";
    case MediaAudioType.AudioOgg:
      return "ogg";
    case MediaAudioType.AudioFlac:
      return "flac";
    default:
      return undefined;
  }
};

const Audio = ({
  artist,
  isNew = false,
  poster,
  src,
  type,
  title
}: AudioProps) => {
  const { audioPost, setAudioPost } = usePostAudioStore();
  const [newPreviewUri, setNewPreviewUri] = useState<null | string>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { load, isPlaying, play, pause, isLoading, isReady } =
    useAudioPlayerContext();

  useEffect(() => {
    load(src, {
      format: getFormat(type),
      html5: true,
      preload: "metadata"
    });
  }, [src]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAudioPost({
      ...audioPost,
      [event.target.name]: event.target.value
    });
  };

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 bg-gray-500 p-0 dark:border-gray-800"
      onClick={stopEventPropagation}
      style={{ backgroundImage: `url(${isNew ? newPreviewUri : poster})` }}
    >
      <div className="flex space-x-2 rounded-xl p-0 backdrop-blur-2xl backdrop-brightness-50">
        <CoverImage
          cover={isNew ? (newPreviewUri as string) : poster}
          imageRef={imageRef}
          isNew={isNew}
          setCover={(previewUri, cover, mimeType) => {
            setNewPreviewUri(previewUri);
            setAudioPost({ ...audioPost, cover, mimeType });
          }}
        />
        <div className="flex w-full flex-col justify-between px-3 py-3 sm:py-4">
          <div className="flex items-center gap-x-2.5 sm:mt-2">
            <button
              className="flex-none"
              disabled={!isReady}
              onClick={handlePlayPause}
              type="button"
            >
              {isPlaying ? (
                <PauseIcon className="size-8 text-gray-100 hover:text-white sm:size-12" />
              ) : isLoading ? (
                <Loader className="size-8 text-gray-100 sm:size-12" />
              ) : (
                <PlayIcon className="size-8 text-gray-100 hover:text-white sm:size-12" />
              )}
            </button>
            <div className="w-0 min-w-0 flex-1 overflow-hidden pr-3">
              {isNew ? (
                <div className="flex w-full flex-col space-y-1">
                  <input
                    autoComplete="off"
                    className="border-none bg-transparent p-0 text-lg text-white placeholder:text-white focus:ring-0"
                    name="title"
                    onChange={handleChange}
                    placeholder="Add title"
                    value={audioPost.title}
                  />
                  <input
                    autoComplete="off"
                    className="border-none bg-transparent p-0 text-white/70 placeholder:text-white/70 focus:ring-0"
                    name="artist"
                    onChange={handleChange}
                    placeholder="Add artist"
                    value={audioPost.artist}
                  />
                </div>
              ) : (
                <>
                  <div className="truncate text-white sm:text-lg">{title}</div>
                  <div className="truncate text-sm text-white/70 sm:text-base">
                    {artist}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="sm:p-2">
            <Player />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audio;
