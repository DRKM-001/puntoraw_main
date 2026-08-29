// GET /api/schedule — fetch upcoming events from the public Punto Raw Google Calendar
const CALENDAR_ID =
  "f8e3ac2a75414861b46978421e780c830eec343d3cfb74b7b5fe75e750d53e1f@group.calendar.google.com";

// Google Calendar public iCal → JSON proxy
// Public calendars can be fetched via the Google Calendar API with just an API key,
// or we can use the public iCal feed and parse it. We'll use the public JSON feed.
const GCAL_URL = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`;

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const url = new URL(context.request.url);
    const showPast = url.searchParams.get("past") === "true";

    // We need an API key for the Google Calendar API.
    // Store it as an environment variable in Cloudflare Pages settings.
    const apiKey = (context.env as Record<string, string>).GOOGLE_CALENDAR_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Google Calendar API key not configured" },
        { status: 500 }
      );
    }

    const now = new Date();
    const params = new URLSearchParams({
      key: apiKey,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    // Only show future events by default
    if (!showPast) {
      // Show events from 30 days ago (to include recently published ones)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      params.set("timeMin", thirtyDaysAgo.toISOString());
    }

    const res = await fetch(`${GCAL_URL}?${params.toString()}`);

    if (!res.ok) {
      const errText = await res.text();
      console.error("Google Calendar API error:", res.status, errText);
      return Response.json(
        { error: "Failed to fetch calendar events" },
        { status: 502 }
      );
    }

    const data = await res.json<{
      items?: Array<{
        id: string;
        summary?: string;
        description?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        location?: string;
        status?: string;
      }>;
    }>();

    const events = (data.items || [])
      .filter((ev) => ev.status !== "cancelled")
      .map((ev) => {
        const startRaw = ev.start?.dateTime || ev.start?.date || "";
        const endRaw = ev.end?.dateTime || ev.end?.date || "";
        const startDate = new Date(startRaw);
        const isPast = startDate < now;

        return {
          id: ev.id,
          title: ev.summary || "Sin título",
          description: ev.description || "",
          start: startRaw,
          end: endRaw,
          location: ev.location || "",
          status: isPast ? "published" : "upcoming",
        };
      });

    return Response.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (err) {
    console.error("Schedule fetch error:", err);
    return Response.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
};
