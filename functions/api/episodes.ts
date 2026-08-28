// Cloudflare Pages Function — episode metadata CRUD via D1
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
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const status = url.searchParams.get("status") || "published";

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM episodes WHERE status = ? ORDER BY season DESC, season_episode DESC"
    )
      .bind(status)
      .all();

    // Parse JSON fields
    const episodes = (results || []).map((ep: Record<string, unknown>) => ({
      ...ep,
      topics: ep.topics ? JSON.parse(ep.topics as string) : [],
    }));

    return Response.json({ episodes });
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
