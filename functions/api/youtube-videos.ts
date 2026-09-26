// GET /api/youtube-videos — recent channel uploads, newest first, with season/episode parsed from the title.
// Used by the homepage "Episodios anteriores" shelf and the episode pages.
import { videosFromApi, videosFromRss, type YoutubeVideo } from "../../lib/youtube-feed";

function json(videos: YoutubeVideo[], cacheSeconds: number) {
  return new Response(JSON.stringify({ videos }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, s-maxage=${cacheSeconds}, max-age=${Math.round(cacheSeconds / 2)}`,
    },
  });
}

export async function onRequest(context: { env: { YOUTUBE_API_KEY?: string } }) {
  // The API returns the full upload history; RSS only the ~15 newest. Prefer the API when a key exists.
  const key = context.env.YOUTUBE_API_KEY;
  if (key) {
    const api = await videosFromApi(key).catch(() => null);
    if (api) return json(api, 1800);
  }
  const rss = await videosFromRss().catch(() => null);
  if (rss) return json(rss, 1800);
  return json([], 300);
}
