import { CalendarIcon } from "@heroicons/react/20/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { STATIC_IMAGES_URL, TRANSFORMS } from "@palus/data/constants";
import getAccount from "@palus/helpers/getAccount";
import getAvatar from "@palus/helpers/getAvatar";
import type { AccountFragment } from "@palus/indexer";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import FollowUnfollowButton from "@/components/Shared/Account/FollowUnfollowButton";
import TipButton from "@/components/Shared/Account/TipButton";
import TopAccount from "@/components/Shared/Badges/TopAccount";
import Markup from "@/components/Shared/Markup";
import Slug from "@/components/Shared/Slug";
import { Button, H3, Image, LightBox, Tooltip } from "@/components/Shared/UI";
import getAccountAttribute from "@/helpers/getAccountAttribute";
import getFavicon from "@/helpers/getFavicon";
import getMentions from "@/helpers/getMentions";
import { useTheme } from "@/hooks/useTheme";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import Followerings from "./Followerings";
import FollowersYouKnowOverview from "./FollowersYouKnowOverview";
import AccountMenu from "./Menu";
import MetaDetails from "./MetaDetails";

interface DetailsProps {
  isBlockedByMe: boolean;
  hasBlockedMe: boolean;
  account: AccountFragment;
}

const Details = ({
  isBlockedByMe = false,
  hasBlockedMe = false,
  account
}: DetailsProps) => {
  const navigate = useNavigate();
  const { currentAccount } = useAccountStore();
  const [showLightBox, setShowLightBox] = useState<boolean>(false);
  const { theme } = useTheme();

  const handleShowLightBox = useCallback(() => {
    setShowLightBox(true);
  }, []);

  const handleCloseLightBox = useCallback(() => {
    setShowLightBox(false);
  }, []);

  const renderAccountAttribute = (
    attribute: "location" | "website" | "x",
    icon: ReactNode
  ) => {
    if (isBlockedByMe) return null;

    const value = getAccountAttribute(attribute, account?.metadata?.attributes);
    if (!value) return null;

    return (
      <MetaDetails icon={icon}>
        <Link
          rel="noreferrer noopener"
          target="_blank"
          to={
            attribute === "website"
              ? `https://${value.replace(/https?:\/\//, "")}`
              : `https://x.com/${value.replace("https://x.com/", "")}`
          }
        >
          {value.replace(/https?:\/\//, "")}
        </Link>
      </MetaDetails>
    );
  };

  return (
    <div className="mb-4 space-y-3 px-5 md:px-0">
      <div className="flex items-start justify-between">
        <div className="-mt-14 sm:-mt-24 relative ml-5 size-20 sm:size-36">
          <Image
            alt={account.address}
            className="size-20 cursor-pointer rounded-full bg-gray-200 ring-3 ring-gray-50 sm:size-36 dark:bg-gray-700 dark:ring-black"
            height={128}
            onClick={handleShowLightBox}
            src={getAvatar(account, TRANSFORMS.AVATAR_BIG)}
            width={128}
          />
          <LightBox
            images={[getAvatar(account, TRANSFORMS.EXPANDED_AVATAR)]}
            onClose={handleCloseLightBox}
            show={showLightBox}
          />
        </div>
        <div className="flex items-center gap-x-2">
          {currentAccount?.address === account.address ? (
            <Button onClick={() => navigate("/settings")} outline>
              Edit Account
            </Button>
          ) : isBlockedByMe || hasBlockedMe ? null : (
            <FollowUnfollowButton account={account} />
          )}
          {!isBlockedByMe && !hasBlockedMe && <TipButton account={account} />}
          <AccountMenu account={account} />
        </div>
      </div>
      <div className="space-y-1 py-2">
        <div className="flex items-center gap-1.5">
          <H3 className="truncate">{getAccount(account).name}</H3>
          {account.score < 9000 ? null : <TopAccount className="size-6" />}
        </div>
        <div className="flex items-center space-x-3">
          <Slug
            className="text-sm sm:text-base"
            prefix="@"
            slug={getAccount(account).username}
          />
          {account.operations?.isFollowingMe ? (
            <div className="rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
              Follows you
            </div>
          ) : null}
        </div>
      </div>
      {!isBlockedByMe && account?.metadata?.bio ? (
        <Markup
          className="markup linkify"
          mentions={getMentions(account?.metadata.bio)}
        >
          {account?.metadata.bio}
        </Markup>
      ) : null}
      <div className="mt-4 space-y-5">
        <Followerings account={account} />
        {!isBlockedByMe && currentAccount?.address !== account.address ? (
          <FollowersYouKnowOverview
            address={account.address}
            username={getAccount(account).username}
          />
        ) : null}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {!isBlockedByMe &&
            getAccountAttribute("location", account?.metadata?.attributes) && (
              <MetaDetails icon={<MapPinIcon className="size-4" />}>
                {getAccountAttribute("location", account?.metadata?.attributes)}
              </MetaDetails>
            )}
          {renderAccountAttribute(
            "website",
            <img
              alt="Website"
              className="size-4 rounded-full"
              height={16}
              src={getFavicon(
                getAccountAttribute("website", account?.metadata?.attributes)
              )}
              width={16}
            />
          )}
          {renderAccountAttribute(
            "x",
            <Image
              alt="X Logo"
              className="size-4"
              height={16}
              src={`${STATIC_IMAGES_URL}/brands/${theme === "dark" ? "x-dark.png" : "x-light.png"}`}
              width={16}
            />
          )}
          <div className="flex items-center gap-x-1 text-sm">
            <CalendarIcon className="mr-1 size-4" />
            <span className="text-gray-500 dark:text-gray-200">Joined</span>
            <Tooltip
              content={dayjs(account.createdAt).format("MMM D, YYYY, h:mm A")}
            >
              <span className="text-gray-500 dark:text-gray-200">
                {dayjs(account.createdAt).format("MMM YYYY")}
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
