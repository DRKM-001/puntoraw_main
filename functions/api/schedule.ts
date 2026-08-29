// GET /api/schedule — fetch upcoming events from the public Punto Raw Google Calendar
interface Env {
  GOOGLE_CALENDAR_API_KEY: string;
}

const CALENDAR_ID =
  "f8e3ac2a75414861b46978421e780c830eec343d3cfb74b7b5fe75e750d53e1f@group.calendar.google.com";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const headers = { "Content-Type": "application/json" };

  try {
    const url = new URL(context.request.url);
    const showPast = url.searchParams.get("past") === "true";

    const apiKey = context.env.GOOGLE_CALENDAR_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Google Calendar API key not configured" }),
        { status: 500, headers }
      );
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

    const gcalUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params.toString()}`;

    const res = await fetch(gcalUrl);
    const responseText = await res.text();

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch calendar events",
          status: res.status,
          detail: responseText.substring(0, 500),
        }),
        { status: 502, headers }
      );
    }

    let data: { items?: Array<Record<string, unknown>> };
    try {
      data = JSON.parse(responseText);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid response from Google Calendar" }),
        { status: 502, headers }
      );
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

    return new Response(
      JSON.stringify({ events }),
      {
        status: 200,
        headers: {
          ...headers,
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch schedule", detail: message }),
      { status: 500, headers }
    );
  }
};
