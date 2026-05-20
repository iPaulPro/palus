import { useEffect, useRef, useState } from "react";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import cn from "@/helpers/cn";

interface Props {
  className?: string;
  duration?: number;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

const TimeLabel = ({ className = "", duration: durationProp }: Props) => {
  const frameRef = useRef<number>(0);
  const [pos, setPos] = useState(0);
  const { duration: globalDuration, getPosition } = useAudioPlayerContext();

  const isOverride = durationProp !== undefined;
  const displayDuration = isOverride ? durationProp : globalDuration;

  useEffect(() => {
    if (isOverride) return;

    const animate = () => {
      setPos(getPosition());
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [getPosition, isOverride]);

  return (
    <div className={cn("flex w-[6ch] justify-center text-sm", className)}>
      {!isOverride && pos > 0 ? (
        <span>{formatTime(pos)}</span>
      ) : (
        <span>{formatTime(displayDuration)}</span>
      )}
    </div>
  );
};

export default TimeLabel;
