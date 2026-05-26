import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { memo } from "react";
import { Link } from "react-router";
import Skeleton from "@/components/Shared/Skeleton";
import { Image } from "@/components/Shared/UI";
import useOembed from "@/hooks/useOembed";

interface OEmbedProps {
  url: string;
}

const OEmbed = ({ url }: OEmbedProps) => {
  const { data: oembed, isPending: isLoading } = useOembed(url);

  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;

  const isYouTube =
    hostname.startsWith("youtube.com") || hostname.startsWith("youtu.be");
  const isSpotify =
    hostname.startsWith("spotify.com") ||
    hostname.startsWith("open.spotify.com");
  const isTikTok =
    hostname.startsWith("tiktok.com") || hostname.startsWith("www.tiktok.com");
  const isTwitter =
    hostname.startsWith("twitter.com") || hostname.startsWith("x.com");

  if (isLoading) {
    return (
      <Skeleton
        className={`mt-4 w-full rounded-xl md:w-2/3 ${isSpotify || isTikTok || isYouTube ? "h-56" : "h-16"}`}
      />
    );
  }

  if (!oembed) {
    return (
      <Link to={url}>
        <div className="group mt-4 flex h-16 w-full min-w-0 items-center rounded-xl border border-border bg-accent md:w-2/3">
          <div className="flex h-full flex-none items-center border-border border-r px-4">
            <Image
              alt="Shared link"
              className="size-5 shrink-0"
              fallback="/images/link.svg"
              src={`https://${hostname}/favicon.ico`}
            />
          </div>
          <div className="truncate px-4 font-semibold text-on-surface group-hover:text-secondary">
            {url}
          </div>
          <ArrowTopRightOnSquareIcon className="mr-4 size-4 flex-none text-on-surface group-hover:text-secondary" />
        </div>
      </Link>
    );
  }

  if (isYouTube && oembed.html) {
    return (
      <div
        className="not-prose youtube mt-4 w-full"
        dangerouslySetInnerHTML={{ __html: oembed.html }}
      />
    );
  }

  if (isSpotify && oembed.html) {
    return (
      <div
        className="not-prose oembed-html mt-4 w-full md:w-4/5"
        dangerouslySetInnerHTML={{ __html: oembed.html }}
      />
    );
  }

  if (isTwitter && oembed.html) {
    return (
      <div
        className="not-prose tweet mt-4 flex min-h-16 w-full items-center rounded-xl md:w-2/3"
        dangerouslySetInnerHTML={{ __html: oembed.html }}
      />
    );
  }

  return (
    <a
      className="not-prose mt-4 flex w-full flex-col rounded-xl border border-gray-200 md:w-2/3 dark:border-gray-800"
      href={url}
      onClick={(e) => {
        e.stopPropagation();
      }}
      rel="noreferrer"
      target="_blank"
    >
      {oembed.thumbnail_url && (
        <img
          alt={oembed.title}
          className="max-h-40 w-full rounded-t-xl object-cover"
          src={oembed.thumbnail_url}
        />
      )}
      <div className="flex flex-col gap-y-1 bg-accent p-3">
        {oembed.title && (
          <span className="line-clamp-1 font-bold text-sm">{oembed.title}</span>
        )}
        {oembed.author_name && (
          <span className="text-gray-500 text-xs dark:text-gray-400">
            {oembed.author_name}
          </span>
        )}
        <div className="flex items-center space-x-1">
          {isSpotify ? (
            <img
              alt="Spotify icon"
              height={12}
              src="/images/ic_spotify.svg"
              width={12}
            />
          ) : isTikTok ? (
            <img
              alt="TikTok icon"
              height={12}
              src="/images/ic_tiktok.svg"
              width={12}
            />
          ) : oembed.favicon_url ? (
            <img
              alt={oembed.provider_name || "Favicon"}
              height={12}
              src={oembed.favicon_url}
              width={12}
            />
          ) : null}
          <span className="text-gray-500 text-xs dark:text-gray-400">
            {oembed.provider_name && `${oembed.provider_name} - `}
            {new URL(oembed.provider_url ?? url).hostname}
          </span>
        </div>
      </div>
    </a>
  );
};

export default memo(OEmbed);
