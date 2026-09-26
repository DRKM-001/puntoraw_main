"use client";

import { useEffect, useState } from "react";

interface Upload {
  videoId: string;
  season: number | null;
  seasonEpisode: number | null;
}

/**
 * YouTube embed for an episode. Uses the given ID, or looks the episode up in the channel's
 * uploads (/api/youtube-videos) by the code in the video title ("S2 EP07").
 */
export function EpisodeVideo({
  youtubeId,
  season,
  seasonEpisode,
  title,
}: {
  youtubeId?: string;
  season?: number;
  seasonEpisode?: number;
  title: string;
}) {
  const [found, setFound] = useState<string | null>(null);

  useEffect(() => {
    if (youtubeId || !season || !seasonEpisode) return;
    let cancelled = false;
    fetch("/api/youtube-videos")
      .then(async (r) => {
        if (!r.ok || !r.headers.get("content-type")?.includes("application/json")) return;
        const { videos } = (await r.json()) as { videos?: Upload[] };
        const match = videos?.find((v) => v.season === season && v.seasonEpisode === seasonEpisode);
        if (!cancelled && match) setFound(match.videoId);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [youtubeId, season, seasonEpisode]);

  const id = youtubeId || found;
  if (!id) return null;

  return (
    <div className="mb-8 aspect-video overflow-hidden rounded-xl bg-gray-900">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="w-full h-full border-0"
      />
    </div>
  );
}
