import getAvatar from "@palus/helpers/getAvatar";
import { Image } from "@/components/Shared/UI";
import { defineEditorExtension } from "@/helpers/prosekit/extension";
import { htmlFromMarkdown } from "@/helpers/prosekit/markdown";
import useContentChange from "@/hooks/prosekit/useContentChange";
import useFocus from "@/hooks/prosekit/useFocus";
import { usePaste } from "@/hooks/prosekit/usePaste";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import "prosekit/basic/style.css";
import { createEditor } from "prosekit/core";
import { ProseKit } from "prosekit/react";
import { useEffect, useMemo, useRef } from "react";
import GroupSelector from "@/components/Composer/GroupSelector";
import cn from "@/helpers/cn";
import { usePostAttachmentStore } from "@/store/non-persisted/post/usePostAttachmentStore";
import { useEditorHandle } from "./EditorHandle";
import EditorMenus from "./EditorMenus";

interface EditorProps {
  isComment: boolean;
  isQuote?: boolean;
  isEditing?: boolean;
  feed?: string;
  selectedFeed: string;
  setSelectedFeed: (feed: string) => void;
  isInModal?: boolean;
  zeroPadding?: boolean;
}

const Editor = ({
  isComment,
  isQuote,
  isEditing,
  feed,
  selectedFeed,
  setSelectedFeed,
  isInModal,
  zeroPadding
}: EditorProps) => {
  const { currentAccount } = useAccountStore();
  const { postContent } = usePostStore();
  const { attachments } = usePostAttachmentStore();
  const defaultMarkdownRef = useRef(postContent);

  const defaultContent = useMemo(() => {
    const markdown = defaultMarkdownRef.current;
    return markdown ? htmlFromMarkdown(markdown) : undefined;
  }, []);

  const editor = useMemo(() => {
    const extension = defineEditorExtension();
    return createEditor({ defaultContent, extension });
  }, [defaultContent]);

  useFocus(editor, isComment && !isInModal);
  useContentChange(editor);
  usePaste(editor);
  useEditorHandle(editor);

  useEffect(() => {
    const handleResize = () => {
      if (editor.view && editor.view.hasFocus()) {
        editor.view.dispatch(editor.view.state.tr.scrollIntoView());
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [editor]);

  return (
    <ProseKit editor={editor}>
      <div
        className={cn(
          "box-border flex w-full justify-stretch overflow-x-hidden px-3 md:px-5",
          {
            "h-full pb-4": isInModal && !isQuote && attachments.length === 0,
            "pb-4": isEditing,
            "py-4": !zeroPadding
          }
        )}
      >
        <Image
          alt={currentAccount?.address}
          className="mr-3 size-11 rounded-full border border-gray-200 bg-gray-200 dark:border-gray-800"
          src={getAvatar(currentAccount)}
        />
        <div className="flex flex-1 flex-col overflow-x-hidden">
          {isComment || feed || isQuote || isEditing ? null : (
            <GroupSelector onChange={setSelectedFeed} selected={selectedFeed} />
          )}
          <EditorMenus />
          <div
            className={cn(
              "relative mt-1 box-border min-h-20 flex-1 leading-6 outline-0 sm:leading-[26px]",
              {
                "h-full": !isQuote && attachments.length === 0
              }
            )}
            ref={editor.mount}
          />
        </div>
      </div>
    </ProseKit>
  );
};

export default Editor;
