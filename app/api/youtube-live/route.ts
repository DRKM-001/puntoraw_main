import { NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UCK0EHaEaACp8PE3zpcK6Y1w";

interface LiveStreamResult {
  isLive: boolean;
  videoId: string | null;
  title: string | null;
  viewers: string | null;
}

// Simple in-memory cache to avoid burning API quota
let cachedResult: LiveStreamResult | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

const NOT_LIVE: LiveStreamResult = {
  isLive: false,
  videoId: null,
  title: null,
  viewers: null,
};

/**
 * Check if it's within the show window: Thursdays 6:30 PM – 9:30 PM Pacific.
 * 30-min buffer on each side so the stream is caught even if it starts
 * a little early or runs a little late.
 */
function isShowWindow(): boolean {
  // Get current time in America/Los_Angeles
  const nowPT = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  const day = nowPT.getDay(); // 0=Sun … 4=Thu
  const hour = nowPT.getHours();
  const minute = nowPT.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // Thursday = 4, window = 18:30 (1110 min) to 21:30 (1290 min)
  return day === 4 && timeInMinutes >= 1110 && timeInMinutes <= 1290;
}

export async function GET() {
  const now = Date.now();

  // Outside the Thursday show window — skip the API call entirely
  if (!isShowWindow()) {
    return NextResponse.json(NOT_LIVE, {
      headers: {
        // Cache longer outside the window — no need to re-check often
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    });
  }

  // Return cached result if fresh
  if (cachedResult && now - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedResult, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
      },
    });
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(NOT_LIVE, { status: 200 });
  }

  try {
    // Search for active livestreams on the channel
    const searchUrl = new URL(
      "https://www.googleapis.com/youtube/v3/search"
    );
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("channelId", CHANNEL_ID);
    searchUrl.searchParams.set("eventType", "live");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", "1");
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const searchRes = await fetch(searchUrl.toString(), {
      next: { revalidate: 120 },
    });

    if (!searchRes.ok) {
      console.error("YouTube API error:", searchRes.status);
      const result: LiveStreamResult = {
        isLive: false,
        videoId: null,
        title: null,
        viewers: null,
      };
      return NextResponse.json(result);
    }

    const searchData = await searchRes.json();
    const items = searchData.items || [];

    if (items.length === 0) {
      const result: LiveStreamResult = {
        isLive: false,
        videoId: null,
        title: null,
        viewers: null,
      };
      cachedResult = result;
      cacheTimestamp = now;
      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
        },
      });
    }

    const liveVideo = items[0];
    const videoId = liveVideo.id?.videoId;

    // Get viewer count from video details
    let viewers: string | null = null;
    if (videoId) {
      const detailsUrl = new URL(
        "https://www.googleapis.com/youtube/v3/videos"
      );
      detailsUrl.searchParams.set("part", "liveStreamingDetails");
      detailsUrl.searchParams.set("id", videoId);
      detailsUrl.searchParams.set("key", YOUTUBE_API_KEY);

      const detailsRes = await fetch(detailsUrl.toString(), {
        next: { revalidate: 120 },
      });

      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        viewers =
          detailsData.items?.[0]?.liveStreamingDetails
            ?.concurrentViewers || null;
      }
    }

    const result: LiveStreamResult = {
      isLive: true,
      videoId,
      title: liveVideo.snippet?.title || null,
      viewers,
    };

    cachedResult = result;
    cacheTimestamp = now;

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("YouTube live check failed:", error);
    return NextResponse.json({
      isLive: false,
      videoId: null,
      title: null,
      viewers: null,
    });
  }
}
