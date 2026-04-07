import { useEffect } from "react";

const useWatchWindowResize = () => {
  useEffect(() => {
    function setVvh() {
      const vv = window.visualViewport;
      const h = vv ? vv.height : window.innerHeight;
      const t = vv ? vv.offsetTop : 0;
      document.documentElement.style.setProperty("--vvh", `${h}px`);
      document.documentElement.style.setProperty("--vvt", `${t}px`);
    }

    setVvh();
    window.addEventListener("resize", setVvh);
    window.visualViewport?.addEventListener("resize", setVvh);
    window.visualViewport?.addEventListener("scroll", setVvh, {
      passive: true
    });

    return () => {
      window.removeEventListener("resize", setVvh);
      window.visualViewport?.removeEventListener("resize", setVvh);
      window.visualViewport?.removeEventListener("scroll", setVvh);
    };
  }, []);
};

export default useWatchWindowResize;
