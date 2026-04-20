import { useMediaQuery } from "@uidotdev/usehooks";
import type { ReactNode } from "react";
import { memo } from "react";
import MetaTags from "@/components/Common/MetaTags";
import { useAudioPlayerContext } from "@/components/Common/Providers/AudioPlayerProvider";
import SidebarAudioPlayer from "@/components/Shared/Audio/SidebarAudioPlayer";
import SignupButton from "@/components/Shared/Navbar/SignupButton";
import cn from "@/helpers/cn";
import { IS_STANDALONE } from "@/helpers/mediaQueries";
import { useStickyContentScroll } from "@/hooks/useStickyContentScroll";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import LoginButton from "./LoginButton";
import Search from "./Search";
import Sidebar from "./Sidebar";

interface AuthButtonsProps {
  className?: string;
}

const AuthButtons = ({ className }: AuthButtonsProps) => {
  const { currentAccount } = useAccountStore();

  if (currentAccount) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-x-2", className)}>
      <SignupButton className="w-full" />
      <LoginButton className="w-full" />
    </div>
  );
};

interface PageLayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
  sidebar?: ReactNode;
  hideSearch?: boolean;
  zeroTopMargin?: boolean;
  className?: string;
}

const PageLayout = ({
  title,
  children,
  description,
  sidebar = <Sidebar />,
  hideSearch = false,
  zeroTopMargin = false,
  className = ""
}: PageLayoutProps) => {
  const isStandalone = useMediaQuery(IS_STANDALONE);
  const { isUnloaded } = useAudioPlayerContext();
  const { containerRef, contentRef } = useStickyContentScroll();

  return (
    <>
      <MetaTags description={description} title={title} />
      <div
        className={cn(
          "mt-4 mb-16 w-full min-w-0 grow space-y-4 md:mt-5 md:mb-5 md:space-y-5",
          {
            "mb-28 sm:mb-16": isStandalone,
            "mb-40 sm:mb-16": isStandalone && !isUnloaded,
            "mt-0 md:mt-5": zeroTopMargin
          },
          className
        )}
      >
        <AuthButtons
          className={cn(
            { "mt-5": zeroTopMargin },
            "w-full md:w-[22.5rem]",
            "ml-auto px-5 md:px-0 lg:hidden"
          )}
        />
        {children}
      </div>
      <aside
        className="sticky top-0 hidden h-[calc(100vh-2.5rem)] shrink-0 items-start pt-5 lg:flex"
        ref={containerRef}
      >
        <div className="flex w-88 flex-col gap-y-5" ref={contentRef}>
          <AuthButtons />
          {!hideSearch && <Search />}
          <SidebarAudioPlayer />
          {sidebar}
        </div>
      </aside>
    </>
  );
};

export default memo(PageLayout);
