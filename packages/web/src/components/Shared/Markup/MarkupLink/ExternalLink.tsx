import { useMemo } from "react";
import { Link } from "react-router";
import injectReferrerToUrl from "@/helpers/injectReferrerToUrl";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import truncateUrl from "@/helpers/truncateUrl";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";
import type { MarkupLinkProps } from "@/types/misc";

const ExternalLink = ({ title }: MarkupLinkProps) => {
  const { replaceLensLinks } = usePreferencesStore();

  let href = title;

  const url = useMemo(() => {
    if (!href) {
      return null;
    }

    if (replaceLensLinks) {
      try {
        const parsedUrl = new URL(href);
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
            localPath = pathname;
            break;
          case "firefly.social":
            if (pathname.startsWith("/post/lens/")) {
              localPath = pathname.replace("/post/lens/", "/posts/");
            }
            break;
        }

        if (localPath) {
          href = location.origin + localPath;
        }
      } catch {
        // Invalid URL, fallback to original href
      }
    }

    return injectReferrerToUrl(href);
  }, [href, replaceLensLinks]);

  if (!url) return null;

  return (
    <Link
      onClick={stopEventPropagation}
      rel="noopener"
      target={url.includes(location.host) ? "_self" : "_blank"}
      to={url}
    >
      {title ? truncateUrl(title, 30) : title}
    </Link>
  );
};

export default ExternalLink;
