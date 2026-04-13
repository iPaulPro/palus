import { memo } from "react";
import { Card } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import PostShimmer from "./PostShimmer";

interface PostsShimmerProps {
  hideCard?: boolean;
}

const PostsShimmer = ({ hideCard = false }: PostsShimmerProps) => {
  return Array.from({ length: 3 }).map((_, index) => (
    <Card className={cn({ "!border-0": hideCard })} key={index}>
      <PostShimmer />
    </Card>
  ));
};

export default memo(PostsShimmer);
