import { useEffect, useState } from "react";

/**
 * Fetches only the duration of an audio file by loading its metadata
 * via an HTML Audio element, without loading the full file.
 */
const useAudioDuration = (src: string): number => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";

    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.src = src;

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.src = "";
    };
  }, [src]);

  return duration;
};

export default useAudioDuration;
