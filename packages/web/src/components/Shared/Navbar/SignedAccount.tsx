import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Link } from "react-router";
import MenuTransition from "@/components/Shared/MenuTransition";
import Install from "@/components/Shared/Navbar/NavItems/Install";
import Logout from "@/components/Shared/Navbar/NavItems/Logout";
import Settings from "@/components/Shared/Navbar/NavItems/Settings";
import SwitchAccount from "@/components/Shared/Navbar/NavItems/SwitchAccount";
import ThemeSwitch from "@/components/Shared/Navbar/NavItems/ThemeSwitch";
import { Image } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import getAvatar from "@/helpers/getAvatar";
import { IS_STANDALONE } from "@/helpers/mediaQueries";
import { useInstallPromptStore } from "@/store/non-persisted/alert/installPromptStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const Avatar = () => {
  const { currentAccount } = useAccountStore();

  return (
    <Image
      alt={currentAccount?.address}
      className="size-9 cursor-pointer rounded-full border border-gray-200 object-cover dark:border-gray-800"
      src={getAvatar(currentAccount)}
    />
  );
};

const SignedAccount = () => {
  const { event: installEvent } = useInstallPromptStore();
  const isStandalone = useMediaQuery(IS_STANDALONE);

  return (
    <Menu as="div">
      <MenuButton>
        <Avatar />
      </MenuButton>
      <MenuTransition>
        <MenuItems
          anchor="bottom start"
          className="z-5 mt-2 w-48 origin-top-left rounded-xl border border-gray-200 bg-white shadow-xs focus:outline-hidden dark:border-gray-800 dark:bg-black"
          static
        >
          <MenuItem
            as="div"
            className={({ focus }) =>
              cn({ "dropdown-active": focus }, "m-2 rounded-lg")
            }
          >
            <SwitchAccount />
          </MenuItem>
          <div className="divider" />
          <MenuItem
            as={Link}
            className={({ focus }: { focus: boolean }) =>
              cn({ "dropdown-active": focus }, "menu-item")
            }
            to="/settings"
          >
            <Settings />
          </MenuItem>
          <MenuItem
            as="div"
            className={({ focus }) =>
              cn({ "dropdown-active": focus }, "m-2 rounded-lg")
            }
          >
            <ThemeSwitch />
          </MenuItem>
          {!isStandalone && installEvent ? (
            <>
              <div className="divider" />
              <MenuItem
                as="div"
                className={({ focus }) =>
                  cn({ "dropdown-active": focus }, "m-2 rounded-lg")
                }
              >
                <Install />
              </MenuItem>
            </>
          ) : null}
          <div className="divider" />
          <MenuItem
            as="div"
            className={({ focus }) =>
              cn({ "dropdown-active": focus }, "m-2 rounded-lg")
            }
          >
            <Logout />
          </MenuItem>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
};

export default SignedAccount;
