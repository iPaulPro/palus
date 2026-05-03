import {
  MusicalNoteIcon,
  PauseIcon,
  PlayIcon
} from "@heroicons/react/24/solid";
import { useMediaQuery } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import AudioSeekBar from "@/components/Shared/Audio/AudioSeekBar";
import Loader from "@/components/Shared/Loader";
import {
  Image,
  MarqueeText,
  SwipeDirection,
  SwipeToDismiss
} from "@/components/Shared/UI";
import { TRANSFORMS } from "@/data/constants";
import cn from "@/helpers/cn";
import imageKit from "@/helpers/imageKit";
import { IS_STANDALONE } from "@/helpers/mediaQueries";
import { useAudioMetadataStore } from "@/store/non-persisted/audio/useAudioMetadataStore";

const FallbackPoster = () => {
  return (
    <div className="center flex size-12 shrink-0 rounded bg-gray-400">
      <MusicalNoteIcon className="size-8 text-gray-700" />
    </div>
  );
};

const BottomAudioPlayer = () => {
  const {
    isReady,
    isPlaying,
    isLoading,
    isUnloaded,
    cleanup,
    togglePlayPause,
    stop
  } = useAudioPlayerContext();
  const { metadata } = useAudioMetadataStore();
  const isStandalone = useMediaQuery(IS_STANDALONE);

  const artist = metadata?.artist ?? "Unknown artist";
  const title = metadata?.title ?? "Untitled";

  const handleDismiss = () => {
    stop();
    cleanup();
  };

  return (
    <AnimatePresence>
      {metadata && !isUnloaded ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "fixed inset-x-0 bottom-14 z-10 w-full px-2 sm:m-auto sm:w-96 md:bottom-8 lg:hidden",
            {
              "bottom-22": isStandalone
            }
          )}
          exit={{ opacity: 0, y: 100 }}
          initial={{ opacity: 0, y: 100 }}
          key={metadata.postId}
          transition={{ damping: 20, stiffness: 260, type: "spring" }}
        >
          <SwipeToDismiss
            directions={[
              SwipeDirection.LEFT,
              SwipeDirection.RIGHT,
              SwipeDirection.DOWN
            ]}
            onDismissEnd={handleDismiss}
          >
            <SwipeToDismiss.Target>
              <div className="rounded-xl border border-border bg-card px-2 pt-2 shadow-xl">
                <div className="flex items-center gap-x-2">
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
                          <MarqueeText className="font-semibold">
                            {title}
                          </MarqueeText>
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
                <AudioSeekBar
                  className="mt-1.5"
                  disabled={!isReady}
                  hideThumb
                  thin
                />
              </div>
            </SwipeToDismiss.Target>
          </SwipeToDismiss>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default BottomAudioPlayer;
