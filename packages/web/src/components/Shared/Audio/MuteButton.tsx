import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import cn from "@/helpers/cn";

interface Props {
  disabled?: boolean;
  className?: string;
}

const MuteButton = ({ disabled, className }: Props) => {
  const { toggleMute, isMuted } = useAudioPlayerContext();

  return (
    <button
      className={cn("pl-1 text-card", className)}
      disabled={disabled}
      onClick={toggleMute}
      type="button"
    >
      {isMuted ? (
        <SpeakerXMarkIcon className="size-5" />
      ) : (
        <SpeakerWaveIcon className="size-5" />
      )}
    </button>
  );
};

export default MuteButton;
