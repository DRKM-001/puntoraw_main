"use client";

import { useState } from "react";
import type { EpisodeItem } from "@/lib/episode-items";

/** 16:9 thumbnail: the YouTube frame when there is one, otherwise a branded code card. Fills its (relative) parent. */
export function EpisodeThumb({ item, large = false }: { item: EpisodeItem; large?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (item.videoId && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://i.ytimg.com/vi/${item.videoId}/${large ? "maxresdefault" : "hqdefault"}.jpg`}
        alt=""
        loading="lazy"
        onError={(e) => {
          const hq = `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
          if (large && !e.currentTarget.src.endsWith("hqdefault.jpg")) e.currentTarget.src = hq;
          else setFailed(true);
        }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <div className={`absolute inset-0 bg-gray-900 flex flex-col justify-between ${large ? "p-6 sm:p-8" : "p-4"}`}>
      <span className="font-mono text-[11px] text-white/40 tracking-wider">.RAW&gt;_</span>
      <span
        className={`font-headline font-black uppercase tracking-[-0.02em] leading-none text-white ${
          large ? "text-6xl sm:text-7xl" : "text-3xl"
        }`}
      >
        S{String(item.season).padStart(2, "0")}
        <span className="text-red-600">{"//"}</span>
        <br />
        EP{String(item.seasonEpisode).padStart(3, "0")}
      </span>
    </div>
  );
}

export function PlayBadge({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`absolute bottom-2 right-2 rounded-full bg-black/60 group-hover:bg-red-600 flex items-center justify-center transition-colors ${
        large ? "w-12 h-12 bottom-4 right-4" : "w-8 h-8"
      }`}
    >
      <svg className={`${large ? "w-5 h-5" : "w-3.5 h-3.5"} text-white ml-0.5`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}
