import type { Metadata } from "../types";

export const replaceMetaTags = async (
  url: URL,
  response: Response,
  meta: Metadata,
  cardType: "summary_large_image" | "summary"
): Promise<string> => {
  const html = await response.text();
  const cleaned = html.replace(
    /^[ \t]*<meta\b[^>]*\b(?:property\s*=\s*["']og:[^"']*["']|name\s*=\s*["']twitter:[^"']*["'])[^>]*\/?>[ \t]*\r?\n?/gim,
    ""
  );
  return cleaned.replace(
    "</head>",
    `<meta property="og:site_name" content="Palus">
     <meta property="og:type" content="website">
     <meta property="og:title" content="${escapeHtmlAttr(meta.title)}" />
     <meta property="og:description" content="${escapeHtmlAttr(meta.description)}" />
     <meta property="og:image" content="${escapeHtmlAttr(meta.image)}" />
     <meta property="og:url" content="${url.href}" />
     <meta name="twitter:card" content="${cardType}" />
     <meta name="twitter:title" content="${escapeHtmlAttr(meta.title)}" />
     <meta name="twitter:description" content="${escapeHtmlAttr(meta.description)}" />
     <meta name="twitter:image" content="${escapeHtmlAttr(meta.image)}" />
     <meta name="twitter:url" content="${url.href}" />
     <meta name="twitter:site" content="@palusapp" />
    </head>`
  );
};

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
