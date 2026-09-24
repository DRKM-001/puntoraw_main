// Cloudflare Pages Function — episode metadata CRUD via D1
import { fetchFeed, mergeEpisodes } from "../../lib/podcast-feed";

interface Env {
  DB: D1Database;
}

function slugify(text: string, season: number, episode: number): string {
  const clean = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `s${season}-e${episode}-${clean}`;
}

// GET /api/episodes — list all episodes
// Published list = podcast RSS feed (auto-updates when you publish on Spotify) merged with D1 (hand-edited details).
// Other statuses (?status=draft) come straight from D1.
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const status = url.searchParams.get("status") || "published";

    if (status !== "published") {
      const { results } = await context.env.DB.prepare(
        "SELECT * FROM episodes WHERE status = ? ORDER BY season DESC, season_episode DESC"
      )
        .bind(status)
        .all();
      const episodes = (results || []).map((ep: Record<string, unknown>) => ({
        ...ep,
        topics: ep.topics ? JSON.parse(ep.topics as string) : [],
      }));
      return Response.json({ episodes });
    }

    const [db, feed] = await Promise.all([
      context.env.DB.prepare("SELECT * FROM episodes")
        .all()
        .then((r) => (r.results || []) as Record<string, unknown>[])
        .catch(() => [] as Record<string, unknown>[]),
      fetchFeed(),
    ]);

    return Response.json(
      { episodes: mergeEpisodes(db, feed) },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } }
    );
  } catch (err) {
    console.error("List episodes error:", err);
    return Response.json({ error: "Failed to list episodes" }, { status: 500 });
  }
};

// POST /api/episodes — create a new episode
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json<{
      title: string;
      description?: string;
      speaker: string;
      season: number;
      seasonEpisode: number;
      spotifyId?: string;
      audioUrl?: string;
    }>();

    if (!body.title || !body.speaker || !body.season || !body.seasonEpisode) {
      return Response.json(
        { error: "Missing required fields: title, speaker, season, seasonEpisode" },
        { status: 400 }
      );
    }

    const slug = slugify(body.title, body.season, body.seasonEpisode);

    // Calculate total episode number
    const countResult = await context.env.DB.prepare(
      "SELECT COUNT(*) as count FROM episodes"
    ).first<{ count: number }>();
    const episodeNumber = (countResult?.count || 0) + 1;

    await context.env.DB.prepare(
      `INSERT INTO episodes (slug, title, description, speaker, season, season_episode, episode_number, spotify_id, audio_url, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        slug,
        body.title,
        body.description || null,
        body.speaker,
        body.season,
        body.seasonEpisode,
        episodeNumber,
        body.spotifyId || null,
        body.audioUrl || null,
        body.description || null
      )
      .run();

    return Response.json({
      ok: true,
      slug,
      episodeNumber,
      message: "Episode created successfully",
    });
  } catch (err: unknown) {
    console.error("Create episode error:", err);
    const message = err instanceof Error ? err.message : "Failed to create episode";
    if (message.includes("UNIQUE constraint")) {
      return Response.json(
        { error: "An episode with this season/episode number already exists" },
        { status: 409 }
      );
    }
    return Response.json({ error: message }, { status: 500 });
  }
};
