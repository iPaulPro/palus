import type { AnyPostFragment } from "@palus/indexer";
import Commented from "./Commented";
import Reposted from "./Reposted";
import Root from "./Root";

interface PostTypeProps {
  post: AnyPostFragment;
  showType: boolean;
}

const PostType = ({ post, showType }: PostTypeProps) => {
  const type = post.__typename;

  if (!showType) {
    return null;
  }

  if (type === "Post" && post.root && post.root.id !== post.commentOn?.id) {
    return <Root root={post.root} />;
  }

  if (type === "Repost") {
    return <Reposted account={post.author} />;
  }

  if (type === "Post" && post.commentOn) {
    return <Commented commentOn={post.commentOn} />;
  }

  return null;
};

export default PostType;
