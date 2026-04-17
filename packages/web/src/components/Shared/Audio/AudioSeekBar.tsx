import { useEffect, useRef, useState } from "react";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import { Slider } from "@/components/Shared/UI";
import cn from "@/helpers/cn";

interface Props {
  className?: string;
}

const AudioSeekBar = ({ className = "" }: Props) => {
  const { getPosition, duration, seek } = useAudioPlayerContext();
  const [pos, setPos] = useState(0);
  const frameRef = useRef<number>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const animate = () => {
      if (!isDraggingRef.current) {
        setPos(getPosition());
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (duration === Number.POSITIVE_INFINITY) return null;

  return (
    <div className={cn("w-full", className)}>
      <Slider
        max={duration}
        onValueChange={(v) => {
          isDraggingRef.current = true;
          setPos(v[0]);
        }}
        onValueCommit={(v) => {
          seek(v[0]);
          isDraggingRef.current = false;
        }}
        value={[pos]}
      />
    </div>
  );
};

export default AudioSeekBar;
