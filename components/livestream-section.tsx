"use client";

import { useState, useEffect } from "react";

interface LivestreamSectionProps {
  variant: "mobile" | "desktop";
  /** Shown immediately and kept if the YouTube API returns nothing (from the newest blog post with a youtubeId) */
  fallbackVideo?: { id: string; title: string } | null;
}

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  isLive: boolean;
}

const CHANNEL_URL = "https://www.youtube.com/channel/UCK0EHaEaACp8PE3zpcK6Y1w";

type Status = "loading" | "ready" | "empty";

/** Fetch JSON from a Pages Function; returns null on any failure (404 in `next dev`, missing API key, etc.) */
async function getJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url);
    if (!r.ok || !r.headers.get("content-type")?.includes("application/json")) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export function LivestreamSection({ variant, fallbackVideo }: LivestreamSectionProps) {
  const initial: VideoData | null = fallbackVideo
    ? {
        id: fallbackVideo.id,
        title: fallbackVideo.title,
        thumbnail: `https://i.ytimg.com/vi/${fallbackVideo.id}/maxresdefault.jpg`,
        isLive: false,
      }
    : null;
  const [video, setVideo] = useState<VideoData | null>(initial);
  const [status, setStatus] = useState<Status>(initial ? "ready" : "loading");
  const [playing, setPlaying] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Ask for live status, latest upload and subscribers in parallel
      const [live, latest, subs] = await Promise.all([
        getJson<{ isLive?: boolean; videoId?: string | null; title?: string | null }>("/api/youtube-live"),
        getJson<{ videoId?: string | null; title?: string | null; thumbnail?: string | null }>("/api/youtube-latest"),
        getJson<{ subscribers?: string | null }>("/api/youtube-subs"),
      ]);
      if (cancelled) return;

      if (subs?.subscribers) setSubscriberCount(subs.subscribers);

      // Prefer an active livestream, otherwise fall back to the latest upload
      if (live?.isLive && live.videoId) {
        setVideo({
          id: live.videoId,
          title: live.title || "En vivo",
          thumbnail: `https://i.ytimg.com/vi/${live.videoId}/hqdefault_live.jpg`,
          isLive: true,
        });
        setStatus("ready");
      } else if (latest?.videoId) {
        setVideo({
          id: latest.videoId,
          title: latest.title || "Último episodio",
          thumbnail: latest.thumbnail || `https://i.ytimg.com/vi/${latest.videoId}/hqdefault.jpg`,
          isLive: false,
        });
        setStatus("ready");
      } else if (!initial) {
        setStatus("empty");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMobile = variant === "mobile";

  return (
    <div>
      {/* Video Card */}
      <div
        className={`relative overflow-hidden bg-gray-900 ${
          isMobile ? "w-full aspect-video" : "rounded-2xl aspect-video shadow-xl"
        }`}
      >
        {playing && video ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            {/* Thumbnail */}
            {video ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const fallback = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                  if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                }}
              />
            ) : status === "empty" ? (
              // No video available → link straight to the channel
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-800 to-gray-900 text-white hover:from-gray-700 transition-colors"
              >
                <span className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="text-sm font-medium">Ver episodios en YouTube</span>
              </a>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Live badge */}
            {video?.isLive && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                En Vivo
              </div>
            )}

            {/* Play button */}
            {video && (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group"
                aria-label="Play video"
              >
                <div className="w-16 h-16 bg-black/60 group-hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                  <svg
                    className="w-7 h-7 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
            )}

            {/* YouTube badge — top right */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-white/80 text-xs font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </div>
          </>
        )}
      </div>

      {/* Meta — below the card */}
      <div className={isMobile ? "px-4 pt-3 pb-6" : "pt-4"}>
        {video?.isLive ? (
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">
            En Vivo Ahora
          </p>
        ) : (
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Último Episodio
          </p>
        )}

        <p className="text-sm font-medium text-gray-900 leading-snug">
          {video?.title ??
            (status === "loading" ? "Cargando..." : "Mira todos los episodios en nuestro canal")}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-red-600 font-medium hover:text-red-700 transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
              <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Suscribirse
          </a>
          {subscriberCount && (
            <span>{Number(subscriberCount).toLocaleString("es-419")} suscriptores</span>
          )}
          <a
            href="/schedule"
            className="text-gray-500 hover:text-gray-900 transition"
          >
            Calendario →
          </a>
        </div>
      </div>
    </div>
  );
}
