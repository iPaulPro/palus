import { memo } from "react";
import { PhotoSlider } from "react-photo-view";

interface LightBoxProps {
  show: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

const LightBox = ({
  show,
  onClose,
  images,
  initialIndex = 0
}: LightBoxProps) => {
  return (
    <PhotoSlider
      bannerVisible={false}
      images={images.map((image) => ({ key: image, src: image }))}
      index={initialIndex}
      maskOpacity={0.75}
      onClose={onClose}
      visible={show}
    />
  );
};

export default memo(LightBox);
