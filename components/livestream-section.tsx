"use client";

import { useState, useEffect } from "react";

interface LivestreamSectionProps {
  variant: "mobile" | "desktop";
}

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  isLive: boolean;
}

const CHANNEL_URL = "https://www.youtube.com/channel/UCK0EHaEaACp8PE3zpcK6Y1w";
const YOUTUBE_API = "/api/youtube-live";

export function LivestreamSection({ variant }: LivestreamSectionProps) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [playing, setPlaying] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<string>("3");

  useEffect(() => {
    // Try to fetch the latest video / live status
    fetch(YOUTUBE_API)
      .then((r) => r.json())
      .then((data) => {
        if (data.videoId) {
          setVideo({
            id: data.videoId,
            title: data.title || "Latest Episode",
            thumbnail:
              data.thumbnail ||
              `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
            isLive: data.isLive || false,
          });
        }
        if (data.subscriberCount) {
          setSubscriberCount(data.subscriberCount);
        }
      })
      .catch(() => {
        // Fallback — no video loaded
      });
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
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
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
          {video?.title || "Cargando..."}
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
          <span>{subscriberCount} suscriptores</span>
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
