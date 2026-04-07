import type { PostMentionFragment } from "@palus/indexer";
import { Link } from "react-router";
import AccountPreview from "@/components/Shared/Account/AccountPreview";
import GroupPreview from "@/components/Shared/Group/GroupPreview";
import Slug from "@/components/Shared/Slug";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import type { MarkupLinkProps } from "@/types/misc";

const Mention = ({ mentions, title }: MarkupLinkProps) => {
  if (!title) {
    return null;
  }

  const mention: PostMentionFragment | undefined = mentions?.find(
    (m) => m.replace.from.toLowerCase() === title.toLowerCase()
  );

  if (!mention) {
    const formattedMention = title.slice(1).replace("lens/", "");
    return title.startsWith("@") ? (
      <Link
        className="outline-hidden focus:underline"
        onClick={stopEventPropagation}
        to={`/u/${formattedMention}`}
      >
        <AccountPreview username={formattedMention.replace("@", "")}>
          <Slug prefix="@" slug={formattedMention} useBrandColor />
        </AccountPreview>
      </Link>
    ) : (
      title
    );
  }

  const name =
    mention?.__typename === "GroupMention"
      ? mention.replace.to
      : mention?.replace.from.split("/")[1] || "";

  if (mention?.__typename === "AccountMention") {
    return (
      <Link
        className="outline-hidden focus:underline"
        onClick={stopEventPropagation}
        to={`/u/${name}`}
      >
        <AccountPreview address={mention.account} username={name}>
          <Slug prefix="@" slug={name} useBrandColor />
        </AccountPreview>
      </Link>
    );
  }

  return (
    <Link
      className="outline-hidden focus:underline"
      onClick={stopEventPropagation}
      to={`/g/${mention.replace.from.slice(1)}`}
    >
      <GroupPreview address={mention.replace.from.slice(1)} name={name}>
        <Slug slug={name} useBrandColor />
      </GroupPreview>
    </Link>
  );
};

export default Mention;
