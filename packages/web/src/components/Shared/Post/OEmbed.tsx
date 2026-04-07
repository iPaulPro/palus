import { memo } from "react";
import Skeleton from "@/components/Shared/Skeleton";
import useOembed from "@/hooks/useOembed";

interface OEmbedProps {
  url: string;
}

const OEmbed = ({ url }: OEmbedProps) => {
  const { data: oembed, isPending: isLoading } = useOembed(url);

  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;

  const isYouTube =
    hostname.includes("youtube.com") || hostname.includes("youtu.be");
  const isSpotify = hostname.includes("spotify.com");
  const isTikTok = hostname.includes("tiktok.com");
  const isTwitter =
    hostname.includes("twitter.com") || hostname.includes("x.com");

  if (isLoading) {
    return (
      <Skeleton
        className={`mt-4 w-full rounded-xl md:w-2/3 ${isSpotify || isTikTok || isYouTube ? "h-56" : "h-24"}`}
      />
    );
  }

  if (!oembed) {
    return (
      <div className="mt-4 h-20 w-full rounded-xl border border-border p-4 md:w-2/3">
        Fallback link
      </div>
    );
  }

  if (isYouTube && oembed.html) {
    return (
      <div
        className="not-prose oembed-html mt-4 w-full md:w-2/3"
        dangerouslySetInnerHTML={{ __html: oembed.html }}
      />
    );
  }

  if (isTwitter && oembed.html) {
    return (
      <a
        className="not-prose oembed-html mt-4 block w-full text-sm md:w-2/3"
        dangerouslySetInnerHTML={{ __html: oembed.html }}
        href={url}
        onClick={(e) => {
          e.stopPropagation();
        }}
        rel="noreferrer"
        target="_blank"
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
      <div className="flex flex-col gap-y-1 p-3">
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
