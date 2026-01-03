import type { PostFragment } from "@palus/indexer";
import ThreadBody from "@/components/Post/ThreadBody";

interface RootProps {
  root: PostFragment;
}

const Root = ({ root }: RootProps) => {
  return <ThreadBody isRoot post={root} />;
};

export default Root;
