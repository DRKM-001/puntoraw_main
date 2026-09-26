// YouTube channel uploads → list of videos, with the season/episode parsed from the title.
// Shared by the Pages Functions (functions/api/youtube-*.ts).

export const YT_CHANNEL_ID = "UCK0EHaEaACp8PE3zpcK6Y1w";
/** Uploads playlist = channel ID with "UC" → "UU" (includes finished livestreams) */
export const YT_UPLOADS_PLAYLIST = "UU" + YT_CHANNEL_ID.slice(2);

export interface YoutubeVideo {
  videoId: string;
  title: string;
  publishedAt: string | null;
  /** Parsed from titles like "S2 EP07", "S2:EP07", "S02 EP06 - …" */
  season: number | null;
  seasonEpisode: number | null;
}

function decodeXml(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");
}

/** "S2 EP07" | "S2:EP07" | "S02 EP06 - Título" | "T2 E7" → { season: 2, seasonEpisode: 7 } */
export function parseEpisodeCode(title: string): { season: number; seasonEpisode: number } | null {
  const m = title.match(/\b[ST]\s*0*(\d{1,2})\s*[:.\-–—/·|]*\s*E(?:P|p)?\s*0*(\d{1,3})\b/i);
  if (!m) return null;
  return { season: Number(m[1]), seasonEpisode: Number(m[2]) };
}

function withCode(videoId: string, title: string, publishedAt: string | null): YoutubeVideo {
  const code = parseEpisodeCode(title);
  return {
    videoId,
    title,
    publishedAt,
    season: code?.season ?? null,
    seasonEpisode: code?.seasonEpisode ?? null,
  };
}

/** Public RSS feed — no API key, no quota; returns the ~15 most recent uploads. */
export async function videosFromRss(): Promise<YoutubeVideo[] | null> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`, {
    cf: { cacheTtl: 900, cacheEverything: true },
  } as RequestInit);
  if (!res.ok) return null;
  const xml = await res.text();
  const out: YoutubeVideo[] = [];
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    if (!videoId) continue;
    const title = decodeXml(entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? null;
    out.push(withCode(videoId, title, published));
  }
  return out.length ? out : null;
}

/** Data API uploads playlist — 1 quota unit per call. Needs YOUTUBE_API_KEY. */
export async function videosFromApi(key: string, max = 50): Promise<YoutubeVideo[] | null> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${max}&playlistId=${YT_UPLOADS_PLAYLIST}&key=${key}`
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    items?: { snippet?: { title?: string; publishedAt?: string; resourceId?: { videoId?: string } } }[];
  };
  const out = (data.items ?? [])
    .map((i) => i.snippet)
    .filter((s): s is NonNullable<typeof s> => !!s?.resourceId?.videoId)
    .map((s) => withCode(s.resourceId!.videoId!, s.title ?? "", s.publishedAt ?? null));
  return out.length ? out : null;
}
