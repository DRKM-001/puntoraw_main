// GET /api/episodes/:slug — a single published episode from D1
// (the static route /api/episodes/next takes precedence over this dynamic one)
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env, "slug"> = async (context) => {
  const slug = String(context.params.slug || "");
  if (!/^[a-z0-9-]{1,200}$/.test(slug)) {
    return Response.json({ episode: null }, { status: 404 });
  }

  try {
    const ep = await context.env.DB.prepare(
      "SELECT * FROM episodes WHERE slug = ? AND status = 'published' LIMIT 1"
    )
      .bind(slug)
      .first<Record<string, unknown>>();

    if (!ep) return Response.json({ episode: null }, { status: 404 });

    return Response.json(
      {
        episode: {
          ...ep,
          topics: ep.topics ? JSON.parse(ep.topics as string) : [],
        },
      },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } }
    );
  } catch (err) {
    console.error("Get episode error:", err);
    return Response.json({ error: "Failed to load episode" }, { status: 500 });
  }
};
