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
import { useMemo, useRef } from "react";
import GroupSelector from "@/components/Composer/GroupSelector";
import cn from "@/helpers/cn";
import { useEditorHandle } from "./EditorHandle";
import EditorMenus from "./EditorMenus";

interface EditorProps {
  isComment: boolean;
  isQuote?: boolean;
  isEditing?: boolean;
  feed?: string;
  selectedFeed: string;
  setSelectedFeed: (feed: string) => void;
  zeroPadding?: boolean;
}

const Editor = ({
  isComment,
  isQuote,
  isEditing,
  feed,
  selectedFeed,
  setSelectedFeed,
  zeroPadding
}: EditorProps) => {
  const { currentAccount } = useAccountStore();
  const { postContent } = usePostStore();
  const defaultMarkdownRef = useRef(postContent);

  const defaultContent = useMemo(() => {
    const markdown = defaultMarkdownRef.current;
    return markdown ? htmlFromMarkdown(markdown) : undefined;
  }, []);

  const editor = useMemo(() => {
    const extension = defineEditorExtension();
    return createEditor({ defaultContent, extension });
  }, [defaultContent]);

  useFocus(editor, isComment);
  useContentChange(editor);
  usePaste(editor);
  useEditorHandle(editor);

  return (
    <ProseKit editor={editor}>
      <div
        className={cn(
          "box-border flex size-full justify-stretch overflow-y-auto overflow-x-hidden px-3 md:px-5",
          {
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
            className="relative mt-1 box-border h-full min-h-[80px] flex-1 overflow-auto leading-6 outline-0 sm:leading-[26px]"
            ref={editor.mount}
          />
        </div>
      </div>
    </ProseKit>
  );
};

export default Editor;
