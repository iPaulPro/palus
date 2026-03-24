import { useCallback, useEffect, useEffectEvent, useRef } from "react";

export function useIntervalWhen(
  cb: () => {},
  {
    ms,
    when,
    startImmediately
  }: { ms: number; when: boolean; startImmediately: boolean }
) {
  const id = useRef<NodeJS.Timeout | null>(null);
  const onTick = useEffectEvent(cb);
  const immediatelyCalled = useRef(startImmediately === true ? false : null);

  const handleClearInterval = useCallback(() => {
    if (id.current) {
      clearInterval(id.current);
      id.current = null;
    }
    immediatelyCalled.current = false;
  }, []);

  useEffect(() => {
    if (when === true) {
      id.current = setInterval(onTick, ms);

      if (startImmediately === true && immediatelyCalled.current === false) {
        onTick();
        immediatelyCalled.current = true;
      }

      return handleClearInterval;
    }
  }, [ms, when, startImmediately, handleClearInterval]);

  return handleClearInterval;
}
