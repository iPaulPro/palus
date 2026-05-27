import { useMemo } from "react";
import { Link } from "react-router";
import { getExternalLink } from "@/helpers/getExternalLink";
import stopEventPropagation from "@/helpers/stopEventPropagation";
import truncateUrl from "@/helpers/truncateUrl";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";
import type { MarkupLinkProps } from "@/types/misc";

const ExternalLink = ({ title }: MarkupLinkProps) => {
  const { replaceLensLinks } = usePreferencesStore();

  const url = useMemo(() => {
    if (!title) {
      return null;
    }
    return getExternalLink(title, replaceLensLinks);
  }, [title, replaceLensLinks]);

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
