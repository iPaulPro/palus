import Skeleton from "@/components/Shared/Skeleton";

const ActivityShimmer = () => {
  return Array.from({ length: 4 }).map((_, index) => (
    <div className="flex items-center justify-between p-2" key={index}>
      <div className="flex items-center gap-x-2">
        <Skeleton className="size-7 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="mt-1 h-3 w-16 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col items-end">
        <Skeleton className="h-3 w-8 rounded-md" />
        <Skeleton className="mt-1 h-4 w-16 rounded-md" />
      </div>
    </div>
  ));
};

export default ActivityShimmer;
