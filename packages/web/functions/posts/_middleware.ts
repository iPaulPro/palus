import {
  PostDocument,
  type PostMetadataFragment,
  type PostQuery,
  type PostQueryVariables
} from "@palus/indexer";
import { isBot } from "../helpers/isBot";
import { replaceMetaTags } from "../helpers/replaceMetaTags";
import { lensQuery } from "../lens-api";
import type { Metadata } from "../types";
import getPostData from "./getPostData";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  const pathname = url.pathname;
  const match = pathname.match(/^\/posts\/([^.]+)$/);

  if (!match) {
    return context.next();
  }

  const response = await context.next();

  try {
    const bot = isBot(context);
    if (!bot) return response;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return response;

    const postId = match[1];
    const meta = await fetchMetaForRoute(postId);
    if (!meta) return response;

    const body = await replaceMetaTags(
      url,
      response,
      meta,
      "summary_large_image"
    );

    return new Response(body, {
      headers: response.headers,
      status: response.status
    });
  } catch {
    return response;
  }
};

async function fetchMetaForRoute(postId: string): Promise<Metadata> {
  const defaultMeta = {
    description: "Palus is a Web3 social app built with Lens",
    image: "https://palus.app/images/og/cover.webp",
    title: "Palus"
  };

  try {
    const data = await lensQuery<PostQuery, PostQueryVariables>(PostDocument, {
      request: { post: postId }
    });

    const post = data?.post;
    if (!post) return defaultMeta;

    let metadata: PostMetadataFragment | undefined;
    if (post.__typename === "Repost") {
      metadata = post.repostOf.metadata;
    } else if (post.__typename === "Post") {
      metadata = post.metadata;
    }
    if (!metadata) return defaultMeta;

    const postData = getPostData(metadata);
    const authorName = post.author.username
      ? `@${post.author.username.localName}`
      : formatAddress(post.author.address);

    return {
      description: postData?.content?.slice(0, 160) ?? defaultMeta.description,
      image: postData?.image ?? defaultMeta.image,
      title: `Post by ${authorName}`
    };
  } catch {
    return defaultMeta;
  }
}

const formatAddress = (address: string, sliceSize = 4): string => {
  const start = address.slice(0, sliceSize);
  const end = address.slice(address.length - sliceSize);
  return `${start}…${end}`;
};
