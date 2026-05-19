import type { KeyboardEvent, MouseEvent } from "react";

const stopEventPropagation = (event: MouseEvent<Element> | KeyboardEvent) => {
  event.stopPropagation();
};

export default stopEventPropagation;
