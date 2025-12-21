import { useMediaQuery } from "@uidotdev/usehooks";
import type { APITypes } from "plyr-react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import type { Ref } from "react";
import { memo } from "react";

interface PlayerProps {
  playerRef: Ref<APITypes>;
  src: string;
}

const Player = ({ playerRef, src }: PlayerProps) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");

  return (
    <Plyr
      options={{
        controls: [
          "progress",
          "current-time",
          "mute",
          !isSmallDevice && "volume"
        ]
      }}
      ref={playerRef}
      source={{ sources: [{ src }], type: "audio" }}
    />
  );
};

export default memo(Player);
