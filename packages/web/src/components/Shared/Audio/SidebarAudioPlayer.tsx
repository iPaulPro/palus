import { XCircleIcon } from "@heroicons/react/24/outline";
import {
  MusicalNoteIcon,
  PauseIcon,
  PlayIcon
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { Link } from "react-router";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import AudioSeekBar from "@/components/Shared/Audio/AudioSeekBar";
import MuteButton from "@/components/Shared/Audio/MuteButton";
import TimeLabel from "@/components/Shared/Audio/TimeLabel";
import Loader from "@/components/Shared/Loader";
import { Card, Image, LightBox } from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
import imageKit from "@/helpers/imageKit";
import { useAudioMetadataStore } from "@/store/non-persisted/audio/useAudioMetadataStore";

const FallbackPoster = () => {
  return (
    <div className="center flex size-16 shrink-0 rounded bg-gray-400">
      <MusicalNoteIcon className="size-8 text-gray-700" />
    </div>
  );
};

const SidebarAudioPlayer = () => {
  const { isReady, isPlaying, isLoading, isStopped, togglePlayPause, stop } =
    useAudioPlayerContext();
  const { metadata } = useAudioMetadataStore();

  const [showLightBox, setShowLightBox] = useState(false);

  if (!metadata || isStopped) return null;

  const artist = metadata?.artist ?? "Unknown artist";
  const title = metadata?.title ?? "Untitled";

  const handleClose = () => {
    stop();
  };

  return (
    <Card className="group relative p-5">
      <div className="flex gap-x-2">
        {metadata?.poster ? (
          <>
            <Image
              className="size-16 cursor-pointer rounded object-cover"
              onClick={() => setShowLightBox(true)}
              src={imageKit(metadata.poster, TRANSFORMS.AVATAR_SMALL)}
            />
            <LightBox
              images={[metadata.poster]}
              onClose={() => setShowLightBox(false)}
              show={showLightBox}
            />
          </>
        ) : (
          <FallbackPoster />
        )}
        <div className="flex w-full min-w-0 flex-col">
          <div className="flex w-full items-center gap-x-1">
            <button
              className="flex-none"
              disabled={!isReady}
              onClick={togglePlayPause}
              type="button"
            >
              {isPlaying ? (
                <PauseIcon className="size-8" />
              ) : isLoading ? (
                <div className="size-8 p-1">
                  <Loader size="sm" />
                </div>
              ) : (
                <PlayIcon className="size-8" />
              )}
            </button>
            <div className="w-full min-w-0">
              <Link to={`/posts/${metadata.postId}`}>
                <div className="truncate font-semibold">{title}</div>
              </Link>
              <div className="truncate text-secondary text-sm">{artist}</div>
            </div>
          </div>
          <div className="flex w-full items-center gap-x-2 pl-1.5">
            <AudioSeekBar
              className="mt-0.5"
              disabled={!isReady}
              hideThumb={true}
            />
            <TimeLabel />
            <MuteButton className="text-on-surface" disabled={!isReady} />
          </div>
        </div>
      </div>
      <button
        className="absolute top-2 right-2 hidden rounded-full bg-surface text-secondary hover:text-on-surface group-hover:block"
        onClick={handleClose}
        type="button"
      >
        <XCircleIcon className="size-5" />
      </button>
    </Card>
  );
};

export default SidebarAudioPlayer;
