import { useEffect, useRef, useState } from "react";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import { Slider } from "@/components/Shared/UI";
import cn from "@/helpers/cn";

interface Props {
  className?: string;
  disabled?: boolean;
}

const AudioSeekBar = ({ className = "", disabled = false }: Props) => {
  const { getPosition, duration, seek } = useAudioPlayerContext();
  const [pos, setPos] = useState(0);
  const frameRef = useRef<number>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (disabled) return;

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
  }, [disabled]);

  if (duration === Number.POSITIVE_INFINITY) return null;

  return (
    <div className={cn("w-full", className)}>
      <Slider
        disabled={disabled}
        max={disabled ? 100 : duration}
        onValueChange={(v) => {
          if (disabled) return;
          isDraggingRef.current = true;
          setPos(v[0]);
        }}
        onValueCommit={(v) => {
          if (disabled) return;
          seek(v[0]);
          isDraggingRef.current = false;
        }}
        value={disabled ? [0] : [pos]}
      />
    </div>
  );
};

export default AudioSeekBar;
