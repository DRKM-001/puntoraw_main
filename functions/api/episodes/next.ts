// GET /api/episodes/next — returns the next season/episode number based on the latest upload
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Get the latest episode by season DESC, episode DESC
    const latest = await context.env.DB.prepare(
      "SELECT season, season_episode FROM episodes ORDER BY season DESC, season_episode DESC LIMIT 1"
    ).first<{ season: number; season_episode: number }>();

    if (latest) {
      return Response.json({
        season: latest.season,
        episodeNumber: latest.season_episode + 1,
        lastEpisode: `S${String(latest.season).padStart(2, "0")} EP${String(latest.season_episode).padStart(2, "0")}`,
      });
    }

    // No episodes yet — start at S01 EP01
    return Response.json({
      season: 1,
      episodeNumber: 1,
      lastEpisode: null,
    });
  } catch (err) {
    console.error("Next episode error:", err);
    return Response.json({ season: 1, episodeNumber: 1, lastEpisode: null });
  }
};
