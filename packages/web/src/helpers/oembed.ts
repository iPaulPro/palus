import { decode } from "html-entities";
import type { Oembed } from "@/types/oembed";

const X_OEMBED_URL = "https://publish.x.com/oembed?omit_script=true&url=";
const TIK_TOK_URL = "https://www.tiktok.com/oembed?url=";
const SPOTIFY_URL = "https://open.spotify.com/oembed?url=";

const fetchLinkPreview = async (url: string): Promise<Oembed | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const getMeta = (property: string): string | null =>
      doc
        .querySelector(`meta[property="${property}"]`)
        ?.getAttribute("content") ??
      doc.querySelector(`meta[name="${property}"]`)?.getAttribute("content") ??
      null;

    const { hostname } = new URL(url);
    const title = getMeta("og:title") ?? decode(doc.title) ?? null;
    const thumbnailUrl = getMeta("og:image");
    const providerName = getMeta("og:site_name") ?? hostname ?? null;

    if (!title && !thumbnailUrl) {
      return null;
    }

    const iconHref = doc
      .querySelector('link[rel="icon"]')
      ?.getAttribute("href");
    const faviconUrl = iconHref
      ? new URL(iconHref, url).href
      : `https://${hostname}/favicon.ico`;

    return {
      favicon_url: faviconUrl,
      ...(providerName && { provider_name: providerName }),
      ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
      ...(title && { title }),
      type: "link",
      version: "1.0"
    };
  } catch {
    // Direct fetch failed (likely CORS) — fall back to server-side proxy
    return fetchLinkPreviewViaProxy(url);
  }
};

const fetchLinkPreviewViaProxy = async (
  url: string
): Promise<Oembed | null> => {
  try {
    const response = await fetch(`/oembed?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Oembed;
  } catch {
    return null;
  }
};

export const getOembed = async (
  url: string,
  isSmallDevice?: boolean
): Promise<Oembed | null> => {
  const youtubeEmbedUrl = `https://www.youtube.com/oembed?maxwidth=${isSmallDevice ? "360" : "420"}&format=json&url=`;

  let oembedUrl: string | null = null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (hostname === "palus.app") {
      return fetchLinkPreviewViaProxy(url);
    }

    if (hostname.startsWith("youtube.com") || hostname.startsWith("youtu.be")) {
      oembedUrl = `${youtubeEmbedUrl}${url}`;
    } else if (
      hostname.startsWith("twitter.com") ||
      hostname.startsWith("x.com")
    ) {
      oembedUrl = `${X_OEMBED_URL}${url}`;
    } else if (
      hostname.startsWith("tiktok.com") ||
      hostname.startsWith("www.tiktok.com")
    ) {
      oembedUrl = `${TIK_TOK_URL}${url}`;
    } else if (
      hostname.startsWith("spotify.com") ||
      hostname.startsWith("open.spotify.com")
    ) {
      oembedUrl = `${SPOTIFY_URL}${url}`;
    }
  } catch {
    return null;
  }

  if (!oembedUrl) {
    return fetchLinkPreview(url);
  }

  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Oembed;
  } catch {
    return null;
  }
};
