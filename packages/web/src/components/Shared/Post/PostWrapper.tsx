import type { AnyPostFragment } from "@palus/indexer";
import type { ReactNode } from "react";
import { memo, useRef } from "react";
import { isMacOs } from "react-device-detect";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { useNavigate } from "react-router";
import { usePostLinkStore } from "@/store/non-persisted/navigation/usePostLinkStore";

interface PostWrapperProps {
  children: ReactNode | ReactNode[];
  className?: string;
  post: AnyPostFragment;
  disableClick?: boolean;
}

const PostWrapper = ({
  children,
  className = "",
  post,
  disableClick
}: PostWrapperProps) => {
  const navigate = useNavigate();
  const { setCachedPost } = usePostLinkStore();
  const rootRef = useRef<HTMLElement>(null);

  const handleClick = () => {
    if (disableClick) return;
    const selection = window.getSelection();
    if (!selection?.toString().length) {
      if (isHotkeyPressed(isMacOs ? "meta" : "ctrl")) {
        const url = `${window.location.origin}/posts/${post.slug}`;
        window.open(url, "_blank");
      } else {
        setCachedPost(post);
        navigate(`/posts/${post.slug}`);
      }
    }
  };

  return (
    <article className={className} onClick={handleClick} ref={rootRef}>
      {children}
    </article>
  );
};

export default memo(PostWrapper);
