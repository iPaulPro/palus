import { useEffect } from "react";
import type { AudioPlayer } from "@/hooks/useAudioPlayer";

const useMediaSessionHandlers = (player: AudioPlayer) => {
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const session = navigator.mediaSession;

    session.setActionHandler("play", () => {
      player.play();
      session.playbackState = "playing";
    });

    session.setActionHandler("pause", () => {
      player.pause();
      session.playbackState = "paused";
    });

    session.setActionHandler("stop", () => {
      player.stop();
      session.playbackState = "none";
    });

    session.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) {
        player.seek(details.seekTime);
      }
    });

    session.setActionHandler("seekbackward", (details) => {
      if (details.seekOffset != null) {
        const position = player.getPosition();
        player.seek(Math.max(position - details.seekOffset, 0));
      }
    });
    session.setActionHandler("seekforward", (details) => {
      if (details.seekOffset != null) {
        const position = player.getPosition();
        const duration = player.duration;
        player.seek(Math.min(position + details.seekOffset, duration));
      }
    });

    return () => {
      session.setActionHandler("play", null);
      session.setActionHandler("pause", null);
      session.setActionHandler("stop", null);
      session.setActionHandler("seekto", null);
      session.setActionHandler("seekbackward", null);
      session.setActionHandler("seekforward", null);
    };
  }, [player]);
};

export default useMediaSessionHandlers;
