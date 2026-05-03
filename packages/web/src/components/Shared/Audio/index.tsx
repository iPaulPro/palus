import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { MediaAudioType } from "@palus/indexer";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import Loader from "@/components/Shared/Loader";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import { useAudioMetadataStore } from "@/store/non-persisted/audio/useAudioMetadataStore";
import { usePostAudioStore } from "@/store/non-persisted/post/usePostAudioStore";
import useAudioDuration from "../../../hooks/useAudioDuration";
import AudioSeekBar from "./AudioSeekBar";
import CoverImage from "./CoverImage";
import MuteButton from "./MuteButton";
import TimeLabel from "./TimeLabel";
import VolumeControl from "./VolumeControl";

export const AudioPostSchema = z.object({
  artist: z.string().trim().min(1, { message: "Invalid artist name" }),
  cover: z.string().trim().min(1, { message: "Invalid cover image" }),
  duration: z.number({ message: "Invalid duration" }),
  title: z.string().trim().min(1, { message: "Invalid audio title" })
});

interface AudioProps {
  poster: string;
  src: string;
  type?: MediaAudioType | string;
  artist?: string;
  isNew?: boolean;
  isEditing?: boolean;
  title?: string;
  postId?: string;
}

const getFormat = (type?: MediaAudioType | string) => {
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
      return type;
  }
};

const Audio = ({
  artist,
  isNew = false,
  isEditing = false,
  poster,
  src,
  type,
  title,
  postId
}: AudioProps) => {
  const [newPreviewUri, setNewPreviewUri] = useState<null | string>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { audioPost, setAudioPost } = usePostAudioStore();
  const { setMetadata } = useAudioMetadataStore();

  const {
    load,
    togglePlayPause,
    duration,
    isPlaying,
    isLoading,
    isReady,
    unmute,
    src: globalSrc
  } = useAudioPlayerContext();

  useEffect(() => {
    if (!isNew) return;
    load(src, {
      format: getFormat(type)
    });
  }, [isNew, src, type]);

  useEffect(() => {
    if (!isNew) return;
    setAudioPost({
      ...audioPost,
      duration: Math.floor(duration)
    });
  }, [isNew, duration, audioPost]);

  const isCurrentTrack = globalSrc === src;
  const localDuration = useAudioDuration(isCurrentTrack || isNew ? "" : src);

  const handlePlayPause = () => {
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      unmute();
      load(src, {
        autoplay: true,
        format: getFormat(type),
        html5: true
      });
    }
    setMetadata({ artist, poster, postId, title });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAudioPost({
      ...audioPost,
      [event.target.name]: event.target.value
    });
  };

  const showPlaying = isCurrentTrack && isPlaying;
  const showLoading = isCurrentTrack && isLoading;
  const playerDisabled = !isCurrentTrack && !isNew;

  return (
    <div
      className="[@supports(-moz-appearance:none)]:!bg-none h-24 overflow-hidden rounded-xl border border-gray-200 bg-gray-500 p-0 sm:h-32 dark:border-gray-800"
      onClick={stopEventPropagation}
      style={{ backgroundImage: `url(${isNew ? newPreviewUri : poster})` }}
    >
      <div className="flex h-full w-full space-x-2 rounded-xl bg-black/50 p-0 backdrop-blur-2xl [@supports(-moz-appearance:none)]:backdrop-blur-none">
        <CoverImage
          cover={newPreviewUri ?? (isEditing ? audioPost.cover : poster)}
          imageRef={imageRef}
          isEditing={isEditing}
          isNew={isNew}
          setCover={(previewUri, cover, mimeType) => {
            setNewPreviewUri(previewUri);
            setAudioPost({ ...audioPost, cover, mimeType });
          }}
        />
        <div className="flex w-full flex-col justify-between py-3 pr-3 pl-1 sm:px-2 sm:py-3">
          <div className="flex items-center gap-x-2.5 sm:mt-2">
            <button
              className="flex-none"
              disabled={isCurrentTrack && !isReady}
              onClick={handlePlayPause}
              type="button"
            >
              {showPlaying ? (
                <PauseIcon className="size-8 text-gray-100 hover:text-white sm:size-12" />
              ) : showLoading ? (
                <div className="size-8 px-1 py-1.5 sm:size-12 sm:px-1 sm:py-2">
                  <Loader className="text-gray-100" size="lg" />
                </div>
              ) : (
                <PlayIcon className="size-8 text-gray-100 hover:text-white sm:size-12" />
              )}
            </button>
            <div className="w-0 min-w-0 flex-1 overflow-hidden pr-3">
              {isNew || isEditing ? (
                <div className="flex w-full flex-col space-y-1">
                  <input
                    autoComplete="off"
                    className="border-none bg-transparent p-0 text-white placeholder:text-white focus:ring-0 sm:text-lg"
                    name="title"
                    onChange={handleChange}
                    placeholder="Add title"
                    value={audioPost.title}
                  />
                  <input
                    autoComplete="off"
                    className="border-none bg-transparent p-0 text-sm text-white/70 placeholder:text-white/70 focus:ring-0 sm:text-base"
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
          <div className="flex items-center gap-x-2 pt-1 pl-1 sm:p-2">
            <AudioSeekBar disabled={playerDisabled} invert />
            <TimeLabel
              className="text-white"
              duration={playerDisabled ? localDuration : undefined}
            />
            <MuteButton className="text-white" disabled={playerDisabled} />
            <VolumeControl
              className="hidden w-2/5 sm:flex"
              disabled={playerDisabled}
              invert
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audio;
