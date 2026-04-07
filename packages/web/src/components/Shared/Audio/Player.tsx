import { useMediaQuery } from "@uidotdev/usehooks";
import type { APITypes } from "plyr-react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import type { Ref } from "react";
import { memo } from "react";
import { IS_MOBILE } from "@/helpers/mediaQueries";

interface PlayerProps {
  playerRef: Ref<APITypes>;
  src: string;
}

const Player = ({ playerRef, src }: PlayerProps) => {
  const isSmallDevice = useMediaQuery(IS_MOBILE);

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
