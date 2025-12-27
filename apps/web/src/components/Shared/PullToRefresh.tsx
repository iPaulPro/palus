import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { useMediaQuery } from "@uidotdev/usehooks";
import type { ReactNode } from "react";
import SimplePullToRefresh from "react-simple-pull-to-refresh";
import Loader from "@/components/Shared/Loader";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<any>;
}

const PullToRefresh = ({ children, onRefresh }: PullToRefreshProps) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");

  const PullingContent = () => {
    return (
      <div className="flex h-24 w-full flex-col items-center gap-y-2 p-4">
        <span className="text-sm">Keep pulling to refresh</span>
        <div className="left-dash mt-1 flex-grow" />
        <ArrowDownIcon className="size-4" />
      </div>
    );
  };

  const RefreshingContent = () => {
    return (
      <div className="flex h-24 w-full items-center justify-center">
        <Loader />
      </div>
    );
  };

  const Noop = async () => {};

  return (
    <SimplePullToRefresh
      isPullable={isSmallDevice && Boolean(onRefresh)}
      maxPullDownDistance={128}
      onRefresh={onRefresh ?? Noop}
      pullDownThreshold={96}
      pullingContent={<PullingContent />}
      refreshingContent={<RefreshingContent />}
    >
      {children}
    </SimplePullToRefresh>
  );
};

export default PullToRefresh;
