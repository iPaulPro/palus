import injectReferrerToUrl from "@/helpers/injectReferrerToUrl";

export const getExternalLink = (url: string, replaceLinks: boolean) => {
  if (!replaceLinks) return injectReferrerToUrl(url);

  try {
    const parsedUrl = new URL(url);
    const { host, pathname } = parsedUrl;
    let localPath: string | null = null;

    switch (host) {
      case "orb.club":
      case "orb.ac":
        if (pathname.startsWith("/p/")) {
          localPath = pathname.replace("/p/", "/posts/");
        } else if (pathname.startsWith("/post/")) {
          localPath = pathname.replace("/post/", "/posts/");
        }
        break;
      case "app.soclly.com":
        if (pathname.startsWith("/posts/") || pathname.startsWith("/u/")) {
          localPath = pathname;
        } else if (pathname.startsWith("/group/")) {
          localPath = pathname.replace("/group/", "/g/");
        }
        break;
      case "hey.xyz":
      case "lenster.xyz":
        if (
          pathname.startsWith("/posts/") ||
          pathname.startsWith("/u/") ||
          pathname.startsWith("/g/")
        ) {
          localPath = pathname;
        }
        break;
      case "firefly.social":
        if (pathname.startsWith("/post/lens/")) {
          localPath = pathname.replace("/post/lens/", "/posts/");
        }
        break;
    }

    if (localPath) {
      return injectReferrerToUrl(location.origin + localPath);
    }
  } catch {
    // Invalid URL, fallback to prop
  }
  return injectReferrerToUrl(url);
};
