// GET /api/schedule — fetch upcoming events from the public Punto Raw Google Calendar
interface Env {
  GOOGLE_CALENDAR_API_KEY: string;
}

const CALENDAR_ID =
  "f8e3ac2a75414861b46978421e780c830eec343d3cfb74b7b5fe75e750d53e1f@group.calendar.google.com";

const GCAL_URL = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`;

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const showPast = url.searchParams.get("past") === "true";

    const apiKey = context.env.GOOGLE_CALENDAR_API_KEY;

    if (!apiKey) {
      return jsonResponse({ error: "Google Calendar API key not configured" }, 500);
    }

    const now = new Date();
    const params = new URLSearchParams({
      key: apiKey,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    if (!showPast) {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      params.set("timeMin", thirtyDaysAgo.toISOString());
    }

    const fetchUrl = `${GCAL_URL}?${params.toString()}`;
    const res = await fetch(fetchUrl);
    const responseText = await res.text();

    if (!res.ok) {
      console.error("Google Calendar API error:", res.status, responseText);
      return jsonResponse(
        { error: "Failed to fetch calendar events", detail: responseText },
        502
      );
    }

    let data: { items?: Array<Record<string, unknown>> };
    try {
      data = JSON.parse(responseText);
    } catch {
      return jsonResponse({ error: "Invalid response from Google Calendar" }, 502);
    }

    const events = (data.items || [])
      .filter((ev: Record<string, unknown>) => ev.status !== "cancelled")
      .map((ev: Record<string, unknown>) => {
        const start = ev.start as { dateTime?: string; date?: string } | undefined;
        const end = ev.end as { dateTime?: string; date?: string } | undefined;
        const startRaw = start?.dateTime || start?.date || "";
        const endRaw = end?.dateTime || end?.date || "";
        const startDate = new Date(startRaw);
        const isPast = startDate < now;

        return {
          id: ev.id || "",
          title: ev.summary || "Sin título",
          description: ev.description || "",
          start: startRaw,
          end: endRaw,
          location: ev.location || "",
          status: isPast ? "published" : "upcoming",
        };
      });

    return jsonResponse(
      { events },
      200,
      { "Cache-Control": "public, max-age=300, s-maxage=300" }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Schedule fetch error:", message);
    return jsonResponse({ error: "Failed to fetch schedule", detail: message }, 500);
  }
};
