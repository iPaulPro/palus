import { defineEditorExtension } from "@/helpers/prosekit/extension";
import { htmlFromMarkdown } from "@/helpers/prosekit/markdown";
import useContentChange from "@/hooks/prosekit/useContentChange";
import useFocus from "@/hooks/prosekit/useFocus";
import { usePaste } from "@/hooks/prosekit/usePaste";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import "prosekit/basic/style.css";
import type { GroupFragment } from "@palus/indexer";
import { createEditor } from "prosekit/core";
import { ProseKit } from "prosekit/react";
import { useEffect, useMemo, useRef } from "react";
import GroupSelector from "@/components/Composer/GroupSelector";
import cn from "@/helpers/cn";
import { useEditorHandle } from "./EditorHandle";
import EditorMenus from "./EditorMenus";

interface EditorProps {
  isComment: boolean;
  isQuote?: boolean;
  isEditing?: boolean;
  group?: GroupFragment;
  selectedGroup: GroupFragment | undefined;
  setSelectedGroup: (group: GroupFragment | undefined) => void;
  isInModal?: boolean;
  fullHeight?: boolean;
}

const Editor = ({
  isComment,
  isQuote,
  isEditing,
  group,
  selectedGroup,
  setSelectedGroup,
  isInModal,
  fullHeight
}: EditorProps) => {
  const { postContent } = usePostStore();
  const defaultMarkdownRef = useRef(postContent);

  const defaultContent = useMemo(() => {
    const markdown = defaultMarkdownRef.current;
    return markdown ? htmlFromMarkdown(markdown) : undefined;
  }, []);

  const editor = useMemo(() => {
    const extension = defineEditorExtension(
      isComment ? "What's your response?" : undefined
    );
    return createEditor({ defaultContent, extension });
  }, [defaultContent]);

  useFocus(editor, isComment && !isInModal);
  useContentChange(editor);
  usePaste(editor);
  useEditorHandle(editor);

  useEffect(() => {
    const handleResize = () => {
      if (editor.view?.hasFocus()) {
        editor.view.dispatch(editor.view.state.tr.scrollIntoView());
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [editor]);

  const hideGroupSelector = isComment || group || isQuote || isEditing;

  return (
    <ProseKit editor={editor}>
      <div
        className={cn(
          "box-border flex w-full justify-stretch overflow-x-hidden px-4 md:px-5",
          {
            "h-full": fullHeight,
            "pt-4": !isInModal || (isInModal && isComment)
          }
        )}
      >
        <div className="flex flex-1 flex-col overflow-x-hidden">
          {hideGroupSelector ? null : (
            <GroupSelector
              onChange={setSelectedGroup}
              selected={selectedGroup}
            />
          )}
          <EditorMenus />
          <div
            className={cn(
              "ProseMirror relative box-border min-h-20 flex-1 leading-6 outline-0 sm:leading-[26px]",
              {
                "h-full": fullHeight,
                "mt-3": hideGroupSelector
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
