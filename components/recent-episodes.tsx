"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  buildEpisodeItems,
  episodeCode,
  getJson,
  shortDate,
  type ApiEpisode,
  type ApiVideo,
  type EpisodeItem,
  type ShelfPost,
} from "@/lib/episode-items";
import { EpisodeThumb, PlayBadge } from "@/components/episode-thumb";

export type { ShelfPost };

const MAX_ITEMS = 8;
const CARD_WIDTH =
  "shrink-0 w-[72%] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]";

function Card({ item }: { item: EpisodeItem }) {
  const inner = (
    <>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
        <EpisodeThumb item={item} />
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <PlayBadge />
      </div>
      <p className="mt-3 font-mono text-[11px] text-red-600 tracking-wide">{episodeCode(item.season, item.seasonEpisode)}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
        {item.title}
      </p>
      {shortDate(item.date) && <p className="mt-1 text-xs text-gray-400">{shortDate(item.date)}</p>}
    </>
  );

  const cls = `group snap-start ${CARD_WIDTH}`;
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={item.href} className={cls}>
      {inner}
    </Link>
  );
}

/** Homepage shelf: previous episodes (the newest one is already in the hero). */
export function RecentEpisodes({ posts }: { posts: ShelfPost[] }) {
  const [items, setItems] = useState<EpisodeItem[] | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [eps, vids] = await Promise.all([
        getJson<{ episodes?: ApiEpisode[] }>("/api/episodes"),
        getJson<{ videos?: ApiVideo[] }>("/api/youtube-videos"),
      ]);
      if (!cancelled) {
        const all = buildEpisodeItems(posts, eps?.episodes ?? null, vids?.videos ?? null);
        setItems(all.slice(1, 1 + MAX_ITEMS));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [posts]);

  if (items && items.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className="border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="flex items-center justify-between gap-4 mb-5 min-h-9">
          <h2 className="text-xs font-semibold text-red-600 uppercase tracking-wide">Episodios anteriores</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Anteriores"
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              ←
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Siguientes"
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scroll-px-4 sm:scroll-px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items
            ? items.map((item) => <Card key={item.key} item={item} />)
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${CARD_WIDTH} animate-pulse`}>
                  <div className="aspect-video rounded-xl bg-gray-100" />
                  <div className="mt-3 h-3 w-20 rounded bg-gray-100" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
