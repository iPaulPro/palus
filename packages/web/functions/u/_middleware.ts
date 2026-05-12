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
  const url = new URL(context.request.url);

  const pathname = url.pathname;
  const match = pathname.match(/^\/u\/([^.]+)$/);

  if (!match) {
    return context.next();
  }

  const response = await context.next();

  try {
    const bot = isBot(context);
    if (!bot) return response;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return response;

    const username = match[1];
    const meta = await fetchMetaForRoute(username);
    if (!meta) return response;

    const body = await replaceMetaTags(url, response, meta);

    return new Response(body, {
      headers: response.headers,
      status: response.status
    });
  } catch {
    return response;
  }
};

async function fetchMetaForRoute(username: string): Promise<Metadata> {
  const defaultMeta = {
    cardType: "summary",
    description: "Palus is a Web3 social app built with Lens",
    image: "https://palus.app/apple-touch-icon.png",
    title: "Account on Palus"
  } satisfies Metadata;

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
      cardType: defaultMeta.cardType,
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
