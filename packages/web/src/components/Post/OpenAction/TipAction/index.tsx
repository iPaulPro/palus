import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { AccountFragment, PostFragment } from "@palus/indexer";
import { TipIcon } from "@/components/Shared/Icons/TipIcon";
import MenuTransition from "@/components/Shared/MenuTransition";
import TipMenu from "@/components/Shared/TipMenu";
import { Tooltip } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import nFormatter from "@/helpers/nFormatter";
import stopEventPropagation from "@/helpers/stopEventPropagation";

interface TipActionProps {
  post: PostFragment;
  showCount: boolean;
  currentAccount?: AccountFragment;
}

const TipAction = ({ currentAccount, post, showCount }: TipActionProps) => {
  const hasTipped = post.operations?.hasTipped;
  const { tips } = post.stats;

  return (
    <div className="flex items-center gap-x-1 text-gray-500 dark:text-gray-200">
      {/* @ts-ignore */}
      <Menu as="div" className="relative">
        <MenuButton
          aria-label="Tip"
          className={cn(
            hasTipped
              ? "text-brand-500 hover:bg-brand-300/20"
              : "text-gray-500 hover:bg-gray-300/20 dark:text-gray-200",
            "rounded-full p-1.5 outline-offset-2"
          )}
          disabled={currentAccount?.address === post.author.address}
          onClick={stopEventPropagation}
        >
          <Tooltip content="Tip" placement="top" withDelay>
            <TipIcon
              className={cn("size-5", { "text-brand-500": hasTipped })}
            />
          </Tooltip>
        </MenuButton>
        <MenuTransition>
          <MenuItems
            anchor="bottom"
            className="z-5 w-max origin-top-left rounded-xl border border-gray-200 bg-white shadow-xl [--anchor-gap:0.5rem] [--anchor-padding:0.5rem] focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
            static
          >
            <MenuItem>
              {({ close }: { close: () => void }) => (
                <TipMenu closePopover={close} post={post} />
              )}
            </MenuItem>
          </MenuItems>
        </MenuTransition>
      </Menu>
      {(tips || 0) > 0 && showCount && (
        <span
          className={cn(
            hasTipped ? "text-brand-500" : "text-gray-500 dark:text-gray-200",
            "w-3 text-sm"
          )}
        >
          {nFormatter(tips || 0)}
        </span>
      )}
    </div>
  );
};

export default TipAction;
