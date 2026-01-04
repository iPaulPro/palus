import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import Skeleton from "@/components/Shared/Skeleton";
import { Card } from "@/components/Shared/UI";

interface PollActionShimmerProps {
  optionCount: number;
}

const PollActionShimmer = ({ optionCount }: PollActionShimmerProps) => {
  return (
    <Card forceRounded>
      <div className="space-y-3 px-2 pt-3 pb-2">
        {Array.from({ length: optionCount }).map((_, index) => (
          <div
            className="flex w-full items-center gap-x-2.5 rounded-xl p-2"
            key={index}
          >
            <div className="size-6 flex-none p-0.5">
              <Skeleton className="size-full rounded-full" />
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <div>
                  <span className="ld-text-gray-500">
                    <Skeleton className="h-4 w-8 rounded-lg" />
                  </span>
                </div>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-border border-t px-5 py-2">
        <div className="flex items-center space-x-2">
          <Bars3BottomLeftIcon className="size-4" />
          <Skeleton className="h-4 w-10 rounded-lg" />
          <span>·</span>
          <Skeleton className="h-4 w-16 rounded-lg" />
        </div>
      </div>
    </Card>
  );
};

export default PollActionShimmer;
