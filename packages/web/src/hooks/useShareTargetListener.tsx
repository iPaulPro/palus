import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";

const useShareTargetListener = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setShow: setShowNewPostModal } = useNewPostModalStore();
  const { setPostContent } = usePostStore();

  useEffect(() => {
    if (searchParams.has("text")) {
      const text = searchParams.get("text");
      const url = searchParams.get("url");
      const content = `${text}${url ? `\n\n${url}` : ""}`;
      setShowNewPostModal(true);
      setPostContent(content);
      setSearchParams();
    }
  }, [searchParams]);
};

export default useShareTargetListener;
