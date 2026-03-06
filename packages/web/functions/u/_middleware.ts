import {
  AccountDocument,
  type AccountQuery,
  type AccountQueryVariables
} from "@palus/indexer";
import { isBot } from "../helpers/isBot";
import { replaceMetaTags } from "../helpers/replaceMetaTags";
import { sanitizeDStorageUrl } from "../helpers/sanitizeDStorageUrl";
import { lensQuery } from "../lens-api";
import type { Metadata } from "../types";

export const onRequest: PagesFunction = async (context) => {
  const bot = isBot(context);
  const response = await context.next();

  // Only rewrite HTML for bot requests
  if (!bot) return response;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const url = new URL(context.request.url);
  const meta = await fetchMetaForRoute(url.pathname);
  if (!meta) return response;

  const body = await replaceMetaTags(url, response, meta, "summary");

  return new Response(body, {
    headers: {
      ...Object.fromEntries(response.headers),
      "content-type": "text/html;charset=utf-8"
    },
    status: response.status
  });
};

async function fetchMetaForRoute(pathname: string): Promise<Metadata> {
  const defaultMeta = {
    description: "Palus is a Web3 social app built with Lens",
    image: "https://palus.app/images/apple-touch-icon.png",
    title: "Account on Palus"
  };

  const match = pathname.match(/^\/u\/(.+)$/);
  if (!match) return defaultMeta;

  const username = match[1];

  try {
    const data = await lensQuery<AccountQuery, AccountQueryVariables>(
      AccountDocument,
      {
        request: { username: { localName: username } }
      }
    );

    const account = data?.account;
    if (!account) return defaultMeta;

    const name = account.metadata?.name;
    const title = name
      ? `${name} (@${username}) on Palus`
      : `@${username} on Palus`;

    return {
      description:
        account.metadata?.bio?.slice(0, 160) ?? defaultMeta.description,
      image:
        sanitizeDStorageUrl(account.metadata?.picture) ?? defaultMeta.image,
      title
    };
  } catch {
    return defaultMeta;
  }
}
