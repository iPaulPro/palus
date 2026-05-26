import type { PostMentionFragment } from "@palus/indexer";
import type { Ref } from "react";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import linkifyRegex from "remark-linkify-regex";
import stripMarkdown from "strip-markdown";
import type { PluggableList } from "unified";
import { Regex } from "@/data/regex";
import trimify from "@/helpers/trimify";
import MarkupLink from "./MarkupLink";

const plugins: PluggableList = [
  remarkBreaks,
  remarkGfm,
  linkifyRegex(Regex.url),
  linkifyRegex(Regex.accountMention),
  linkifyRegex(Regex.groupMention)
];

interface MarkupProps {
  children: string;
  className?: string;
  mentions?: PostMentionFragment[];
  strip?: boolean;
  ref?: Ref<HTMLSpanElement>;
}

const EMPTY_ITEMS: PostMentionFragment[] = [];

const Markup = ({
  children,
  className = "",
  mentions = EMPTY_ITEMS,
  strip = true,
  ref
}: MarkupProps) => {
  if (!children) {
    return null;
  }

  const components = {
    a: (props: any) => <MarkupLink mentions={mentions} title={props.title} />
  };

  const allPlugins = strip
    ? ([
        [
          stripMarkdown,
          {
            keep: ["strong", "emphasis", "list", "listItem", "delete"]
          }
        ],
        ...plugins
      ] as PluggableList)
    : plugins;

  return (
    <span className={className} ref={ref}>
      <ReactMarkdown components={components} remarkPlugins={allPlugins}>
        {trimify(children)}
      </ReactMarkdown>
    </span>
  );
};

Markup.displayName = "Markup";

export default memo(Markup);
