import { useMediaQuery } from "@uidotdev/usehooks";
import { memo, useEffect, useState } from "react";
import Skeleton from "@/components/Shared/Skeleton";
import { getOembed } from "@/helpers/oembed";
import type { Oembed as OembedData } from "@/types/oembed";

interface OEmbedProps {
  url: string;
}

const OEmbed = ({ url }: OEmbedProps) => {
  const [oembed, setOembed] = useState<OembedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");

  useEffect(() => {
    const fetchOembed = async () => {
      if (!url) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const data = await getOembed(url, isSmallDevice);
      setOembed(data);
      setIsLoading(false);
    };

    fetchOembed();
  }, [url]);

  if (!oembed) {
    return null;
  }

  const isSpotify = oembed.provider_url === "https://spotify.com";
  const isTikTok = oembed.provider_url === "https://www.tiktok.com";

  if (isLoading) {
    return <Skeleton className="mt-4 h-56 w-full rounded-xl md:w-2/3" />;
  }

  if (oembed.provider_url === "https://www.youtube.com/" && oembed.html) {
    return (
      <div
        className="not-prose oembed-html mt-4 w-full md:w-2/3"
        dangerouslySetInnerHTML={{ __html: oembed.html }}
      />
    );
  }

  if (oembed.provider_url === "https://twitter.com" && oembed.html) {
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
        {(oembed.provider_name || oembed.provider_url) && (
          <div className="flex items-center space-x-1">
            {isSpotify ? (
              <img
                alt="Spotify icon"
                height={16}
                src="/images/ic_spotify.svg"
                width={16}
              />
            ) : isTikTok ? (
              <img
                alt="TikTok icon"
                height={16}
                src="/images/ic_tiktok.svg"
                width={16}
              />
            ) : null}
            <span className="text-gray-500 text-xs dark:text-gray-400">
              {oembed.provider_name ||
                (oembed.provider_url && new URL(oembed.provider_url).hostname)}
            </span>
          </div>
        )}
      </div>
    </a>
  );
};

export default memo(OEmbed);
