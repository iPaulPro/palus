import { memo } from "react";
import AudioSeekBar from "@/components/Shared/Audio/AudioSeekBar";
import MuteButton from "@/components/Shared/Audio/MuteButton";
import TimeLabel from "@/components/Shared/Audio/TimeLabel";
import VolumeControl from "@/components/Shared/Audio/VolumeControl";

interface PlayerProps {
  disabled?: boolean;
  duration?: number;
}

const Player = ({ disabled = false, duration }: PlayerProps) => {
  return (
    <div className="flex items-center gap-x-2">
      <AudioSeekBar disabled={disabled} invert />
      <TimeLabel className="text-white" duration={duration} />
      <MuteButton className="text-white" disabled={disabled} />
      <VolumeControl
        className="hidden w-2/5 sm:flex"
        disabled={disabled}
        invert
      />
    </div>
  );
};

export default memo(Player);
