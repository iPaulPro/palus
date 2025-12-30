import type { MarkupLinkProps } from "@palus/types/misc";
import { Link } from "react-router";
import injectReferrerToUrl from "@/helpers/injectReferrerToUrl";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import truncateUrl from "@/helpers/truncateUrl";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

const ExternalLink = ({ title }: MarkupLinkProps) => {
  const { replaceLensLinks } = usePreferencesStore();

  let href = title;

  if (!href) {
    return null;
  }

  if (!href.includes("://")) {
    href = `https://${href}`;
  }

  if (replaceLensLinks) {
    try {
      const url = new URL(href);
      if (url.host === "orb.club") {
        href = location.origin + url.pathname.replace("p", "posts");
      } else if (url.host === "app.soclly.com") {
        href = location.origin + url.pathname;
      }
    } catch {}
  }

  const url = injectReferrerToUrl(href);

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
