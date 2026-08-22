"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface LiveStatus {
  isLive: boolean;
  videoId: string | null;
  title: string | null;
  viewers: string | null;
}

const CHANNEL_URL = "https://www.youtube.com/channel/UCK0EHaEaACp8PE3zpcK6Y1w";

/**
 * Choose a polling interval based on current live state.
 * If live → poll every 30s to keep viewer count fresh.
 * Otherwise → poll every 5 minutes to catch when a stream starts.
 */
function getPollingInterval(isLive: boolean): number {
  return isLive ? 30 * 1000 : 5 * 60 * 1000;
}

interface LatestVideo {
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
}

interface LivestreamSectionProps {
  variant?: "mobile" | "desktop";
}

export function LivestreamSection({ variant = "desktop" }: LivestreamSectionProps) {
  const [liveStatus, setLiveStatus] = useState<LiveStatus>({
    isLive: false,
    videoId: null,
    title: null,
    viewers: null,
  });
  const [latestVideo, setLatestVideo] = useState<LatestVideo>({
    videoId: null,
    title: null,
    thumbnail: null,
  });
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch("/api/youtube-subs");
      if (res.ok) {
        const data = await res.json();
        if (data.subscribers) setSubscribers(data.subscribers);
      }
    } catch {
      // Fail silently
    }
  }, []);

  const fetchLatestVideo = useCallback(async () => {
    try {
      const res = await fetch("/api/youtube-latest");
      if (res.ok) {
        const data = await res.json();
        setLatestVideo(data);
      }
    } catch {
      // Fail silently
    }
  }, []);

  const checkLiveStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/youtube-live");
      if (res.ok) {
        const data = await res.json();
        setLiveStatus(data);
      }
    } catch {
      // Fail silently — show fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkLiveStatus();
    fetchSubscribers();
    fetchLatestVideo();
    const interval = setInterval(() => {
      checkLiveStatus();
    }, getPollingInterval(liveStatus.isLive));
    return () => clearInterval(interval);
  }, [checkLiveStatus, fetchSubscribers, fetchLatestVideo, liveStatus.isLive]);

  const isMobile = variant === "mobile";

  return (
    <div className={isMobile ? "" : "flex flex-col gap-3"}>
      {/* Live badge — desktop only (mobile shows it below the video) */}
      {!isMobile && (
        <div className="flex items-center gap-2">
          {liveStatus.isLive ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-semibold text-red-600 uppercase tracking-widest">
                En Vivo
              </span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                YouTube
              </span>
            </>
          )}
        </div>
      )}

      {/* Video / Thumbnail */}
      {loading ? (
        <div
          className={`aspect-video w-full bg-gray-100 animate-pulse ${
            isMobile ? "" : "rounded-xl border border-gray-200"
          }`}
        />
      ) : liveStatus.isLive && liveStatus.videoId ? (
        /* LIVE embed */
        <div>
          <div
            className={`aspect-video w-full overflow-hidden bg-black ${
              isMobile
                ? "shadow-md"
                : "rounded-xl border border-gray-200 shadow-lg"
            }`}
          >
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${liveStatus.videoId}?autoplay=1&rel=0`}
              title={liveStatus.title || "Punto Raw En Vivo"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {!isMobile && (liveStatus.title || liveStatus.viewers) && (
            <div className="mt-3">
              {liveStatus.title && (
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {liveStatus.title}
                </p>
              )}
              {liveStatus.viewers && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {parseInt(liveStatus.viewers).toLocaleString()} viendo ahora
                </p>
              )}
            </div>
          )}
        </div>
      ) : playing && latestVideo.videoId ? (
        /* Inline YouTube player — shown after clicking the thumbnail */
        <div>
          <div
            className={`aspect-video w-full overflow-hidden bg-black ${
              isMobile
                ? "shadow-md"
                : "rounded-xl border border-gray-200 shadow-lg"
            }`}
          >
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${latestVideo.videoId}?autoplay=1&rel=0`}
              title={latestVideo.title || "Punto Raw"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {!isMobile && latestVideo.title && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {latestVideo.title}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* NOT LIVE: show latest video thumbnail — click to play inline */
        <div>
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="w-full text-left"
          >
            <div
              className={`group aspect-video w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden cursor-pointer ${
                isMobile
                  ? ""
                  : "rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              }`}
            >
              {/* Thumbnail background */}
              {latestVideo.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={latestVideo.thumbnail}
                  alt={latestVideo.title || "Último episodio"}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}

              {/* Light overlay for play button visibility */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Play button */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-red-600/90 group-hover:scale-110 transition-all duration-300">
                <svg
                  className="w-7 h-7 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* .RAW branding watermark */}
              <p className="absolute bottom-3 right-4 text-[10px] font-bold text-white/20 tracking-wide z-10">
                .RAW
              </p>
            </div>
          </button>

          {/* Episode title — below the card */}
          {latestVideo.title && (
            <div className={isMobile ? "px-4 pt-2" : "mt-3"}>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                Último Episodio
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {latestVideo.title}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Subscriber count + links — both mobile and desktop */}
      <div className={isMobile ? "px-4 py-2.5" : ""}>
        <div className="flex items-center gap-3 text-xs">
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
              <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Suscribirse
          </a>
          {subscribers && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400">
                {parseInt(subscribers).toLocaleString()} suscriptores
              </span>
            </>
          )}
          <span className="text-gray-300">·</span>
          <Link
            href="/schedule"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            Calendario →
          </Link>
        </div>
      </div>
    </div>
  );
}
