import {
  GroupDocument,
  type GroupQuery,
  type GroupQueryVariables
} from "@palus/indexer";
import { isBot } from "../helpers/isBot";
import { replaceMetaTags } from "../helpers/replaceMetaTags";
import { sanitizeDStorageUrl } from "../helpers/sanitizeDStorageUrl";
import { lensQuery } from "../lens-api";
import type { Metadata } from "../types";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  const pathname = url.pathname;
  const match = pathname.match(/^\/g\/([^.]+)$/);

  if (!match) {
    return context.next();
  }

  const response = await context.next();

  try {
    const bot = isBot(context);
    if (!bot) return response;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return response;

    const address = match[1];
    const meta = await fetchMetaForRoute(address);
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

async function fetchMetaForRoute(address: string): Promise<Metadata> {
  const defaultMeta = {
    cardType: "summary",
    description: "Palus is a Web3 social app built with Lens",
    image: "https://palus.app/images/default.webp",
    title: "Group on Palus"
  } satisfies Metadata;

  try {
    const data = await lensQuery<GroupQuery, GroupQueryVariables>(
      GroupDocument,
      {
        request: { group: address }
      }
    );

    const group = data?.group;
    if (!group) return defaultMeta;

    const name = group.metadata?.name;
    const title = name ? `${name} group on Palus` : "Group on Palus";

    return {
      cardType: defaultMeta.cardType,
      description:
        group.metadata?.description?.slice(0, 160) ?? defaultMeta.description,
      image: sanitizeDStorageUrl(group.metadata?.icon) ?? defaultMeta.image,
      title
    };
  } catch {
    return defaultMeta;
  }
}
