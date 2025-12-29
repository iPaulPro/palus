import type { Oembed } from "@/types/oembed";

const X_OEMBED_URL = "https://publish.twitter.com/oembed?omit_script=true&url=";
const TIK_TOK_URL = "https://www.tiktok.com/oembed?url=";
const SPOTIFY_URL = "https://open.spotify.com/oembed?url=";

export const getOembed = async (
  url: string,
  isSmallDevice?: boolean
): Promise<Oembed | null> => {
  const youtubeEmbedUrl = `https://www.youtube.com/oembed?maxwidth=${isSmallDevice ? "300" : "420"}&format=json&url=`;

  let oembedUrl: string | null = null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      oembedUrl = `${youtubeEmbedUrl}${url}`;
    } else if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      oembedUrl = `${X_OEMBED_URL}${url}`;
    } else if (hostname.includes("tiktok.com")) {
      oembedUrl = `${TIK_TOK_URL}${url}`;
    } else if (hostname.includes("spotify.com")) {
      oembedUrl = `${SPOTIFY_URL}${url}`;
    }
  } catch {
    return null;
  }

  if (!oembedUrl) {
    return null;
  }

  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      return null;
    }
    const data: Oembed = await response.json();
    return data;
  } catch {
    return null;
  }
};
