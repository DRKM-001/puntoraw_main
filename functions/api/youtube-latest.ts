const CHANNEL_ID = "UCK0EHaEaACp8PE3zpcK6Y1w";
// Uploads playlist = channel ID with "UC" → "UU" (includes finished livestreams)
const UPLOADS_PLAYLIST = "UU" + CHANNEL_ID.slice(2);

interface Latest {
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
  publishedAt?: string | null;
  source?: string;
}

const EMPTY: Latest = { videoId: null, title: null, thumbnail: null };

function json(body: Latest, cacheSeconds = 0) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...(cacheSeconds
        ? { "Cache-Control": `public, s-maxage=${cacheSeconds}, max-age=${Math.round(cacheSeconds / 2)}` }
        : {}),
    },
  });
}

function decodeXml(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** 1) Public RSS feed — no API key, no quota, includes past livestreams. */
async function fromRss(): Promise<Latest | null> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, {
    cf: { cacheTtl: 900, cacheEverything: true },
  } as RequestInit);
  if (!res.ok) return null;
  const xml = await res.text();
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
  if (!entry) return null;

  const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? null;
  if (!videoId) return null;
  const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
  const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? null;

  return {
    videoId,
    title: title ? decodeXml(title) : null,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    publishedAt: published,
    source: "rss",
  };
}

/** 2) Data API uploads playlist — 1 quota unit (vs 100 for search). Needs YOUTUBE_API_KEY. */
async function fromApi(key: string): Promise<Latest | null> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${UPLOADS_PLAYLIST}&key=${key}`
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    items?: {
      snippet?: {
        title?: string;
        publishedAt?: string;
        resourceId?: { videoId?: string };
        thumbnails?: Record<string, { url?: string }>;
      };
    }[];
  };
  const s = data.items?.[0]?.snippet;
  const videoId = s?.resourceId?.videoId;
  if (!videoId) return null;
  const t = s?.thumbnails ?? {};
  return {
    videoId,
    title: s?.title ?? null,
    thumbnail:
      t.maxres?.url ?? t.standard?.url ?? t.high?.url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    publishedAt: s?.publishedAt ?? null,
    source: "api",
  };
}

export async function onRequest(context: { env: { YOUTUBE_API_KEY?: string } }) {
  try {
    const rss = await fromRss().catch(() => null);
    if (rss) return json(rss, 1800);

    const key = context.env.YOUTUBE_API_KEY;
    if (key) {
      const api = await fromApi(key).catch(() => null);
      if (api) return json(api, 1800);
    }
    return json(EMPTY, 300);
  } catch {
    return json(EMPTY);
  }
}
