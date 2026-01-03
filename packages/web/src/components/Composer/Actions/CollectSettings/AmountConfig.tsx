import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import { Input, Select } from "@/components/Shared/UI";
import { STATIC_IMAGES_URL } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import { tokens } from "@/data/tokens";
import { EXPANSION_EASE } from "@/helpers/variants";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import type { CollectActionType } from "@/types/palus";

interface AmountConfigProps {
  setCollectType: (data: CollectActionType) => void;
}

const AmountConfig = ({ setCollectType }: AmountConfigProps) => {
  const { currentAccount } = useAccountStore();
  const { collectAction } = useCollectActionStore((state) => state);

  const enabled = Boolean(collectAction.payToCollect?.native);

  return (
    <div>
      <ToggleWithHelper
        description="Get paid whenever someone collects your post"
        heading="Charge for collecting"
        icon={<CurrencyDollarIcon className="size-5" />}
        on={enabled}
        setOn={() => {
          setCollectType({
            payToCollect: enabled
              ? undefined
              : {
                  native: 1,
                  recipients: [
                    { address: currentAccount?.address, percent: 100 }
                  ], // 2.45% for the Palus platform fees after the 1.5% lens fees cut
                  referralShare: 3
                }
          });
        }}
      />
      {collectAction.payToCollect?.native ? (
        <motion.div
          animate="visible"
          className="mt-4 ml-8"
          initial="hidden"
          transition={{ duration: 0.2, ease: EXPANSION_EASE }}
          variants={{
            hidden: { height: 0, opacity: 0, y: -20 },
            visible: { height: "auto", opacity: 1, y: 0 }
          }}
        >
          <div className="flex space-x-2 text-sm">
            <Input
              label="Price"
              max="100000"
              min="0"
              onChange={(event) => {
                if (!collectAction.payToCollect) return;
                setCollectType({
                  payToCollect: {
                    ...collectAction.payToCollect,
                    native: event.target.value ? event.target.value : "0"
                  }
                });
              }}
              placeholder="0.5"
              type="number"
              value={Number.parseFloat(collectAction.payToCollect?.native)}
            />
            <div className="w-5/6">
              <div className="label">Select currency</div>
              <Select
                iconClassName="size-4 rounded-full"
                onChange={(value) => {
                  if (!collectAction.payToCollect) return;
                  setCollectType({
                    payToCollect: {
                      ...collectAction.payToCollect,
                      native: collectAction.payToCollect?.native
                    }
                  });
                }}
                options={tokens.map((token) => ({
                  icon: `${STATIC_IMAGES_URL}/${token.symbol.toLowerCase()}.svg`,
                  label: token.name,
                  selected: token.contractAddress === CONTRACTS.nativeToken,
                  value: token.contractAddress
                }))}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};

export default AmountConfig;
