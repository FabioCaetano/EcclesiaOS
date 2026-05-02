import type { YouTubeFeed, YouTubeVideo } from "@ecclesiaos/shared";

const cacheTtlMs = 10 * 60 * 1000;
const fetchTimeoutMs = 8000;
const userAgent = "Mozilla/5.0 (compatible; EcclesiaOS/0.1; +https://github.com/FabioCaetano/EcclesiaOS)";

interface CacheEntry {
  fetchedAt: number;
  feed: YouTubeFeed;
}

const cache = new Map<string, CacheEntry>();

const decodeXmlEntities = (value: string) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

const fetchText = async (url: string): Promise<string | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xml,application/xhtml+xml,*/*"
      }
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export interface ParsedChannelUrl {
  kind: "channelId" | "handle";
  value: string;
}

export const parseChannelUrl = (rawUrl: string): ParsedChannelUrl | null => {
  const url = String(rawUrl || "").trim();
  if (!url) return null;

  const channelMatch = url.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]{10,})/i);
  if (channelMatch) return { kind: "channelId", value: channelMatch[1] };

  const handleMatch = url.match(/youtube\.com\/@([A-Za-z0-9._-]+)/i);
  if (handleMatch) return { kind: "handle", value: `@${handleMatch[1]}` };

  const cMatch = url.match(/youtube\.com\/c\/([A-Za-z0-9._-]+)/i);
  if (cMatch) return { kind: "handle", value: cMatch[1] };

  const userMatch = url.match(/youtube\.com\/user\/([A-Za-z0-9._-]+)/i);
  if (userMatch) return { kind: "handle", value: userMatch[1] };

  const bareHandle = url.match(/^@([A-Za-z0-9._-]+)$/);
  if (bareHandle) return { kind: "handle", value: `@${bareHandle[1]}` };

  return null;
};

export const resolveChannelIdFromHandle = async (handle: string): Promise<string | null> => {
  const path = handle.startsWith("@") ? handle : `c/${handle}`;
  const html = await fetchText(`https://www.youtube.com/${path}`);
  if (!html) return null;

  const jsonMatch = html.match(/"channelId":"(UC[A-Za-z0-9_-]{10,})"/);
  if (jsonMatch) return jsonMatch[1];

  const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[A-Za-z0-9_-]{10,})"/);
  if (canonicalMatch) return canonicalMatch[1];

  const metaMatch = html.match(/<meta itemprop="(?:channelId|identifier)" content="(UC[A-Za-z0-9_-]{10,})"/);
  if (metaMatch) return metaMatch[1];

  return null;
};

const extractTagContent = (block: string, tag: string): string => {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = block.match(pattern);
  return match ? decodeXmlEntities(match[1].trim()) : "";
};

const extractAttribute = (block: string, tag: string, attribute: string): string => {
  const pattern = new RegExp(`<${tag}[^>]*\\s${attribute}="([^"]+)"`, "i");
  const match = block.match(pattern);
  return match ? decodeXmlEntities(match[1]) : "";
};

const parseFeedXml = (xml: string, channelId: string, channelUrl: string): YouTubeFeed => {
  const channelTitleMatch = xml.match(/<title>([\s\S]*?)<\/title>/);
  const channelTitle = channelTitleMatch ? decodeXmlEntities(channelTitleMatch[1].trim()) : "";

  const entries = xml.split(/<entry>/).slice(1);
  const videos: YouTubeVideo[] = entries.map((rawEntry) => {
    const block = rawEntry.split(/<\/entry>/)[0] || "";
    const videoId = extractTagContent(block, "yt:videoId");
    const title = extractTagContent(block, "title") || extractTagContent(block, "media:title");
    const publishedAt = extractTagContent(block, "published");
    const linkHref = extractAttribute(block, "link", "href");
    const thumbnailFromMedia = extractAttribute(block, "media:thumbnail", "url");

    return {
      id: videoId,
      title,
      url: linkHref || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""),
      publishedAt,
      thumbnailUrl: thumbnailFromMedia || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "")
    };
  }).filter((video) => video.id && video.title);

  return { channelId, channelTitle, channelUrl, videos };
};

const fetchFeedFor = async (channelId: string, channelUrl: string): Promise<YouTubeFeed | null> => {
  const xml = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  if (!xml) return null;
  return parseFeedXml(xml, channelId, channelUrl);
};

export type YouTubeFetchResult =
  | { ok: true; feed: YouTubeFeed }
  | { ok: false; error: "missing_channel_url" | "invalid_channel_url" | "channel_not_found" | "feed_unavailable" };

export const fetchYouTubeFeed = async (rawUrl: string): Promise<YouTubeFetchResult> => {
  const trimmed = String(rawUrl || "").trim();
  if (!trimmed) return { ok: false, error: "missing_channel_url" };

  const cached = cache.get(trimmed);
  if (cached && Date.now() - cached.fetchedAt < cacheTtlMs) {
    return { ok: true, feed: cached.feed };
  }

  const parsed = parseChannelUrl(trimmed);
  if (!parsed) return { ok: false, error: "invalid_channel_url" };

  const channelId = parsed.kind === "channelId" ? parsed.value : await resolveChannelIdFromHandle(parsed.value);
  if (!channelId) return { ok: false, error: "channel_not_found" };

  const feed = await fetchFeedFor(channelId, trimmed);
  if (!feed) return { ok: false, error: "feed_unavailable" };

  cache.set(trimmed, { fetchedAt: Date.now(), feed });
  return { ok: true, feed };
};

export const __resetYouTubeCacheForTests = () => cache.clear();
