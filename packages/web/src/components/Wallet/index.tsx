import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  ArrowTopRightOnSquareIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  Square2StackIcon
} from "@heroicons/react/24/outline";
import { type AnyBalance, useBalancesBulkQuery } from "@palus/indexer";
import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useConnection } from "wagmi";
import MenuTransition from "@/components/Shared/MenuTransition";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
import Skeleton from "@/components/Shared/Skeleton";
import { Card, CardHeader, Tabs, Tooltip } from "@/components/Shared/UI";
import ActivityShimmer from "@/components/Wallet/Activity/Shimmer";
import TokensShimmer from "@/components/Wallet/Tokens/Shimmer";
import { BLOCK_EXPLORER_URL } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import { TOKENS } from "@/data/tokens";
import cn from "@/helpers/cn";
import formatAddress from "@/helpers/formatAddress";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import Activity from "./Activity";
import Deposit from "./Deposit";
import Send from "./Send";
import Tokens from "./Tokens";
import Withdraw from "./Withdraw";

enum WalletTab {
  Tokens = "TOKENS",
  Activity = "ACTIVITY"
}

const Wallet = () => {
  const [activeTab, setActiveTab] = useState<string>(WalletTab.Tokens);

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  const { currentAccount } = useAccountStore();
  const { address: walletAddress } = useConnection();

  const navigate = useNavigate();

  useEffect(() => {
    if (!tab) {
      setActiveTab(WalletTab.Tokens);
      return;
    }
    setActiveTab(tab.toUpperCase());
  }, [tab]);

  const { data, refetch, loading, error } = useBalancesBulkQuery({
    pollInterval: 5000,
    skip: !currentAccount?.address,
    variables: {
      request: {
        address: currentAccount?.address,
        includeNative: true,
        tokens: TOKENS.filter(
          (token) =>
            token.contractAddress !== "" &&
            token.contractAddress !== CONTRACTS.nativeToken
        ).map((token) => token.contractAddress)
      }
    }
  });

  const copyAddress = useCopyToClipboard(
    currentAccount?.address,
    "Address copied to clipboard!"
  );

  const totalBalance =
    data?.balancesBulk?.reduce((acc, balance) => {
      if (
        balance.__typename === "NativeAmount" ||
        (balance.__typename === "Erc20Amount" &&
          balance.asset.contract.address === CONTRACTS.wrappedNativeToken)
      ) {
        return acc + Number.parseFloat(balance.value);
      }
      return acc;
    }, 0) || 0;

  const tabs = [
    { name: "Tokens", type: WalletTab.Tokens },
    { name: "Activity", type: WalletTab.Activity }
  ];

  if (!currentAccount) {
    return <NotLoggedIn />;
  }

  const loggedInAsOwner =
    walletAddress?.toLowerCase() === currentAccount.owner.toLowerCase();

  return (
    <PageLayout zeroTopMargin>
      <Card>
        <CardHeader title="Account Wallet" />
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-x-1 text-sm">
            {formatAddress(currentAccount.address)}
            <Square2StackIcon
              className="size-4 cursor-pointer hover:text-brand-500"
              onClick={copyAddress}
            />
          </div>
          <Menu as="div" className="relative">
            <MenuButton as={Fragment}>
              <button
                aria-label="More"
                className="rounded-full p-1.5 hover:bg-gray-300/20"
                type="button"
              >
                <EllipsisVerticalIcon className="size-5 text-on-surface" />
              </button>
            </MenuButton>
            <MenuTransition>
              <MenuItems
                anchor="bottom end"
                className="mt-2 w-48 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
                static
              >
                <MenuItem
                  as="div"
                  className={({ focus }) =>
                    cn(
                      { "dropdown-active": focus },
                      "m-2 flex cursor-pointer items-center gap-x-2 rounded-lg px-2 py-1.5 text-sm"
                    )
                  }
                  onClick={() => navigate("/settings/manager")}
                >
                  <FingerPrintIcon className="size-5" />
                  <div>Manager settings</div>
                </MenuItem>
                <MenuItem
                  as="div"
                  className={({ focus }) =>
                    cn(
                      { "dropdown-active": focus },
                      "m-2 block rounded-lg px-2 py-1.5 text-sm"
                    )
                  }
                >
                  <Link
                    className="flex items-center gap-x-2"
                    rel="noopener noreferrer"
                    target="_blank"
                    to={`${BLOCK_EXPLORER_URL}/address/${currentAccount.address}`}
                  >
                    <ArrowTopRightOnSquareIcon className="size-5" />
                    <div>View on explorer</div>
                  </Link>
                </MenuItem>
              </MenuItems>
            </MenuTransition>
          </Menu>
        </div>
        {loading ? (
          <div className="center flex p-3">
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
        ) : error ? (
          <div className="center flex flex-col p-3">
            <ExclamationTriangleIcon className="size-8" />
            Error loading balance
          </div>
        ) : (
          <div className="center flex p-3 font-semibold text-5xl">
            <Tooltip content={totalBalance} placement="top">
              ${totalBalance.toFixed(2)}
            </Tooltip>
          </div>
        )}
        <div className="flex justify-center gap-x-4 px-5 py-2">
          <Deposit disabled={!loggedInAsOwner || loading || !!error} />
          <Send
            balances={data?.balancesBulk as AnyBalance[]}
            disabled={!loggedInAsOwner || loading || !!error}
          />
          <Withdraw
            balances={data?.balancesBulk as AnyBalance[]}
            disabled={!loggedInAsOwner || loading || !!error}
            refetch={refetch}
          />
        </div>
        {!loggedInAsOwner && (
          <div className="center mx-5 mt-2 flex gap-x-2 rounded-lg bg-yellow-100/50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            You are viewing this wallet as a manager. Connect the owner&apos;s
            wallet to enable transactions.
          </div>
        )}
        <div className="flex flex-col gap-y-2 pt-4 sm:p-5">
          <Tabs
            active={activeTab}
            className="border-border border-y py-2 sm:px-0"
            layoutId="wallet-tabs"
            setActive={(type) => {
              setActiveTab(type);
              setSearchParams(
                type !== WalletTab.Tokens ? { tab: type.toLowerCase() } : {}
              );
            }}
            tabs={tabs}
          />
          {activeTab === WalletTab.Tokens ? (
            loading ? (
              <TokensShimmer />
            ) : error ? (
              <div className="p-5">Error loading tokens.</div>
            ) : (
              <Tokens
                balances={data?.balancesBulk as AnyBalance[]}
                refetch={refetch}
              />
            )
          ) : null}
          {activeTab === WalletTab.Activity ? (
            loading ? (
              <ActivityShimmer />
            ) : (
              <Activity account={currentAccount.address} />
            )
          ) : null}
        </div>
      </Card>
    </PageLayout>
  );
};

export default Wallet;
