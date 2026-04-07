import type { Editor } from "prosekit/core";
import { createEditor } from "prosekit/core";
import { ProseKit, useDocChange } from "prosekit/react";
import "prosekit/basic/style.css";
import { useCallback, useMemo, useRef } from "react";
import EditorMenus from "@/components/Composer/Editor/EditorMenus";
import { FieldError } from "@/components/Shared/UI/Form";
import type { EditorExtension } from "@/helpers/prosekit/extension";
import { defineEditorExtension } from "@/helpers/prosekit/extension";
import { htmlFromMarkdown } from "@/helpers/prosekit/markdown";
import { getMarkdownContent } from "@/helpers/prosekit/markdownContent";

interface Props {
  content?: string;
  label?: string;
  name?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

interface BioEditorInnerProps {
  editor: Editor<EditorExtension>;
  onChange?: (value: string) => void;
}

const BioEditorInner = ({ editor, onChange }: BioEditorInnerProps) => {
  const handleDocChange = useCallback(() => {
    const markdown = getMarkdownContent(editor);
    onChange?.(markdown);
  }, [editor, onChange]);

  useDocChange(handleDocChange, { editor });

  return (
    <>
      <EditorMenus />
      <div
        className="ProseMirror relative min-h-16 w-full flex-1 rounded-xl border border-border bg-white px-4 py-2 leading-6 shadow-xs outline-0 focus:border-gray-500 focus:ring-0 disabled:bg-gray-500/20 disabled:opacity-60 sm:leading-[26px] dark:bg-gray-900"
        ref={editor.mount}
      />
    </>
  );
};

const MarkdownEditor = ({
  content,
  label,
  name,
  onChange,
  placeholder
}: Props) => {
  const defaultMarkdownRef = useRef(content);

  const defaultContent = useMemo(() => {
    const markdown = defaultMarkdownRef.current;
    return markdown ? htmlFromMarkdown(markdown) : undefined;
  }, []);

  const editor = useMemo(() => {
    const extension = defineEditorExtension(placeholder);
    return createEditor({ defaultContent, extension });
  }, [defaultContent, placeholder]);

  return (
    <div className="space-y-1.5">
      {label ? <div className="label">{label}</div> : null}
      <ProseKit editor={editor}>
        <BioEditorInner editor={editor} onChange={onChange} />
      </ProseKit>
      {name ? <FieldError name={name} /> : null}
    </div>
  );
};

export default MarkdownEditor;
