import { useEffect, useRef, useState } from "react";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import cn from "@/helpers/cn";

interface Props {
  className?: string;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

const TimeLabel = ({ className = "" }: Props) => {
  const frameRef = useRef<number>(0);
  const [pos, setPos] = useState(0);
  const { duration, getPosition } = useAudioPlayerContext();

  useEffect(() => {
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
  }, [getPosition]);

  return (
    <div className={cn("w-[5ch] text-sm invert", className)}>
      {pos > 0 ? (
        <span>{formatTime(pos)}</span>
      ) : (
        <span>{formatTime(duration)}</span>
      )}
    </div>
  );
};

export default TimeLabel;
