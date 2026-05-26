import { toPng } from "html-to-image";

export const componentToPng = async (
  component: HTMLElement | null,
  options: {
    exclusionClasses: string[];
    width?: number;
    height?: number;
  } = {
    exclusionClasses: ["controls"],
    height: 300,
    width: 480
  }
) => {
  if (!component) {
    return null;
  }
  return await toPng(component, {
    filter: (node: HTMLElement) => {
      return !options.exclusionClasses.some((classname) =>
        node.classList?.contains(classname)
      );
    },
    height: options.height,
    pixelRatio: 2,
    style: {
      transform: "scale(1)"
    },
    width: options.width
  });
};
