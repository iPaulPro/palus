const FAVICON_BASE_URL = "https://external-content.duckduckgo.com/ip3";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

const ALLOWED_ORIGINS =
  /^https:\/\/(([a-zA-Z0-9-]+\.)?palus\.app|[a-zA-Z0-9-]+\.palus\.pages\.dev)$/;
const DEV_ORIGIN = "http://localhost:4783";

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  return ALLOWED_ORIGINS.test(origin) || origin === DEV_ORIGIN;
};

export const onRequestGet: PagesFunction = async (context) => {
  const origin = context.request.headers.get("Origin");

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

    const html = await response.text();

    const getMeta = (property: string): string | null => {
      const ogMatch = html.match(
        new RegExp(
          `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
          "i"
        )
      );
      if (ogMatch) return ogMatch[1];

      const nameMatch = html.match(
        new RegExp(
          `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
          "i"
        )
      );
      if (nameMatch) return nameMatch[1];

      // Also try content before property/name attribute order
      const ogMatchAlt = html.match(
        new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
          "i"
        )
      );
      if (ogMatchAlt) return ogMatchAlt[1];

      const nameMatchAlt = html.match(
        new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
          "i"
        )
      );
      return nameMatchAlt ? nameMatchAlt[1] : null;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    const title = getMeta("og:title") ?? titleMatch?.[1]?.trim() ?? null;
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
      ...(title && { title }),
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
