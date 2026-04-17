import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";
import { useCallback } from "react";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import { Slider } from "@/components/Shared/UI";
import cn from "@/helpers/cn";

interface Props {
  className?: string;
}

const VolumeControl = ({ className = "" }: Props) => {
  const { setVolume, volume, toggleMute, isMuted } = useAudioPlayerContext();

  const handleChange = useCallback(
    (value: number[]) => {
      const volValue = Number.parseFloat((Number(value[0]) / 100).toFixed(2));
      return setVolume(volValue);
    },
    [setVolume]
  );

  return (
    <div className={cn("flex w-full items-center gap-x-2", className)}>
      <button onClick={toggleMute} type="button">
        {isMuted ? (
          <SpeakerXMarkIcon className="ml-1 size-5 text-card" />
        ) : (
          <SpeakerWaveIcon className="ml-1 size-5 text-card" />
        )}
      </button>
      <Slider
        className="hidden sm:flex"
        onValueChange={handleChange}
        value={isMuted ? [0] : [volume * 100]}
      />
    </div>
  );
};

export default VolumeControl;
