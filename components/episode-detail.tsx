"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface EpisodeData {
  episodeNumber: number;
  season: number;
  seasonEpisode: number;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  summary: string;
  topics: string[];
  quote?: string;
  spotifyId?: string;
  audioUrl?: string;
}

export interface RelatedPost {
  slug: string;
  title: string;
  season: number;
  seasonEpisode: number;
  readingMinutes: number;
  youtubeId?: string;
  spotifyId?: string;
  excerpt?: string;
}

/** Row shape returned by /api/episodes/[slug] (D1) */
interface ApiEpisode {
  title: string;
  speaker: string;
  season: number;
  season_episode: number;
  episode_number: number;
  date: string;
  duration: string | null;
  summary: string | null;
  description: string | null;
  topics: string[];
  quote: string | null;
  spotify_id: string | null;
  audio_url?: string | null;
}

function fromApi(e: ApiEpisode): EpisodeData {
  return {
    episodeNumber: e.episode_number,
    season: e.season,
    seasonEpisode: e.season_episode,
    title: e.title,
    speaker: e.speaker,
    date: e.date,
    duration: e.duration ?? "",
    summary: e.summary || e.description || "",
    topics: e.topics ?? [],
    quote: e.quote ?? undefined,
    spotifyId: e.spotify_id || undefined,
    audioUrl: e.audio_url || undefined,
  };
}

function formatDate(date: string) {
  // Noon local time so the date doesn't shift a day in US timezones
  const d = new Date(`${date.slice(0, 10)}T12:00:00`);
  return isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("es-419", { year: "numeric", month: "long", day: "numeric" });
}

export function EpisodeDetail({
  initial,
  posts,
}: {
  initial: EpisodeData | null;
  posts: RelatedPost[];
  /** True for the "pendiente" placeholder page (content comes entirely from D1) */
  isShell?: boolean;
}) {
  const [episode, setEpisode] = useState<EpisodeData | null>(initial);
  const [state, setState] = useState<"loading" | "ready" | "missing">(initial ? "ready" : "loading");

  useEffect(() => {
    // The real slug comes from the URL (the shell page is served for any unknown slug)
    const slug = decodeURIComponent(window.location.pathname.replace(/\/+$/, "").split("/").pop() || "");

    let cancelled = false;
    fetch(`/api/episodes/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (!r.ok || !r.headers.get("content-type")?.includes("application/json")) throw new Error();
        return (await r.json()) as { episode?: ApiEpisode };
      })
      .then((data) => {
        if (cancelled) return;
        if (data.episode) {
          const ep = fromApi(data.episode);
          setEpisode(ep);
          setState("ready");
          document.title = `${ep.title} — T${ep.season} Ep${ep.seasonEpisode} | .RAW Sessions`;
        } else if (!initial) {
          setState("missing");
        }
      })
      .catch(() => {
        // API unavailable (e.g. `next dev`) → keep the build-time data if we have it
        if (!cancelled && !initial) setState("missing");
      });

    return () => {
      cancelled = true;
    };
  }, [initial]);

  if (state === "loading") {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-12 animate-pulse">
        <div className="h-4 w-32 bg-gray-100 rounded mb-10" />
        <div className="h-4 w-48 bg-gray-100 rounded mb-4" />
        <div className="h-12 w-3/4 bg-gray-100 rounded mb-4" />
        <div className="h-5 w-1/2 bg-gray-100 rounded mb-10" />
        <div className="aspect-video bg-gray-100 rounded-xl" />
      </section>
    );
  }

  if (state === "missing" || !episode) {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Episodio no encontrado</h1>
        <Link href="/episodes" className="text-sm font-medium text-red-600 hover:text-red-700">
          ← Ver todos los episodios
        </Link>
      </section>
    );
  }

  const post = posts.find((p) => p.season === episode.season && p.seasonEpisode === episode.seasonEpisode);
  // Spotify ID: from D1, or from the matching blog post's frontmatter
  const spotifyId = episode.spotifyId || post?.spotifyId;
  const summary = episode.summary || post?.excerpt || "";

  return (
    <div>
      {/* Header */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        <Link
          href="/episodes"
          className="text-gray-400 hover:text-gray-900 transition text-sm mb-8 inline-flex items-center py-2"
        >
          ← Volver a Episodios
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">
            Temporada {episode.season} · Episodio {episode.seasonEpisode}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{episode.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500">
            <p className="text-lg font-medium text-gray-700">{episode.speaker}</p>
            <span className="hidden sm:inline text-gray-300">·</span>
            <p>{formatDate(episode.date)}</p>
            {episode.duration && (
              <>
                <span className="hidden sm:inline text-gray-300">·</span>
                <p>{episode.duration}</p>
              </>
            )}
          </div>
        </div>

        {/* YouTube (from the matching blog post) */}
        {post?.youtubeId && (
          <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-gray-900">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}?rel=0`}
              title={episode.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="w-full h-full border-0"
            />
          </div>
        )}

        {/* Spotify */}
        {spotifyId && (
          <div className="mb-12">
            <iframe
              src={`https://open.spotify.com/embed/episode/${spotifyId}?utm_source=generator`}
              width="100%"
              height="152"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl border-0"
              title={`Escuchar ${episode.title} en Spotify`}
            />
          </div>
        )}

        {/* Audio file from the podcast feed — when there's no Spotify ID yet */}
        {!spotifyId && episode.audioUrl && (
          <div className="mb-12 rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Escuchar episodio</p>
            <audio controls preload="none" src={episode.audioUrl} className="w-full">
              <a href={episode.audioUrl}>Descargar audio</a>
            </audio>
          </div>
        )}
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        {summary && <p className="text-lg text-gray-600 leading-relaxed mb-10">{summary}</p>}

        {episode.topics.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Temas Principales</h2>
            <ul className="space-y-2">
              {episode.topics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-600">
                  <span className="text-red-500 mt-1 text-sm">●</span>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}

        {episode.quote && (
          <blockquote className="border-l-4 border-red-500 pl-6 py-2 my-10">
            <p className="text-xl italic text-gray-700 leading-relaxed">&ldquo;{episode.quote}&rdquo;</p>
          </blockquote>
        )}

        {/* Blog summary link */}
        {post && (
          <Link
            href={`/blog/${post.slug}`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all p-5 sm:p-6"
          >
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">
                Lee el resumen completo
              </p>
              <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                {post.title} — {post.readingMinutes} min de lectura
              </p>
            </div>
            <span className="text-red-600 text-xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/episodes" className="text-sm font-medium text-red-600 hover:text-red-700 transition">
            ← Ver todos los episodios
          </Link>
        </div>
      </section>
    </div>
  );
}
