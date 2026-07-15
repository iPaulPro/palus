import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useNewPostModalStore } from "@/store/non-persisted/modal/useNewPostModalStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const useShareTargetListener = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { open: openNewPostModal } = useNewPostModalStore();
  const { currentAccount } = useAccountStore();

  useEffect(() => {
    if (!currentAccount) return;

    if (searchParams.has("text")) {
      const text = searchParams.get("text");
      const url = searchParams.get("url");
      openNewPostModal({
        postContent: text ?? "",
        sharingLink: url
          ? url.startsWith("http")
            ? url
            : `https://${url}`
          : undefined
      });
      setSearchParams();
    }
  }, [searchParams, currentAccount, openNewPostModal, setSearchParams]);
};

export default useShareTargetListener;
