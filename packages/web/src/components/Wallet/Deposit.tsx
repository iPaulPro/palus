import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { useDepositMutation } from "@palus/indexer";
import { useState } from "react";
import { Button } from "@/components/Shared/UI";
import TokenOperation from "@/components/Wallet/TokenOperation";
import { CONTRACTS } from "@/data/contracts";

interface Props {
  refetch: () => void;
  disabled: boolean;
}

const Deposit = ({ refetch, disabled }: Props) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => setShowModal(true)}
        outline
        size="lg"
      >
        <ArrowDownIcon
          className="size-6 rounded-full border border-border bg-gray-50 p-1 dark:bg-gray-700"
          stroke="currentColor"
          strokeWidth={2}
        />
        Deposit
      </Button>
      <TokenOperation
        refetch={refetch}
        resultKey="deposit"
        setShowModal={setShowModal}
        showModal={showModal}
        successMessage="Deposit Successful"
        title="Deposit"
        tokenAddress={CONTRACTS.nativeToken}
        useMutationHook={useDepositMutation}
      />
    </>
  );
};

export default Deposit;
