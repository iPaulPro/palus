import type { MarkupLinkProps } from "@palus/types/misc";
import ExternalLink from "./ExternalLink";
import Mention from "./Mention";

const MarkupLink = ({ mentions, title }: MarkupLinkProps) => {
  if (!title) {
    return null;
  }

  if (title.startsWith("@") || title.startsWith("#")) {
    return <Mention mentions={mentions} title={title} />;
  }

  return <ExternalLink title={title} />;
};

export default MarkupLink;
