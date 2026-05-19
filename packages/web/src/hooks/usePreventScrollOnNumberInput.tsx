import type { RefObject } from "react";
import { useCallback, useEffect } from "react";

const usePreventScrollOnNumberInput = (
  ref: RefObject<HTMLInputElement>
): void => {
  const preventScroll = useCallback((event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // react-doctor-disable-next-line react-doctor/advanced-event-handler-refs
  useEffect(() => {
    const input = ref.current;

    if (input) {
      // react-doctor-disable-next-line react-doctor/client-passive-event-listeners
      input.addEventListener("wheel", preventScroll, { passive: false });
    }

    return () => {
      if (input) {
        input.removeEventListener("wheel", preventScroll);
      }
    };
  }, [ref, preventScroll]);
};

export default usePreventScrollOnNumberInput;
