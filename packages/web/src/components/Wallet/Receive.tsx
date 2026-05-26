import {
  ExclamationTriangleIcon,
  Square2StackIcon
} from "@heroicons/react/24/outline";
import encodeQR from "qr";
import { useMemo } from "react";
import { Button, Image, Modal } from "@/components/Shared/UI";
import getAccount from "@/helpers/getAccount";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface Props {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const Receive = ({ modalOpen, setModalOpen }: Props) => {
  const { currentAccount } = useAccountStore();

  const copyAddress = useCopyToClipboard(
    currentAccount?.address,
    "Address copied to clipboard!"
  );

  const qr = useMemo(() => {
    if (!currentAccount) return null;
    return encodeQR(currentAccount?.address, "svg", { ecc: "high" });
  }, [currentAccount]);

  if (!qr || !currentAccount) return null;

  return (
    <Modal
      onClose={() => setModalOpen(false)}
      show={modalOpen}
      size="xs"
      title="Receive Assets"
    >
      <div className="flex flex-col items-center gap-4 p-5">
        <div className="font-bold text-lg">
          @{getAccount(currentAccount).username}
        </div>
        <div className="rounded-lg border border-border bg-white p-1">
          <Image
            alt="QR code"
            height={200}
            src={`data:image/svg+xml;base64,${btoa(qr)}`}
            width={200}
          />
        </div>
        <p className="break-all text-center text-secondary text-xs">
          {currentAccount.address}
        </p>
        <p className="text-center">
          Use this address to receive assets to{" "}
          <strong>your account on Lens Chain</strong>
        </p>
        <Button onClick={copyAddress} outline type="button">
          <Square2StackIcon className="size-4" />
          Copy address
        </Button>
        <div className="center mt-1 flex gap-x-2 rounded-xl bg-orange-300 px-3 py-2 text-sm dark:bg-orange-800">
          <ExclamationTriangleIcon className="size-10" />
          <span className="pt-0.5 leading-tight">
            Only use this address on Lens Chain or you will lose access to the
            assets
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default Receive;
