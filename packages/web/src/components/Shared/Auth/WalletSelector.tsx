import { KeyIcon } from "@heroicons/react/24/outline";
import { type FC, useState } from "react";
import { Link } from "react-router";
import type { Connector } from "wagmi";
import { useConnect, useConnection, useConnectors, useDisconnect } from "wagmi";
import { Alert } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import getWalletDetails from "@/helpers/getWalletDetails";

const isMobileAndroid =
  typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

const WalletSelector: FC = () => {
  const [showFamilyAlert, setShowFamilyAlert] = useState(false);
  const { mutateAsync: connectAsync, isPending } = useConnect();
  const { mutate: disconnect } = useDisconnect();
  const { connector: activeConnector } = useConnection();
  const connectors = useConnectors();

  const allowedConnectors = ["injected", "metaMaskSDK", "walletConnect"];

  const filteredConnectors = connectors
    .filter((connector: any) => {
      if (!allowedConnectors.includes(connector.id)) {
        return false;
      }
      switch (connector.id) {
        case "metaMaskSDK":
          return !isMobileAndroid; // MetaMask is broken on Android
        case "injected":
          return (
            typeof window !== "undefined" && Boolean((window as any).ethereum)
          );
        default:
          return true;
      }
    })
    .sort(
      (a: Connector, b: Connector) =>
        allowedConnectors.indexOf(a.id) - allowedConnectors.indexOf(b.id)
    );

  const handleConnect = async (connector: Connector) => {
    try {
      await connectAsync({ connector });
    } catch {}
  };

  return activeConnector?.id ? (
    <div className="space-y-2.5">
      <button
        className="flex items-center space-x-1 text-sm underline"
        onClick={() => disconnect?.()}
        type="reset"
      >
        <KeyIcon className="size-4" />
        <div>Change wallet</div>
      </button>
    </div>
  ) : (
    <>
      <div className="inline-block w-full space-y-3 overflow-hidden text-left align-middle">
        {filteredConnectors.map((connector: any) => {
          return (
            <button
              className={cn(
                {
                  "hover:bg-gray-100 dark:hover:bg-gray-700":
                    connector.id !== activeConnector?.id
                },
                "flex w-full items-center justify-between space-x-2.5 overflow-hidden rounded-xl border border-gray-200 px-4 py-3 outline-hidden dark:border-gray-800"
              )}
              data-umami-event="Wallet connect"
              data-umami-event-connector={connector.id}
              disabled={connector.id === activeConnector?.id || isPending}
              key={connector.id}
              onClick={() => handleConnect(connector)}
              type="button"
            >
              <span>{getWalletDetails(connector.id).name}</span>
              <img
                alt={connector.id}
                className="size-6"
                draggable={false}
                height={24}
                src={getWalletDetails(connector.id).logo}
                width={24}
              />
            </button>
          );
        })}
        <button
          className="flex w-full items-center justify-between space-x-2.5 overflow-hidden rounded-xl border border-gray-200 px-4 py-3 outline-hidden dark:border-gray-800"
          onClick={() => setShowFamilyAlert(true)}
          type="button"
        >
          <span>Login with Family</span>
          <img
            alt="Family wallet"
            className="size-6 rounded"
            draggable={false}
            height={24}
            src="/images/family.webp"
            width={24}
          />
        </button>
        <div className="linkify pt-1 text-gray-500 text-sm">
          By connecting a wallet, you agree to our{" "}
          <Link target="_blank" to="/terms">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link target="_blank" to="/privacy">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
      <Alert
        confirmText="Export Seed Phrase"
        description={
          <span>
            Login with Family is no longer supported on Palus due to being
            closed source and not providing a way to opt out of usage tracking.
            <br />
            <br /> You can export your seed phrase to use with a different
            wallet and log in.
          </span>
        }
        onClose={() => setShowFamilyAlert(false)}
        onConfirm={() =>
          window.open(
            "https://family.co/support/view-your-security-recovery-phrase",
            "_blank"
          )
        }
        show={showFamilyAlert}
        title="No longer supported"
      />
    </>
  );
};

export default WalletSelector;
