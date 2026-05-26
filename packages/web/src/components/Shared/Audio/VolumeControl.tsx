import { useCallback } from "react";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import { Slider } from "@/components/Shared/UI";

interface Props {
  className?: string;
  disabled?: boolean;
  invert?: boolean;
}

const VolumeControl = ({
  className = "",
  disabled = false,
  invert = false
}: Props) => {
  const { setVolume, volume, isMuted } = useAudioPlayerContext();

  const handleChange = useCallback(
    (value: number[]) => {
      if (disabled) return;
      const volValue = Number.parseFloat((Number(value[0]) / 100).toFixed(2));
      return setVolume(volValue);
    },
    [setVolume, disabled]
  );

  return (
    <Slider
      className={className}
      disabled={disabled}
      invert={invert}
      onValueChange={handleChange}
      value={disabled ? [0] : isMuted ? [0] : [volume * 100]}
    />
  );
};

export default VolumeControl;
