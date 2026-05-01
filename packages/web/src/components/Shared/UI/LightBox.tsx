import { useMediaQuery } from "@uidotdev/usehooks";
import { memo } from "react";
import { PhotoSlider } from "react-photo-view";
import { IS_MOBILE } from "@/helpers/mediaQueries";

interface LightBoxProps {
  show: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

const LightBox = ({
  show,
  onClose,
  images,
  initialIndex = 0,
  onIndexChange
}: LightBoxProps) => {
  const isSmallDevice = useMediaQuery(IS_MOBILE);

  return (
    <PhotoSlider
      bannerVisible={!isSmallDevice}
      images={images.map((image) => ({ key: image, src: image }))}
      index={initialIndex}
      maskOpacity={0.75}
      onClose={onClose}
      onIndexChange={onIndexChange}
      visible={show}
    />
  );
};

export default memo(LightBox);
