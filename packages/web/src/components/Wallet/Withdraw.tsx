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
        className="px-3 text-sm sm:px-5 sm:text-base"
        disabled={disabled}
        onClick={() => setShowModal(true)}
        size="lg"
        variant="outline"
      >
        <ArrowUpIcon
          className="size-5 rounded-full border border-border bg-gray-50 p-1 sm:size-6 dark:bg-gray-700"
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
