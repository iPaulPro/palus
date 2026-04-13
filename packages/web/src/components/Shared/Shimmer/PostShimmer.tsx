import { memo } from "react";
import Skeleton from "@/components/Shared/Skeleton";

const PostShimmer = () => {
  return (
    <div className="flex flex-col gap-y-4 p-6 pb-5">
      <div className="flex items-start space-x-3">
        <div>
          <Skeleton className="size-11 rounded-full" />
        </div>
        <div className="w-full space-y-4">
          <div className="item flex justify-between">
            <div className="flex flex-col gap-y-2">
              <div className="item flex space-x-3 pt-1">
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-4 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-12 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-6 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-10/12 rounded-lg" />
          <Skeleton className="h-4 w-2/3 rounded-lg" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-8 pt-1">
            <Skeleton className="size-5 rounded-lg" />
            <Skeleton className="size-5 rounded-lg" />
            <Skeleton className="size-5 rounded-lg" />
            <Skeleton className="size-5 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PostShimmer);
