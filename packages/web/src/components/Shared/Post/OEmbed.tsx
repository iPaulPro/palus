import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { usePostQuery } from "@palus/indexer";
import { memo } from "react";
import { Link } from "react-router";
import Quote from "@/components/Shared/Embed/Quote";
import Skeleton from "@/components/Shared/Skeleton";
import { Image } from "@/components/Shared/UI";
import cn from "@/helpers/cn";
import { getExternalLink } from "@/helpers/getExternalLink";
import { getPostIdFromLensUrl } from "@/helpers/lensURLs";
import { isRepost } from "@/helpers/postHelpers";
import useOembed from "@/hooks/useOembed";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

interface OEmbedProps {
  url: string;
}

const OEmbed = ({ url }: OEmbedProps) => {
  const { data: oembed, isPending: isLoading } = useOembed(url);
  const { replaceLensLinks } = usePreferencesStore();

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

  const postId = getPostIdFromLensUrl(url);
  const { data: lensPost, loading: loadingPost } = usePostQuery({
    skip: !postId,
    variables: { request: { post: postId } }
  });

  if (isLoading || loadingPost) {
    return (
      <Skeleton
        className={cn("mt-4 h-16 w-full rounded-xl md:w-2/3", {
          "h-38 md:w-5/6": isSpotify && parsedUrl.pathname.startsWith("/track"),
          "h-50 md:h-88 md:w-full": isYouTube,
          "h-60 md:w-4/5": isTikTok,
          "h-64 md:w-4/5": isTwitter,
          "h-88 md:w-5/6": isSpotify && parsedUrl.pathname.startsWith("/album")
        })}
      />
    );
  }

  if (lensPost?.post) {
    const post = isRepost(lensPost.post)
      ? lensPost.post.repostOf
      : lensPost.post;
    return <Quote post={post} />;
  }

  const link = getExternalLink(url, replaceLensLinks);

  if (!oembed) {
    return (
      <Link
        onClick={(e) => e.stopPropagation()}
        rel="noopener"
        target={link.includes(location.host) ? "_self" : "_blank"}
        to={link}
      >
        <div className="group mt-4 flex h-16 w-full min-w-0 items-center rounded-xl border border-border bg-accent md:w-2/3">
          <div className="flex h-full flex-none items-center border-border border-r px-4">
            <Image
              alt="Shared link"
              className="size-5 shrink-0 rounded"
              fallback="/images/link.svg"
              src={`https://${hostname}/favicon.ico`}
            />
          </div>
          <div className="flex min-w-0 flex-col justify-center px-4">
            <div className="flex items-center gap-x-1 text-secondary text-sm">
              <span>Shared link</span>
              <ArrowTopRightOnSquareIcon className="inline size-3" />
            </div>
            <div className="truncate font-semibold text-on-surface text-sm group-hover:text-secondary">
              {url}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (isYouTube && oembed.html) {
    return (
      <div
        className="not-prose youtube mt-4 min-h-50 w-full md:min-h-88"
        dangerouslySetInnerHTML={{ __html: oembed.html }}
      />
    );
  }

  if (isSpotify && oembed.html) {
    return (
      <div
        className={cn("not-prose oembed-html mt-4 w-5/6", {
          "min-h-38": parsedUrl.pathname.startsWith("/track"),
          "min-h-88": parsedUrl.pathname.startsWith("/album")
        })}
        dangerouslySetInnerHTML={{ __html: oembed.html }}
      />
    );
  }

  if (isTwitter && oembed.html) {
    return (
      <div
        className="not-prose tweet mt-4 flex min-h-16 w-full items-center rounded-xl border border-border bg-accent p-5 pb-8 md:w-4/5"
        dangerouslySetInnerHTML={{ __html: oembed.html }}
      />
    );
  }

  return (
    <Link
      className={cn(
        "not-prose mt-4 flex min-h-16 w-full flex-col rounded-xl border border-border md:w-2/3",
        {
          "min-h-56": Boolean(oembed.thumbnail_url)
        }
      )}
      onClick={(e) => e.stopPropagation()}
      rel="noopener"
      target={link.includes(location.host) ? "_self" : "_blank"}
      to={link}
    >
      {oembed.thumbnail_url && (
        <Image
          alt={oembed.title}
          className="h-40 w-full rounded-t-xl border-border border-b bg-accent object-cover"
          src={oembed.thumbnail_url}
        />
      )}
      <div className="flex flex-col gap-y-1 rounded-b-xl bg-accent p-3">
        {oembed.title && (
          <span className="line-clamp-1 font-bold text-sm">{oembed.title}</span>
        )}
        {oembed.author_name && (
          <span className="text-secondary text-xs">{oembed.author_name}</span>
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
            <Image
              alt={oembed.provider_name || "Favicon"}
              fallback="/images/link.svg"
              height={12}
              src={oembed.favicon_url}
              width={12}
            />
          ) : null}
          <span className="text-secondary text-xs">
            {oembed.provider_name && oembed.provider_name !== hostname
              ? `${oembed.provider_name} - `
              : null}
            {hostname}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default memo(OEmbed);
