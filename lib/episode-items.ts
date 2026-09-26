// Client-safe: builds the unified episode list (podcast feed/D1 + blog write-ups + YouTube uploads),
// matched by season + episode number. Used by the /episodes index and the homepage shelf.

/** Build-time data from content/blog (passed down from server components) */
export interface ShelfPost {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  duration?: string;
  season?: number;
  seasonEpisode?: number;
  youtubeId?: string;
}

export interface ApiEpisode {
  slug: string;
  title: string;
  date: string;
  season: number;
  season_episode: number;
  duration?: string | null;
  summary?: string | null;
  description?: string | null;
}

export interface ApiVideo {
  videoId: string;
  title: string;
  publishedAt: string | null;
  season: number | null;
  seasonEpisode: number | null;
}

export interface EpisodeItem {
  key: string;
  season: number;
  seasonEpisode: number;
  title: string;
  date: string | null;
  duration: string | null;
  summary: string | null;
  href: string;
  external: boolean;
  videoId: string | null;
  /** Has a full write-up (content/blog) */
  hasPost: boolean;
}

export async function getJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url);
    if (!r.ok || !r.headers.get("content-type")?.includes("application/json")) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export function episodeCode(season: number, ep: number) {
  return `S${String(season).padStart(2, "0")}//EP${String(ep).padStart(3, "0")}`;
}

export function shortDate(date: string | null) {
  if (!date) return null;
  const d = new Date(`${date.slice(0, 10)}T12:00:00`);
  return isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("es-419", { day: "numeric", month: "short", year: "numeric" });
}

/** "S02 EP06 - Cuando la lógica…" → "Cuando la lógica…"; "S2 EP07" → "" */
function stripCode(title: string) {
  return title
    .replace(/\b[ST]\s*0*\d{1,2}\s*[:.\-–—/·|]*\s*E(?:P|p)?\s*0*\d{1,3}\b/i, "")
    .replace(/^[\s:.\-–—|·]+|[\s:.\-–—|·]+$/g, "")
    .trim();
}

/** All known episodes, newest first. */
export function buildEpisodeItems(
  posts: ShelfPost[],
  episodes: ApiEpisode[] | null,
  videos: ApiVideo[] | null
): EpisodeItem[] {
  const map = new Map<string, EpisodeItem>();
  const k = (s: number, e: number) => `${s}:${e}`;

  for (const e of episodes ?? []) {
    map.set(k(e.season, e.season_episode), {
      key: k(e.season, e.season_episode),
      season: e.season,
      seasonEpisode: e.season_episode,
      title: e.title,
      date: e.date,
      duration: e.duration ?? null,
      summary: e.summary || e.description || null,
      href: `/episodes/${e.slug}`,
      external: false,
      videoId: null,
      hasPost: false,
    });
  }

  // A write-up is the episode page: its URL, title and excerpt win
  for (const p of posts) {
    if (!p.season || !p.seasonEpisode) continue;
    const key = k(p.season, p.seasonEpisode);
    const existing = map.get(key);
    map.set(key, {
      key,
      season: p.season,
      seasonEpisode: p.seasonEpisode,
      title: p.title,
      date: existing?.date ?? p.date,
      duration: p.duration ?? existing?.duration ?? null,
      summary: p.excerpt ?? existing?.summary ?? null,
      href: `/episodes/${p.slug}`,
      external: false,
      videoId: p.youtubeId ?? null,
      hasPost: true,
    });
  }

  // Newest upload per episode wins (re-uploads replace older versions)
  const sorted = [...(videos ?? [])].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  for (const v of sorted) {
    if (!v.season || !v.seasonEpisode) continue;
    const key = k(v.season, v.seasonEpisode);
    const existing = map.get(key);
    if (existing) {
      existing.videoId ??= v.videoId;
    } else {
      map.set(key, {
        key,
        season: v.season,
        seasonEpisode: v.seasonEpisode,
        title: stripCode(v.title) || `Episodio ${v.seasonEpisode}`,
        date: v.publishedAt,
        duration: null,
        summary: null,
        href: `https://www.youtube.com/watch?v=${v.videoId}`,
        external: true,
        videoId: v.videoId,
        hasPost: false,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.season - a.season || b.seasonEpisode - a.seasonEpisode);
}
