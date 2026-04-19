import {
  MusicalNoteIcon,
  PauseIcon,
  PlayIcon
} from "@heroicons/react/24/solid";
import { useMediaQuery } from "@uidotdev/usehooks";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import AudioSeekBar from "@/components/Shared/Audio/AudioSeekBar";
import Loader from "@/components/Shared/Loader";
import { Card, Image } from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
import cn from "@/helpers/cn";
import imageKit from "@/helpers/imageKit";
import { IS_STANDALONE } from "@/helpers/mediaQueries";
import useSwipeToDismiss from "@/hooks/useSwipeToDismiss";
import { useAudioMetadataStore } from "@/store/non-persisted/audio/useAudioMetadataStore";

const FallbackPoster = () => {
  return (
    <div className="center flex size-12 shrink-0 rounded bg-gray-400">
      <MusicalNoteIcon className="size-8 text-gray-700" />
    </div>
  );
};

const BottomAudioPlayer = () => {
  const { isReady, isPlaying, isLoading, isStopped, togglePlayPause, stop } =
    useAudioPlayerContext();
  const { metadata } = useAudioMetadataStore();
  const isStandalone = useMediaQuery(IS_STANDALONE);

  const { ref, motionProps, reset } = useSwipeToDismiss({
    onDismissEnd: () => {
      stop();
      reset();
    }
  });

  if (!metadata || isStopped) return null;

  const artist = metadata?.artist ?? "Unknown artist";
  const title = metadata?.title ?? "Untitled";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("fixed inset-x-0 bottom-14 z-10 w-full px-2 md:hidden", {
        "bottom-22": isStandalone
      })}
      initial={{ opacity: 0, y: 100 }}
      key={metadata.postId}
      ref={ref}
      transition={{ damping: 30, stiffness: 300, type: "spring" }}
    >
      <motion.div {...motionProps}>
        <Card className="rounded-xl px-2 pt-2 drop-shadow-card">
          <div className="flex gap-x-2">
            {metadata?.poster ? (
              <Image
                className="size-12 cursor-pointer rounded object-cover"
                src={imageKit(metadata.poster, TRANSFORMS.AVATAR_SMALL)}
              />
            ) : (
              <FallbackPoster />
            )}
            <div className="flex w-full min-w-0 flex-col">
              <div className="flex w-full items-center gap-x-1 pr-2">
                <div className="w-full min-w-0">
                  <Link to={`/posts/${metadata.postId}`}>
                    <div className="truncate font-semibold">{title}</div>
                  </Link>
                  <div className="truncate text-secondary text-sm">
                    {artist}
                  </div>
                </div>
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
              </div>
            </div>
          </div>
          <AudioSeekBar className="mt-1" disabled={!isReady} hideThumb thin />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BottomAudioPlayer;
