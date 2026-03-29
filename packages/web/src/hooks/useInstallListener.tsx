import { useEffect } from "react";
import useUmami from "@/hooks/useUmami";

const useInstallListener = () => {
  const { track } = useUmami();

  useEffect(() => {
    const promptedListener = () => track("Install", { detail: "Prompted" });
    window.addEventListener("beforeinstallprompt", promptedListener);

    const installedListener = () => track("Install", { detail: "Installed" });
    window.addEventListener("appinstalled", installedListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", promptedListener);
      window.removeEventListener("appinstalled", installedListener);
    };
  }, [track]);
};

export default useInstallListener;
