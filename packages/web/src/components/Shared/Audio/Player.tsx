import { memo } from "react";
import AudioSeekBar from "@/components/Shared/Audio/AudioSeekBar";
import TimeLabel from "@/components/Shared/Audio/TimeLabel";
import VolumeControl from "@/components/Shared/Audio/VolumeControl";

interface PlayerProps {
  disabled?: boolean;
  duration?: number;
}

const Player = ({ disabled = false, duration }: PlayerProps) => {
  return (
    <div className="flex items-center gap-x-2">
      <AudioSeekBar disabled={disabled} />
      <TimeLabel duration={duration} />
      <VolumeControl className="w-fit sm:w-1/2" disabled={disabled} />
    </div>
  );
};

export default memo(Player);
