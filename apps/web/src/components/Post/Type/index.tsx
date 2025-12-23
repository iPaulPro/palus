import type { AnyPostFragment } from "@palus/indexer";
import stopEventPropagation from "@/helpers/stopEventPropagation";
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

  return (
    <span onClick={stopEventPropagation}>
      {type === "Post" && post.root && post.root.id !== post.commentOn?.id ? (
        <Root root={post.root} />
      ) : null}
      {type === "Repost" ? <Reposted account={post.author} /> : null}
      {type === "Post" && post.commentOn ? (
        <Commented commentOn={post.commentOn} />
      ) : null}
    </span>
  );
};

export default PostType;
