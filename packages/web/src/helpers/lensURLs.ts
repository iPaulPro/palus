export const isLensPostLink = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    const { host, pathname } = parsedUrl;

    switch (host) {
      case "orb.club":
      case "orb.ac":
        return pathname.startsWith("/p/") || pathname.startsWith("/post/");
      case "palus.app":
      case "app.soclly.com":
      case "hey.xyz":
      case "lenster.xyz":
        return pathname.startsWith("/posts/");
      default:
        return false;
    }
  } catch {}
  return false;
};

/**
 * Extracts the post ID from a Lens URL. Works with Palus, Orb, Soclly, Hey, and Lenster links.
 *
 * eg: https://palus.app/posts/19ff2r8bxqwn2pm9yp9 => 19ff2r8bxqwn2pm9yp9
 * eg: https://orb.club/p/19ff2r8bxqwn2pm9yp9 => 19ff2r8bxqwn2pm9yp9
 * eg: https://app.soclly.com/posts/19ff2r8bxqwn2pm9yp9 => 19ff2r8bxqwn2pm9yp9
 * eg: https://hey.xyz/posts/19ff2r8bxqwn2pm9yp9 => 19ff2r8bxqwn2pm9yp9
 * eg: https://lenster.xyz/posts/19ff2r8bxqwn2pm9yp9 => 19ff2r8bxqwn2pm9yp9
 *
 * @param url
 */
export const getPostIdFromLensUrl = (url: string): string | null => {
  if (!isLensPostLink(url)) {
    return null;
  }
  try {
    const parsedUrl = new URL(url);
    const { pathname } = parsedUrl;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
      return null;
    }
    return segments[1];
  } catch {
    return null;
  }
};
