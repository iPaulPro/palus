import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";
import { useCallback } from "react";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import { Slider } from "@/components/Shared/UI";
import cn from "@/helpers/cn";

interface Props {
  className?: string;
  disabled?: boolean;
}

const VolumeControl = ({ className = "", disabled = false }: Props) => {
  const { setVolume, volume, toggleMute, isMuted } = useAudioPlayerContext();

  const handleChange = useCallback(
    (value: number[]) => {
      if (disabled) return;
      const volValue = Number.parseFloat((Number(value[0]) / 100).toFixed(2));
      return setVolume(volValue);
    },
    [setVolume, disabled]
  );

  return (
    <div className={cn("flex w-full items-center gap-x-2", className)}>
      <button disabled={disabled} onClick={toggleMute} type="button">
        {!disabled && isMuted ? (
          <SpeakerXMarkIcon className="ml-1 size-5 text-card" />
        ) : (
          <SpeakerWaveIcon className="ml-1 size-5 text-card" />
        )}
      </button>
      <Slider
        className="hidden sm:flex"
        disabled={disabled}
        onValueChange={handleChange}
        value={disabled ? [0] : isMuted ? [0] : [volume * 100]}
      />
    </div>
  );
};

export default VolumeControl;
