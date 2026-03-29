import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Shared/UI";
import useUmami from "@/hooks/useUmami";
import { useInstallPromptStore } from "@/store/non-persisted/alert/installPromptStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const TOAST_ID = "prompt-install";

const useInstallListener = () => {
  const { track } = useUmami();
  const { event: installEvent, setEvent } = useInstallPromptStore();
  const { showInstallPrompt, setShowInstallPrompt } = usePreferencesStore();

  useEffect(() => {
    const promptedListener = (e: any) => {
      e.preventDefault();
      setEvent(e);
    };
    window.addEventListener("beforeinstallprompt", promptedListener);

    const installedListener = () => track("Installed");
    window.addEventListener("appinstalled", installedListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", promptedListener);
      window.removeEventListener("appinstalled", installedListener);
    };
  }, [track, setEvent]);

  const InstallAction = () => {
    return (
      <div className="flex flex-grow justify-end">
        <Button
          className="text-on-surface-invert"
          onClick={async () => {
            if (!installEvent) return;
            const choice = await installEvent.prompt();
            track("Install Prompted", {
              outcome: choice.outcome,
              ...(choice.platform
                ? { platform: choice.platform }
                : installEvent.platforms.length
                  ? { platform: installEvent.platforms.join() }
                  : {})
            });
            setShowInstallPrompt(false);
            toast.dismiss(TOAST_ID);
          }}
          outline
        >
          Install
        </Button>
      </div>
    );
  };

  const prompt = async () => {
    if (!installEvent || !showInstallPrompt) return;

    toast("Install Palus as an app", {
      action: <InstallAction />,
      duration: Number.POSITIVE_INFINITY,
      icon: <ArrowDownTrayIcon className="size-5" />,
      id: TOAST_ID,
      invert: true,
      onDismiss: () => {
        track("Install Prompted", {
          outcome: "dismissed",
          ...(installEvent.platforms.length && {
            platform: installEvent.platforms.join()
          })
        });
        setShowInstallPrompt(false);
      },
      position: "bottom-center"
    });
  };

  return { prompt };
};

export default useInstallListener;
