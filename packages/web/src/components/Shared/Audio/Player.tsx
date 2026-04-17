import { memo } from "react";
import AudioSeekBar from "@/components/Shared/Audio/AudioSeekBar";
import TimeLabel from "@/components/Shared/Audio/TimeLabel";
import VolumeControl from "@/components/Shared/Audio/VolumeControl";

const Player = () => {
  return (
    <div className="flex items-center gap-x-2">
      <AudioSeekBar />
      <TimeLabel />
      <VolumeControl className="w-fit sm:w-1/2" />
    </div>
  );
};

export default memo(Player);
