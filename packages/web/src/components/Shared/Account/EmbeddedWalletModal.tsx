import { CheckIcon, KeyIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAddAccountManagerMutation } from "@palus/indexer";
import { useCallback, useState } from "react";
import { object, string } from "zod";
import {
  Button,
  ErrorMessage,
  Form,
  Input,
  useZodForm
} from "@/components/Shared/UI";
import { getEmbeddedWalletClient } from "@/helpers/embeddedAccount";
import useEmbeddedWalletClient, {
  EmbeddedWalletError
} from "@/hooks/useEmbeddedWalletClient";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import useWaitForTransactionToBeIndexed from "@/hooks/useWaitForTransactionToBeIndexed";
import { useEmbeddedWalletModalStore } from "@/store/non-persisted/modal/useEmbeddedWalletModalStore";
import type { ApolloClientError } from "@/types/errors";

const createPinSchema = object({
  confirmPin: string().min(6, "PIN must be at least 6 characters"),
  pin: string().min(6, "PIN must be at least 6 characters")
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs do not match",
  path: ["confirmPin"]
});

const unlockPinSchema = object({
  pin: string().min(1, "PIN is required")
});

const EmbeddedWalletModal = () => {
  const { transactionData, onCompleted, onError, setShowEmbeddedWalletModal } =
    useEmbeddedWalletModalStore();
  const {
    address,
    create,
    data: walletClient,
    error: walletError,
    loading: walletLoading,
    unlock
  } = useEmbeddedWalletClient();
  const handleTransactionLifecycle = useTransactionLifecycle();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const waitForTransactionToComplete = useWaitForTransactionToBeIndexed();

  const needsCreate =
    !walletLoading &&
    !address &&
    walletError !== EmbeddedWalletError.PinRequired;
  const needsUnlock =
    !walletLoading &&
    (walletError === EmbeddedWalletError.PinRequired ||
      (address !== null && walletClient === null));

  const createForm = useZodForm({ schema: createPinSchema });
  const unlockForm = useZodForm({ schema: unlockPinSchema });

  const completeTransaction = async () => {
    if (!transactionData || !onCompleted) {
      setShowEmbeddedWalletModal({ showEmbeddedWalletModal: false });
      return;
    }

    try {
      // After create/unlock the client is cached in memory, so no PIN needed
      const client = await getEmbeddedWalletClient();
      if (!client) {
        setError("Failed to get embedded wallet client");
        return;
      }

      await handleTransactionLifecycle({
        client,
        onCompleted: (hash) => {
          onCompleted(hash);
          setShowEmbeddedWalletModal({ showEmbeddedWalletModal: false });
        },
        onError: (err) => {
          onError?.(err);
          setShowEmbeddedWalletModal({ showEmbeddedWalletModal: false });
        },
        transactionData
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete transaction"
      );
    }
  };

  const onAddManagerCompleted = async (hash: string) => {
    await waitForTransactionToComplete(hash);
    await completeTransaction();
  };

  const onAddManagerError = useCallback((error: ApolloClientError) => {
    setError(error.message);
  }, []);

  const [addAccountManager] = useAddAccountManagerMutation({
    onCompleted: async ({ addAccountManager }) =>
      handleTransactionLifecycle({
        onCompleted: onAddManagerCompleted,
        onError: onAddManagerError,
        transactionData: addAccountManager
      }),
    onError
  });

  const handleCreate = async ({ pin }: { pin: string; confirmPin: string }) => {
    setSubmitting(true);
    setError(null);

    try {
      const address = await create(pin);
      await addAccountManager({
        variables: {
          request: {
            address,
            permissions: {
              canExecuteTransactions: true,
              canSetMetadataUri: false,
              canTransferNative: false,
              canTransferTokens: false
            }
          }
        }
      });
    } catch (err) {
      if (err instanceof DOMException) {
        setError("Failed to create embedded wallet. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async ({ pin }: { pin: string }) => {
    setSubmitting(true);
    setError(null);

    try {
      await unlock(pin);
      await completeTransaction();
    } catch (err) {
      if (
        err instanceof DOMException ||
        (err instanceof Error &&
          err.message === EmbeddedWalletError.IncorrectPin)
      ) {
        setError("Incorrect PIN. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center p-5">
        <div className="text-gray-500">Loading wallet...</div>
      </div>
    );
  }

  if (needsCreate) {
    return (
      <div className="p-5">
        <div className="mb-4 space-y-2">
          <div className="text-secondary">
            An embedded wallet is added as an Account Manager on your Lens
            account, letting you sign safe transactions without opening a wallet
            app or extension.
            <br /> <br />
            The generated private key is stored locally and encrypted with your
            PIN, so it never leaves your device.
          </div>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <CheckIcon className="size-4 text-green-500" />
              <span>Sign transactions seamlessly on your behalf</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="size-4 text-green-500" />
              <span>PIN only required once per session</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="size-4 text-green-500" />
              <span>Private key encrypted and stored only on this device</span>
            </div>
            <div className="flex items-center gap-2">
              <XMarkIcon className="size-4 text-red-500" />
              <span>
                Cannot transfer the native token, GHO, or any ERC-20 tokens
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XMarkIcon className="size-4 text-red-500" />
              <span>Cannot be used for any transactions that handle money</span>
            </div>
          </div>
        </div>
        <Form className="space-y-4" form={createForm} onSubmit={handleCreate}>
          <Input
            autoFocus
            placeholder="Enter a PIN"
            type="password"
            {...createForm.register("pin")}
          />
          <Input
            placeholder="Confirm your PIN"
            type="password"
            {...createForm.register("confirmPin")}
          />
          <ErrorMessage
            error={error ? { message: error } : undefined}
            title="Error"
          />
          <Button
            className="w-full"
            disabled={submitting}
            icon={<KeyIcon className="size-4" />}
            loading={submitting}
            type="submit"
          >
            Create Wallet
          </Button>
        </Form>
      </div>
    );
  }

  if (needsUnlock) {
    return (
      <div className="p-5">
        <div className="mb-4 space-y-1">
          <div className="text-secondary">
            Enter your PIN to unlock your embedded wallet and sign the
            transaction.
          </div>
        </div>
        <Form className="space-y-4" form={unlockForm} onSubmit={handleUnlock}>
          <Input
            autoFocus
            placeholder="Enter your PIN"
            type="password"
            {...unlockForm.register("pin")}
          />
          <ErrorMessage
            error={error ? { message: error } : undefined}
            title="Error"
          />
          <Button
            className="w-full"
            disabled={submitting}
            icon={<KeyIcon className="size-4" />}
            loading={submitting}
            type="submit"
          >
            Unlock & Sign
          </Button>
        </Form>
      </div>
    );
  }

  // Already unlocked — shouldn't normally render, but handle gracefully
  return null;
};

export default EmbeddedWalletModal;
