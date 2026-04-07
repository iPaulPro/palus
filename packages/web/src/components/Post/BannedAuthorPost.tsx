import { memo } from "react";
import { Card } from "@/components/Shared/UI";

const BannedAuthorPost = () => {
  return (
    <Card className="!bg-gray-100 dark:!bg-gray-800 mt-2" forceRounded>
      <div className="px-4 py-3 text-sm">Author of this post is banned</div>
    </Card>
  );
};

export default memo(BannedAuthorPost);
