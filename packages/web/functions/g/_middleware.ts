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
  const response = await context.next();

  try {
    const bot = isBot(context);
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
  } catch {
    return response;
  }
};

async function fetchMetaForRoute(pathname: string): Promise<Metadata> {
  const defaultMeta = {
    description: "Palus is a Web3 social app built with Lens",
    image: "https://palus.app/images/apple-touch-icon.png",
    title: "Group on Palus"
  };

  const match = pathname.match(/^\/g\/(.+)$/);
  if (!match) return defaultMeta;

  const address = match[1];

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
      description:
        group.metadata?.description?.slice(0, 160) ?? defaultMeta.description,
      image: sanitizeDStorageUrl(group.metadata?.icon) ?? defaultMeta.image,
      title
    };
  } catch {
    return defaultMeta;
  }
}
