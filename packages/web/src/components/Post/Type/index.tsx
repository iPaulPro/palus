import type { AnyPostFragment } from "@palus/indexer";
import { isRepost } from "@/helpers/postHelpers";
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
  const targetPost = isRepost(post) ? post?.repostOf : post;

  if (!showType) {
    return null;
  }

  return (
    <span onClick={stopEventPropagation}>
      {type === "Post" && post.root && post.root.id !== post.commentOn?.id ? (
        <Root root={post.root} />
      ) : null}
      {type === "Repost" ? <Reposted account={post.author} /> : null}
      {targetPost.commentOn ? (
        <Commented commentOn={targetPost.commentOn} />
      ) : null}
    </span>
  );
};

export default PostType;
