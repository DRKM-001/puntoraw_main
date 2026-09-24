// GET /api/episodes/:slug — one published episode (podcast RSS feed merged with D1)
// (the static route /api/episodes/next takes precedence over this dynamic one)
import { fetchFeed, mergeEpisodes } from "../../../lib/podcast-feed";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env, "slug"> = async (context) => {
  const slug = String(context.params.slug || "");
  if (!/^[a-z0-9-]{1,200}$/.test(slug)) {
    return Response.json({ episode: null }, { status: 404 });
  }

  try {
    const [db, feed] = await Promise.all([
      context.env.DB.prepare("SELECT * FROM episodes")
        .all()
        .then((r) => (r.results || []) as Record<string, unknown>[])
        .catch(() => [] as Record<string, unknown>[]),
      fetchFeed(),
    ]);

    const episode = mergeEpisodes(db, feed).find((e) => e.slug === slug) ?? null;
    if (!episode) return Response.json({ episode: null }, { status: 404 });

    return Response.json(
      { episode },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } }
    );
  } catch (err) {
    console.error("Get episode error:", err);
    return Response.json({ error: "Failed to load episode" }, { status: 500 });
  }
};
