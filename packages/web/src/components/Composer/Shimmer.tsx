import Skeleton from "@/components/Shared/Skeleton";

const Shimmer = () => {
  return (
    <div className="flex h-40 w-full flex-col border border-border bg-white md:rounded-xl dark:bg-gray-900">
      <div className="flex flex-1 gap-x-3 px-3 pt-4 md:px-5">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="mt-2 h-4 w-24 rounded-full" />
      </div>
      <div className="h-[59px] flex-none items-center border-border border-t px-5 py-3 sm:flex">
        <div className="flex w-full items-center space-x-5">
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="size-5 rounded-full" />
        </div>
        <div className="flex flex-none items-center gap-x-4">
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Shimmer;
