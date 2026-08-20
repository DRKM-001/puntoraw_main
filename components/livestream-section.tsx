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
 * Check if it's near the Thursday show window (client-side).
 * Uses a wider window (6 PM – 10 PM Pacific) so the client starts
 * polling a bit before the show and keeps checking a bit after.
 */
function isNearShowWindow(): boolean {
  const nowPT = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  const day = nowPT.getDay(); // 4 = Thursday
  const timeInMinutes = nowPT.getHours() * 60 + nowPT.getMinutes();
  // Thursday, 6:00 PM (1080) to 10:00 PM (1320)
  return day === 4 && timeInMinutes >= 1080 && timeInMinutes <= 1320;
}

export function LivestreamSection() {
  const [liveStatus, setLiveStatus] = useState<LiveStatus>({
    isLive: false,
    videoId: null,
    title: null,
    viewers: null,
  });
  const [loading, setLoading] = useState(true);

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

    const interval = setInterval(() => {
      checkLiveStatus();
    }, isNearShowWindow() ? 2 * 60 * 1000 : 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkLiveStatus]);

  return (
    <div className="flex flex-col gap-3">
      {/* Live badge / label */}
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
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
              <path
                fill="white"
                d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"
              />
            </svg>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              YouTube
            </span>
          </>
        )}
      </div>

      {loading ? (
        /* Loading skeleton */
        <div className="aspect-video w-full rounded-xl bg-gray-100 border border-gray-200 animate-pulse" />
      ) : liveStatus.isLive && liveStatus.videoId ? (
        /* LIVE: YouTube embed */
        <div>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-200 shadow-lg">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${liveStatus.videoId}?autoplay=1&rel=0`}
              title={liveStatus.title || "Punto Raw En Vivo"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {(liveStatus.title || liveStatus.viewers) && (
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
      ) : (
        /* NOT LIVE: Latest episode card + subscribe */
        <div>
          <Link href="/episodes/s2-e4-algo-tiene-que-morir">
            <div className="group aspect-video w-full rounded-xl border border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-red-50 transition-colors">
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Último Episodio
              </p>
              <p className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                Algo tiene que morir
              </p>
              <p className="text-xs text-gray-500 mt-1">T2 · Ep 4 · Punto Raw</p>
            </div>
          </Link>
        </div>
      )}

      {/* Subscribe + schedule links */}
      <div className="flex items-center gap-3 text-xs">
        <a
          href={CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
            <path
              fill="white"
              d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            />
          </svg>
          Suscribirse
        </a>
        <span className="text-gray-300">·</span>
        <Link
          href="/schedule"
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          Calendario →
        </Link>
      </div>
    </div>
  );
}
