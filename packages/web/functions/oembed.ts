import { decode } from "html-entities";

const FAVICON_BASE_URL = "https://external-content.duckduckgo.com/ip3";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

const DEV_ORIGIN = "http://localhost:4783";

const getRequestOrigin = (request: Request): string | null => {
  const origin = request.headers.get("Origin");
  if (origin) return origin;

  const referer = request.headers.get("Referer");
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
};

const isAllowedOrigin = (value: string | null): value is string => {
  if (!value) return false;
  if (value === DEV_ORIGIN) return true;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;

  const { hostname } = url;
  return (
    hostname === "palus.app" ||
    hostname.endsWith(".palus.app") ||
    hostname.endsWith(".palus.pages.dev")
  );
};

export const onRequestGet: PagesFunction = async (context) => {
  const origin = getRequestOrigin(context.request);

  if (!isAllowedOrigin(origin)) {
    return new Response(null, { status: 403 });
  }

  const requestUrl = new URL(context.request.url);
  const targetUrl = requestUrl.searchParams.get("url");

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      headers: CORS_HEADERS,
      status: 400
    });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid url" }), {
      headers: CORS_HEADERS,
      status: 400
    });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Palus/1.0)" }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Fetch failed" }), {
        headers: CORS_HEADERS,
        status: 502
      });
    }

    const meta: Record<string, string> = {};
    const state = { title: "" };

    await new HTMLRewriter()
      .on("meta", {
        element(el) {
          const key = el.getAttribute("property") ?? el.getAttribute("name");
          const content = el.getAttribute("content");
          if (key && content) meta[key] = content;
        }
      })
      .on("title", {
        text(chunk) {
          state.title += chunk.text;
        }
      })
      .transform(response)
      .text();

    const getMeta = (key: string): string | null => meta[key] ?? null;

    const pageTitle = state.title.trim() ? decode(state.title.trim()) : null;
    const title = getMeta("og:title") ?? pageTitle;
    const thumbnailUrl = getMeta("og:image");
    const providerName = getMeta("og:site_name") ?? parsedUrl.hostname;
    const favicon = `${FAVICON_BASE_URL}/${parsedUrl.hostname}.ico`;

    if (!title && !thumbnailUrl) {
      return new Response(JSON.stringify({ error: "No metadata found" }), {
        headers: CORS_HEADERS,
        status: 404
      });
    }

    const result = {
      favicon_url: favicon,
      ...(providerName && { provider_name: providerName }),
      ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
      ...(title && { title: decode(title) }),
      type: "link",
      version: "1.0"
    };

    return new Response(JSON.stringify(result), {
      headers: { ...CORS_HEADERS, "Cache-Control": "public, max-age=3600" }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      headers: CORS_HEADERS,
      status: 500
    });
  }
};
