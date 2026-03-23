import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { type AnyBalance, useWithdrawMutation } from "@palus/indexer";
import { useState } from "react";
import { Button } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import TokenOperation from "./TokenOperation";

interface WithdrawProps {
  balances: AnyBalance[];
  refetch: () => void;
  disabled: boolean;
}

const Withdraw = ({ balances, refetch, disabled }: WithdrawProps) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => setShowModal(true)}
        outline
        size="lg"
      >
        <ArrowUpIcon
          className="size-6 rounded-full border border-border bg-gray-50 p-1 dark:bg-gray-700"
          stroke="currentColor"
          strokeWidth={2}
        />
        Withdraw
      </Button>
      <TokenOperation
        balances={balances}
        refetch={refetch}
        resultKey="withdraw"
        setShowModal={setShowModal}
        showModal={showModal}
        successMessage="Withdrawal Successful"
        title="Withdraw"
        tokenAddress={CONTRACTS.nativeToken}
        useMutationHook={useWithdrawMutation}
      />
    </>
  );
};

export default Withdraw;
