import type {
  AccountMentionFragment,
  PostMentionFragment
} from "@palus/indexer";
import { Regex } from "@/data/regex";

const getMentions = (text: string): PostMentionFragment[] => {
  if (!text) return [];

  const mentions = text.match(Regex.accountMention) ?? [];

  return mentions.map((mention) => {
    const handle = mention
      .substring(mention.lastIndexOf("/") + 1)
      .toLowerCase();

    return {
      __typename: "AccountMention",
      account: "",
      namespace: "",
      replace: { __typename: "MentionReplace", from: handle, to: handle }
    } as AccountMentionFragment;
  });
};

export default getMentions;
