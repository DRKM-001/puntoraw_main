const CHANNEL_ID = "UCK0EHaEaACp8PE3zpcK6Y1w";

export async function onRequest(context: {
  env: { YOUTUBE_API_KEY?: string };
}) {
  const API_KEY = context.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return new Response(
      JSON.stringify({ videoId: null, title: null, thumbnail: null }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Fetch the most recent video from the channel
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&maxResults=1&type=video&key=${API_KEY}`
    );
    const searchData = (await searchRes.json()) as {
      items?: {
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          thumbnails?: {
            high?: { url?: string };
            medium?: { url?: string };
            default?: { url?: string };
          };
          publishedAt?: string;
        };
      }[];
    };

    const latest = searchData.items?.[0];

    if (!latest?.id?.videoId) {
      return new Response(
        JSON.stringify({ videoId: null, title: null, thumbnail: null }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, s-maxage=3600, max-age=1800",
          },
        }
      );
    }

    const videoId = latest.id.videoId;
    const title = latest.snippet?.title ?? null;
    const thumbnail =
      latest.snippet?.thumbnails?.high?.url ??
      latest.snippet?.thumbnails?.medium?.url ??
      latest.snippet?.thumbnails?.default?.url ??
      null;
    const publishedAt = latest.snippet?.publishedAt ?? null;

    return new Response(
      JSON.stringify({ videoId, title, thumbnail, publishedAt }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=3600, max-age=1800",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ videoId: null, title: null, thumbnail: null }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
