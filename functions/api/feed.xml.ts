// GET /api/feed.xml — Podcast RSS feed (Apple Podcasts / Spotify compatible)
interface Env {
  DB: D1Database;
  AUDIO_BUCKET: R2Bucket;
}

// Podcast metadata
const PODCAST = {
  title: ".RAW Sessions",
  description:
    "Conversaciones mensuales sobre intenciones auténticas, responsabilidad y crecimiento. Un grupo mastermind de emprendedores comparte sin filtro.",
  language: "es",
  author: "Punto Raw",
  ownerName: "Punto Raw",
  ownerEmail: "rovelo.ga@gmail.com",
  siteUrl: "https://puntoraw.org",
  feedUrl: "https://puntoraw.org/api/feed.xml",
  imageUrl: "https://puntoraw.org/podcast-cover.jpg",
  category: "Business",
  subcategory: "Entrepreneurship",
  explicit: false,
  copyright: `© ${new Date().getFullYear()} Punto Raw`,
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRFC2822(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toUTCString();
}

function formatDuration(dur: string): string {
  if (!dur) return "00:00:00";
  // If already in HH:MM:SS or H:MM:SS format, return as-is
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(dur)) return dur;
  // If in "1h 3min" format, convert
  const hMatch = dur.match(/(\d+)\s*h/);
  const mMatch = dur.match(/(\d+)\s*min/);
  const hours = hMatch ? parseInt(hMatch[1]) : 0;
  const minutes = mMatch ? parseInt(mMatch[1]) : 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Fetch all published episodes from D1
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM episodes WHERE status = 'published' ORDER BY season ASC, season_episode ASC"
    ).all();

    const episodes = results || [];

    // Build items XML
    const itemsXml: string[] = [];

    for (const ep of episodes as Record<string, unknown>[]) {
      const title = escapeXml((ep.title as string) || "Sin título");
      const description = escapeXml((ep.description as string) || (ep.summary as string) || "");
      const summary = escapeXml((ep.summary as string) || (ep.description as string) || "");
      const speaker = escapeXml((ep.speaker as string) || "Punto Raw");
      const slug = ep.slug as string;
      const date = ep.date as string;
      const duration = formatDuration((ep.duration as string) || "");
      const season = ep.season as number;
      const seasonEpisode = ep.season_episode as number;
      const episodeNumber = ep.episode_number as number;
      const audioUrl = ep.audio_url as string | null;

      // Build the audio enclosure URL
      // If audio_url is set in DB, use it; otherwise construct from R2 key pattern
      let enclosureUrl = "";
      let enclosureLength = 0;
      let enclosureType = "audio/mpeg";

      if (audioUrl) {
        // If it's a relative URL, make it absolute
        enclosureUrl = audioUrl.startsWith("http")
          ? audioUrl
          : `${PODCAST.siteUrl}${audioUrl}`;
      } else {
        // Default R2 key pattern from the upload function
        enclosureUrl = `${PODCAST.siteUrl}/audio/audio/s${season}/ep${seasonEpisode}.mp3`;
      }

      // Try to get file size from R2 for accurate enclosure length
      try {
        const r2Key = `audio/s${season}/ep${seasonEpisode}.mp3`;
        const obj = await context.env.AUDIO_BUCKET.head(r2Key);
        if (obj) {
          enclosureLength = obj.size;
          enclosureType = obj.httpMetadata?.contentType || "audio/mpeg";
        }
      } catch {
        // If R2 lookup fails, use 0 (still valid per spec)
      }

      const episodeUrl = `${PODCAST.siteUrl}/episodes/${slug}`;

      itemsXml.push(`
    <item>
      <title>${title}</title>
      <description>${description}</description>
      <link>${episodeUrl}</link>
      <guid isPermaLink="true">${episodeUrl}</guid>
      <pubDate>${toRFC2822(date)}</pubDate>
      <enclosure url="${escapeXml(enclosureUrl)}" length="${enclosureLength}" type="${enclosureType}" />
      <itunes:title>${title}</itunes:title>
      <itunes:summary>${summary}</itunes:summary>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:author>${speaker}</itunes:author>
      <itunes:season>${season}</itunes:season>
      <itunes:episode>${seasonEpisode}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>${PODCAST.explicit ? "true" : "false"}</itunes:explicit>
    </item>`);
    }

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(PODCAST.title)}</title>
    <link>${PODCAST.siteUrl}</link>
    <description>${escapeXml(PODCAST.description)}</description>
    <language>${PODCAST.language}</language>
    <copyright>${escapeXml(PODCAST.copyright)}</copyright>
    <atom:link href="${PODCAST.feedUrl}" rel="self" type="application/rss+xml" />
    <itunes:author>${escapeXml(PODCAST.author)}</itunes:author>
    <itunes:owner>
      <itunes:name>${escapeXml(PODCAST.ownerName)}</itunes:name>
      <itunes:email>${PODCAST.ownerEmail}</itunes:email>
    </itunes:owner>
    <itunes:category text="${escapeXml(PODCAST.category)}">
      <itunes:category text="${escapeXml(PODCAST.subcategory)}" />
    </itunes:category>
    <itunes:explicit>${PODCAST.explicit ? "true" : "false"}</itunes:explicit>
    <itunes:image href="${PODCAST.imageUrl}" />
    <itunes:type>episodic</itunes:type>
    <image>
      <url>${PODCAST.imageUrl}</url>
      <title>${escapeXml(PODCAST.title)}</title>
      <link>${PODCAST.siteUrl}</link>
    </image>
${itemsXml.join("\n")}
  </channel>
</rss>`;

    return new Response(rssXml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=900",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>${escapeXml(message)}</error>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml" },
      }
    );
  }
};
