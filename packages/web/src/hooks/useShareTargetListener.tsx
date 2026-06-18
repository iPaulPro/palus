import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const useShareTargetListener = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setShow: setShowNewPostModal } = useNewPostModalStore();
  const { setPostContent, setSharingLink } = usePostStore();
  const { currentAccount } = useAccountStore();

  useEffect(() => {
    if (!currentAccount) return;

    if (searchParams.has("text")) {
      const text = searchParams.get("text");
      const url = searchParams.get("url");
      if (url) setSharingLink(url.startsWith("http") ? url : `https://${url}`);
      if (text) setPostContent(text);
      setShowNewPostModal(true);
      setSearchParams();
    }
  }, [searchParams, currentAccount]);
};

export default useShareTargetListener;
