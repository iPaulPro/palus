import { useEffect } from "react";
import { TRANSFORMS } from "@/data/constants";
import imageKit from "@/helpers/imageKit";
import type { AudioPlayer } from "@/hooks/useAudioPlayer";
import { useAudioMetadataStore } from "@/store/non-persisted/audio/useAudioMetadataStore";

const useMediaSession = (player: AudioPlayer) => {
  const { metadata } = useAudioMetadataStore();

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (!metadata) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      artist: metadata.artist || "Unknown Artist",
      artwork: metadata.poster
        ? [{ src: imageKit(metadata.poster, TRANSFORMS.POSTER) }]
        : [],
      title: metadata.title || "Untitled"
    });
  }, [metadata]);

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

export default useMediaSession;
