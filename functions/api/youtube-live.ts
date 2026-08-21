const CHANNEL_ID = "UCK0EHaEaACp8PE3zpcK6Y1w";

export async function onRequest(context: {
  env: { YOUTUBE_API_KEY?: string };
}) {
  const API_KEY = context.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return new Response(
      JSON.stringify({
        isLive: false,
        videoId: null,
        title: null,
        viewers: null,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Search for active live broadcasts on this channel
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`
    );
    const searchData = (await searchRes.json()) as {
      items?: {
        id?: { videoId?: string };
        snippet?: { title?: string };
      }[];
    };

    const liveVideo = searchData.items?.[0];

    if (!liveVideo?.id?.videoId) {
      return new Response(
        JSON.stringify({
          isLive: false,
          videoId: null,
          title: null,
          viewers: null,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, s-maxage=60, max-age=30",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const videoId = liveVideo.id.videoId;
    const title = liveVideo.snippet?.title ?? null;

    // Get live viewer count
    let viewers: string | null = null;
    try {
      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,statistics&id=${videoId}&key=${API_KEY}`
      );
      const statsData = (await statsRes.json()) as {
        items?: {
          liveStreamingDetails?: { concurrentViewers?: string };
          statistics?: { viewCount?: string };
        }[];
      };
      viewers =
        statsData.items?.[0]?.liveStreamingDetails?.concurrentViewers ?? null;
    } catch {
      // Viewer count is nice-to-have, not critical
    }

    return new Response(
      JSON.stringify({
        isLive: true,
        videoId,
        title,
        viewers,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=30, max-age=15",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        isLive: false,
        videoId: null,
        title: null,
        viewers: null,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
