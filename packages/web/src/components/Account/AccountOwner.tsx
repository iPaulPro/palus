import {
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSection
} from "@headlessui/react";
import { IdentificationIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";
import type { Hex } from "viem";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";
import MenuTransition from "@/components/Shared/MenuTransition";
import { Tooltip } from "@/components/Shared/UI";
import { BLOCK_EXPLORER_URL } from "@/data/constants";
import cn from "@/helpers/cn";
import formatAddress from "@/helpers/formatAddress";
import stopEventPropagation from "@/helpers/stopEventPropagation";

interface Props {
  ownerAddress: Hex;
}

const AccountOwner = ({ ownerAddress }: Props) => {
  const { data: ens } = useEnsName({
    address: ownerAddress,
    chainId: mainnet.id
  });

  return (
    <Menu as="div" className="relative">
      <MenuButton>
        <Tooltip content="Account Owner">
          <div className="flex items-center gap-x-1">
            <IdentificationIcon className="size-4" />
            <span>{ens ?? formatAddress(ownerAddress)}</span>
          </div>
        </Tooltip>
      </MenuButton>
      <MenuTransition>
        <MenuItems
          anchor="bottom start"
          className="mt-2 min-w-48 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xs focus:outline-hidden dark:border-gray-800 dark:bg-gray-900"
          static
        >
          <MenuSection>
            <MenuHeading>
              <div className="border-border border-b px-4 py-2 font-bold text-sm sm:hidden">
                Account Owner
              </div>
            </MenuHeading>
            <MenuItem
              as="div"
              className={({ focus }) =>
                cn(
                  { "dropdown-active": focus },
                  "m-2 rounded-lg px-2 py-1.5 text-sm"
                )
              }
              onClick={stopEventPropagation}
            >
              <Link
                className="flex items-center gap-x-2"
                rel="noopener noreferrer"
                target="_blank"
                to={`https://etherscan.io/address/${ownerAddress}`}
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Ethereum logo</title>
                  <path
                    clipRule="evenodd"
                    d="m12 3.208-5.021 6.953L12 12.864l5.021-2.703zm-.973-2.069a1.2 1.2 0 0 1 1.946 0l6.204 8.59a1.2 1.2 0 0 1-.404 1.76l-6.204 3.34a1.2 1.2 0 0 1-1.138 0l-6.204-3.34a1.2 1.2 0 0 1-.404-1.76z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                  <path
                    clipRule="evenodd"
                    d="M17.71 13.527c1.16-.58 2.287.836 1.463 1.836l-6.247 7.585a1.2 1.2 0 0 1-1.852 0l-6.247-7.585c-.824-1 .304-2.416 1.463-1.836L12 16.382zM16 16.5l-3.463 1.85a1.2 1.2 0 0 1-1.074 0L8 16.5l4 4.427z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
                View on Etherscan
              </Link>
            </MenuItem>
            <MenuItem
              as="div"
              className={({ focus }) =>
                cn(
                  { "dropdown-active": focus },
                  "m-2 rounded-lg px-2 py-1.5 text-sm"
                )
              }
              onClick={stopEventPropagation}
            >
              <Link
                className="flex items-center gap-x-2"
                rel="noopener noreferrer"
                target="_blank"
                to={`${BLOCK_EXPLORER_URL}/address/${ownerAddress}`}
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 204 130"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Lens logo</title>
                  <path
                    clipRule="evenodd"
                    d="M140.236 34.2127C148.585 27.1958 157.901 24.5261 166.835 25.201C176.365 25.9209 185.184 30.4204 191.77 36.956C198.357 43.492 202.881 52.2342 203.606 61.6691C204.336 71.19 201.172 81.1618 192.828 89.9136C192.064 90.7192 191.284 91.5148 190.488 92.3003C152.642 129.852 102.368 129.951 101.854 129.951H101.851C101.595 129.951 51.1619 129.949 13.2174 92.2951L13.2091 92.2868C12.4258 91.5047 11.6543 90.7177 10.8946 89.9256L10.8884 89.9192C2.54038 81.175 -0.627422 71.2055 0.101149 61.6848C0.823023 52.2515 5.3448 43.5082 11.9292 36.9699C18.5132 30.432 27.3314 25.929 36.8631 25.206C45.7966 24.5283 55.1141 27.1948 63.4682 34.2084C64.3665 23.3909 69.0465 14.9717 75.8401 9.1837C83.0857 3.0105 92.5278 0 101.852 0C111.176 0 120.618 3.0105 127.864 9.1837C134.658 14.9725 139.338 23.3931 140.236 34.2127Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
                View on Lens Explorer
              </Link>
            </MenuItem>
            {ens ? (
              <MenuItem
                as="div"
                className={({ focus }) =>
                  cn(
                    { "dropdown-active": focus },
                    "m-2 rounded-lg px-2 py-1.5 text-sm"
                  )
                }
                onClick={stopEventPropagation}
              >
                <Link
                  className="flex items-center gap-x-2"
                  rel="noopener noreferrer"
                  target="_blank"
                  to={`https://app.ens.domains/${ens}`}
                >
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 202 231"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>ENS logo</title>
                    <path
                      d="M98.359 2.803 34.835 107.327C34.337 108.147 33.18 108.238 32.562 107.505 26.969 100.864 6.135 72.615 31.915 46.867 55.44 23.373 85.405 6.621 96.51.832 97.77.175 99.097 1.59 98.359 2.803ZM94.846 230.385C96.114 231.273 97.676 229.759 96.826 228.467 82.637 206.886 35.471 135.081 28.956 124.302 22.53 113.67 9.89 96.001 8.835 80.884 8.73 79.375 6.643 79.069 6.118 80.488 5.272 82.777 4.37 85.509 3.53 88.629-7.074 128.023 8.327 169.826 41.775 193.238L94.846 230.386V230.385ZM103.571 228.526 167.095 124.003C167.593 123.183 168.751 123.092 169.369 123.825 174.961 130.465 195.796 158.715 170.015 184.463 146.49 207.957 116.526 224.709 105.421 230.498 104.161 231.155 102.834 229.74 103.571 228.526ZM107.154.931C105.886.043 104.324 1.557 105.174 2.849 119.363 24.43 166.529 96.235 173.044 107.014 179.471 117.646 192.11 135.315 193.165 150.432 193.27 151.941 195.357 152.247 195.882 150.828 196.728 148.539 197.63 145.808 198.47 142.687 209.074 103.293 193.673 61.491 160.225 38.078L107.154.931Z"
                      fill="currentColor"
                    />
                  </svg>
                  View on ENS
                </Link>
              </MenuItem>
            ) : null}
          </MenuSection>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
};

export default AccountOwner;
