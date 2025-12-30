import { STATIC_IMAGES_URL } from "@palus/data/constants";

const getTokenImage = (symbol?: string): string => {
  if (!symbol) {
    return `${STATIC_IMAGES_URL}/gho.svg`;
  }

  const symbolLowerCase = symbol?.toLowerCase() || "";
  return `${STATIC_IMAGES_URL}/${symbolLowerCase}.svg`;
};

export default getTokenImage;
