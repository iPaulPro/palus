import { useEffect, useRef } from "react";

export const useStickyContentScroll = () => {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const paddingTop =
      Number.parseFloat(getComputedStyle(container).paddingTop) || 0;

    let translateY = 0;
    let lastScrollY = window.scrollY;
    let rafId = 0;

    const render = (next: number) => {
      const maxScroll = Math.max(
        0,
        content.scrollHeight - (container.clientHeight - paddingTop)
      );
      translateY = Math.min(Math.max(0, next), maxScroll);
      content.style.transform = `translateY(-${translateY}px)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        render(translateY + (scrollY - lastScrollY));
        lastScrollY = scrollY;
      });
    };

    const ro = new ResizeObserver(() => render(translateY));
    ro.observe(content);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { containerRef, contentRef };
};
