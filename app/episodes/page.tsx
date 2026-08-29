"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Episode {
  slug: string;
  title: string;
  description: string;
  speaker: string;
  season: number;
  season_episode: number;
  episode_number: number;
  date: string;
  duration: string;
  summary: string;
  topics: string[];
  quote: string;
  spotify_id: string;
  status: string;
}

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/episodes")
      .then((r) => r.json())
      .then((data) => {
        setEpisodes(data.episodes || []);
      })
      .catch(() => {
        setError("No se pudieron cargar los episodios.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Group episodes by season (descending)
  const seasons = episodes.reduce<Record<number, Episode[]>>((acc, ep) => {
    if (!acc[ep.season]) acc[ep.season] = [];
    acc[ep.season].push(ep);
    return acc;
  }, {});

  const sortedSeasonKeys = Object.keys(seasons)
    .map(Number)
    .sort((a, b) => b - a);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-419", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-8">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
          Podcast
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Episodios
        </h1>
        <p className="text-gray-500">
          Conversaciones mensuales sobre intenciones auténticas, responsabilidad y crecimiento.
        </p>
      </section>

      {/* Loading */}
      {loading && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-6 h-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-gray-400 text-sm">Cargando episodios...</span>
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="text-center py-20">
            <p className="text-red-500 text-sm font-medium">{error}</p>
          </div>
        </section>
      )}

      {/* Episodes by Season */}
      {!loading && !error && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-20 space-y-12">
          {sortedSeasonKeys.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Aún no hay episodios. ¡Vuelve pronto!</p>
            </div>
          ) : (
            sortedSeasonKeys.map((seasonNum) => {
              const seasonEpisodes = seasons[seasonNum].sort(
                (a, b) => b.season_episode - a.season_episode
              );

              return (
                <div key={seasonNum}>
                  {/* Season Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Temporada {seasonNum}
                    </h2>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-300 font-medium">
                      {seasonEpisodes.length} episodio{seasonEpisodes.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Episode Cards */}
                  <div className="space-y-4">
                    {seasonEpisodes.map((ep) => (
                      <Link
                        key={ep.slug}
                        href={`/episodes/${ep.slug}`}
                        className="group block"
                      >
                        <article className="rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all p-5 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            {/* Episode Number Badge */}
                            <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-1 sm:min-w-[56px] shrink-0">
                              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                                T{seasonNum}
                              </span>
                              <span className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">
                                EP{String(ep.season_episode).padStart(2, "0")}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-1.5">
                                <span>{formatDate(ep.date)}</span>
                                {ep.duration && (
                                  <>
                                    <span className="text-gray-200">·</span>
                                    <span>{ep.duration}</span>
                                  </>
                                )}
                                {ep.speaker && (
                                  <>
                                    <span className="text-gray-200">·</span>
                                    <span>{ep.speaker}</span>
                                  </>
                                )}
                              </div>

                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-1.5 line-clamp-1">
                                {ep.title}
                              </h3>

                              <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                {ep.summary || ep.description}
                              </p>

                              <span className="inline-flex items-center text-sm font-medium text-red-600 group-hover:gap-2 transition-all">
                                Escuchar
                                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                              </span>
                            </div>

                            {/* Spotify badge (subtle) */}
                            {ep.spotify_id && (
                              <div className="hidden md:flex items-center shrink-0">
                                <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
