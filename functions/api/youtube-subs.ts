interface Env {
  YOUTUBE_API_KEY: string;
}

const CHANNEL_ID = "UCK0EHaEaACp8PE3zpcK6Y1w";

export const onRequest: PagesFunction<Env> = async (context) => {
  const API_KEY = context.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`
    );
    const data = (await res.json()) as {
      items?: { statistics?: { subscriberCount?: string } }[];
    };

    const subscribers = data.items?.[0]?.statistics?.subscriberCount ?? null;

    return new Response(JSON.stringify({ subscribers }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, max-age=1800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response(JSON.stringify({ subscribers: null }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};
