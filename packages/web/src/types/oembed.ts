export interface Oembed {
  author_name?: string;
  author_url?: string;
  height?: number;
  html?: string;
  provider_name?: string;
  provider_url?: string;
  thumbnail_height?: number;
  thumbnail_url?: string;
  thumbnail_width?: number;
  title?: string;
  type: "video" | "photo" | "link" | "rich";
  version: string;
  width?: number;
}
