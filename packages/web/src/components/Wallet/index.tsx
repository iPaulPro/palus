import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  ArrowTopRightOnSquareIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  QrCodeIcon,
  Square2StackIcon
} from "@heroicons/react/24/outline";
import { type AnyBalance, useBalancesBulkQuery } from "@palus/indexer";
import { accountAbi } from "lens-modules/abis";
import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { Hex } from "viem";
import { useConnection, useReadContract } from "wagmi";
import MenuTransition from "@/components/Shared/MenuTransition";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
import Skeleton from "@/components/Shared/Skeleton";
import { Card, CardHeader, Tabs, Tooltip } from "@/components/Shared/UI";
import ActivityShimmer from "@/components/Wallet/Activity/Shimmer";
import Receive from "@/components/Wallet/Receive";
import TokensShimmer from "@/components/Wallet/Tokens/Shimmer";
import { BLOCK_EXPLORER_URL, CHAIN } from "@/data/constants";
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
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);

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

  const {
    data,
    refetch,
    loading: balancesLoading,
    error
  } = useBalancesBulkQuery({
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

  const { data: permissions, isFetching: permissionsLoading } = useReadContract(
    {
      abi: accountAbi,
      address: currentAccount?.address,
      args: [walletAddress as Hex],
      chainId: CHAIN.id,
      functionName: "getAccountManagerPermissions",
      query: {
        enabled: !!currentAccount?.address && !!walletAddress
      }
    }
  );

  const loading = balancesLoading || permissionsLoading;

  const canTransfer =
    currentAccount?.owner === walletAddress ||
    (permissions?.canTransferTokens && permissions.canTransferNative);

  const copyAddress = useCopyToClipboard(
    currentAccount?.address,
    "Address copied to clipboard!"
  );

  const totalBalance =
    data?.balancesBulk?.reduce((acc, balance) => {
      if (
        balance.__typename === "NativeAmount" ||
        (balance.__typename === "Erc20Amount" &&
          (balance.asset.contract.address === CONTRACTS.wrappedNativeToken ||
            balance.asset.contract.address === CONTRACTS.usdc))
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

  return (
    <>
      <PageLayout className="space-y-1 md:space-y-2" zeroTopMargin>
        <Card className="pb-4">
          <CardHeader title="Account Wallet" />
          <div className="flex items-center justify-between px-5 pt-4">
            <button
              className="flex items-center gap-x-1 text-sm"
              onClick={copyAddress}
              type="button"
            >
              {formatAddress(currentAccount.address)}
              <Square2StackIcon className="size-4 cursor-pointer hover:text-brand-500" />
            </button>
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
                    onClick={() => setReceiveModalOpen(true)}
                  >
                    <QrCodeIcon className="size-5" />
                    Receive assets
                  </MenuItem>
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
          <div className="flex justify-center gap-x-4 px-4 pt-2 sm:px-5 sm:pb-2">
            <Deposit
              disabled={!canTransfer || loading || !!error}
              refetch={refetch}
            />
            <Send
              balances={data?.balancesBulk as AnyBalance[]}
              disabled={!canTransfer || loading || !!error}
              refetch={refetch}
            />
            <Withdraw
              balances={data?.balancesBulk as AnyBalance[]}
              disabled={!canTransfer || loading || !!error}
              refetch={refetch}
            />
          </div>
          {loading || canTransfer ? null : (
            <div className="center mx-5 mt-2 flex gap-x-2 rounded-lg bg-yellow-100/50 p-3 text-center text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              You don&apos;t have permission to transfer tokens. Log in with the
              owner wallet to enable transfers.
            </div>
          )}
        </Card>
        <Tabs
          active={activeTab}
          className="py-2 md:px-4"
          layoutId="wallet-tabs"
          setActive={(type) => {
            setActiveTab(type);
            setSearchParams(
              type === WalletTab.Tokens ? {} : { tab: type.toLowerCase() }
            );
          }}
          tabs={tabs}
        />
        <Card>
          <div className="flex flex-col gap-y-2 px-4 py-3 sm:p-4">
            {activeTab === WalletTab.Tokens ? (
              loading ? (
                <TokensShimmer />
              ) : error ? (
                <div className="p-5">Error loading tokens.</div>
              ) : (
                <Tokens
                  balances={data?.balancesBulk as AnyBalance[]}
                  canTransfer={canTransfer}
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
      <Receive
        modalOpen={receiveModalOpen}
        setModalOpen={setReceiveModalOpen}
      />
    </>
  );
};

export default Wallet;
