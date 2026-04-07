import Skeleton from "@/components/Shared/Skeleton";

const TokensShimmer = () => {
  return Array.from({ length: 2 }).map((_, index) => (
    <div
      className="flex items-center justify-between px-5 py-2 sm:px-0"
      key={index}
    >
      <div className="flex items-center gap-x-2">
        <Skeleton className="size-7 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="flex items-center gap-x-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>
    </div>
  ));
};

export default TokensShimmer;
