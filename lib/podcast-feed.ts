// Podcast RSS (Spotify for Creators) → episode rows, merged with D1.
// Used by the Pages Functions in functions/api/episodes*. The feed is the source of truth
// for WHICH episodes exist; D1 rows (from /upload) enrich or override them.

export const PODCAST_FEED_URL = "https://anchor.fm/s/c8cfb82c/podcast/rss";

/** Same shape the /api/episodes endpoints have always returned (D1 row, topics parsed). */
export interface EpisodeRow {
  slug: string;
  title: string;
  description: string | null;
  speaker: string;
  season: number;
  season_episode: number;
  episode_number: number;
  date: string; // YYYY-MM-DD
  duration: string | null;
  summary: string | null;
  topics: string[];
  quote: string | null;
  spotify_id: string | null;
  audio_url: string | null;
  status: string;
  source?: "d1" | "feed" | "d1+feed";
}

export interface FeedEpisode {
  season: number;
  seasonEpisode: number;
  title: string;
  date: string;
  duration: string | null;
  description: string | null;
  audioUrl: string | null;
}

export function slugify(text: string, season: number, episode: number): string {
  const clean = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `s${season}-e${episode}-${clean}`;
}

function decodeEntities(s: string) {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");
}

function tag(item: string, name: string): string | null {
  const m = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1]).trim() : null;
}

function toText(html: string | null): string | null {
  if (!html) return null;
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  // Ignore placeholder descriptions like "asdf"
  return text.length >= 15 ? text : null;
}

/** "01:35:55" | "5755" → "1h 36min" */
function formatDuration(raw: string | null): string | null {
  if (!raw) return null;
  const parts = raw.split(":").map(Number);
  if (parts.some(isNaN)) return null;
  const secs = parts.reduce((acc, p) => acc * 60 + p, 0);
  const mins = Math.round(secs / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}min` : `${m}min`;
}

/** Publish date in Pacific time (the show's timezone) as YYYY-MM-DD */
function pacificDate(pubDate: string | null): string | null {
  if (!pubDate) return null;
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

/** "S2: E6. Cuando La Lógica…" → "Cuando La Lógica…" */
function cleanTitle(title: string) {
  return title.replace(/^\s*S\d+\s*:?\s*E\d+\s*[.:\-–—]?\s*/i, "").trim() || title;
}

export function parseFeed(xml: string): FeedEpisode[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const out: FeedEpisode[] = [];
  for (const item of items) {
    const season = Number(tag(item, "itunes:season"));
    const seasonEpisode = Number(tag(item, "itunes:episode"));
    const title = tag(item, "title");
    const date = pacificDate(tag(item, "pubDate"));
    if (!season || !seasonEpisode || !title || !date) continue; // skip trailers/bonus without numbers
    out.push({
      season,
      seasonEpisode,
      title: cleanTitle(title),
      date,
      duration: formatDuration(tag(item, "itunes:duration")),
      description: toText(tag(item, "description") ?? tag(item, "itunes:summary")),
      audioUrl: item.match(/<enclosure[^>]*\burl="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&") ?? null,
    });
  }
  return out;
}

export async function fetchFeed(): Promise<FeedEpisode[]> {
  try {
    const res = await fetch(PODCAST_FEED_URL, {
      // Cloudflare edge cache: re-check the feed at most every 15 minutes
      cf: { cacheTtl: 900, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return [];
    return parseFeed(await res.text());
  } catch {
    return [];
  }
}

type DbRow = Record<string, unknown>;

function fromDb(r: DbRow): EpisodeRow {
  let topics: string[] = [];
  try {
    topics = r.topics ? JSON.parse(String(r.topics)) : [];
  } catch {
    topics = [];
  }
  return {
    slug: String(r.slug),
    title: String(r.title),
    description: (r.description as string) || null,
    speaker: (r.speaker as string) || "Punto Raw",
    season: Number(r.season),
    season_episode: Number(r.season_episode),
    episode_number: Number(r.episode_number),
    date: String(r.date ?? "").slice(0, 10),
    duration: (r.duration as string) || null,
    summary: (r.summary as string) || null,
    topics,
    quote: (r.quote as string) || null,
    spotify_id: (r.spotify_id as string) || null,
    audio_url: (r.audio_url as string) || null,
    status: String(r.status ?? "published"),
    source: "d1",
  };
}

/**
 * Merge D1 rows with the feed. Matching is by season + episode number.
 * - D1 fields win when present (they're hand-edited); the feed fills the gaps.
 * - Episodes only in the feed are included automatically.
 * - D1 rows with status other than "published" hide the matching feed episode too.
 */
export function mergeEpisodes(dbRows: DbRow[], feed: FeedEpisode[]): EpisodeRow[] {
  const key = (s: number, e: number) => `${s}:${e}`;
  const db = new Map<string, EpisodeRow>();
  for (const r of dbRows.map(fromDb)) db.set(key(r.season, r.season_episode), r);

  const merged = new Map<string, EpisodeRow>(db);

  for (const f of feed) {
    const k = key(f.season, f.seasonEpisode);
    const existing = db.get(k);
    if (existing) {
      merged.set(k, {
        ...existing,
        date: existing.date || f.date,
        duration: existing.duration || f.duration,
        description: existing.description || f.description,
        summary: existing.summary || f.description,
        audio_url: existing.audio_url || f.audioUrl,
        source: "d1+feed",
      });
    } else {
      merged.set(k, {
        slug: slugify(f.title, f.season, f.seasonEpisode),
        title: f.title,
        description: f.description,
        speaker: "Punto Raw",
        season: f.season,
        season_episode: f.seasonEpisode,
        episode_number: 0, // filled below
        date: f.date,
        duration: f.duration,
        summary: f.description,
        topics: [],
        quote: null,
        spotify_id: null,
        audio_url: f.audioUrl,
        status: "published",
        source: "feed",
      });
    }
  }

  const all = [...merged.values()].sort((a, b) =>
    a.season !== b.season ? a.season - b.season : a.season_episode - b.season_episode
  );
  // Overall episode number = position in the full chronological list
  all.forEach((ep, i) => {
    if (!ep.episode_number) ep.episode_number = i + 1;
  });

  return all
    .filter((ep) => ep.status === "published")
    .sort((a, b) => (a.season !== b.season ? b.season - a.season : b.season_episode - a.season_episode));
}
