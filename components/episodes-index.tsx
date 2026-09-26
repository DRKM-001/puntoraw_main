"use client";

import { useEffect, useState } from "react";
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

function EpisodeLink({ item, className, children }: { item: EpisodeItem; className: string; children: React.ReactNode }) {
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {children}
    </Link>
  );
}

function Meta({ item }: { item: EpisodeItem }) {
  const parts = [shortDate(item.date), item.duration].filter(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
      <span className="font-mono text-red-600 tracking-wide">{episodeCode(item.season, item.seasonEpisode)}</span>
      {parts.map((p) => (
        <span key={p} className="before:content-['·'] before:mr-2 before:text-gray-200">
          {p}
        </span>
      ))}
      {item.hasPost && (
        <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          Resumen
        </span>
      )}
    </div>
  );
}

function Featured({ item }: { item: EpisodeItem }) {
  return (
    <EpisodeLink item={item} className="group block mb-12">
      <article className="grid md:grid-cols-5 gap-5 md:gap-8 items-center">
        <div className="md:col-span-3 relative aspect-video overflow-hidden rounded-2xl bg-gray-100">
          <EpisodeThumb item={item} large />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <PlayBadge large />
        </div>
        <div className="md:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Último episodio</p>
          <Meta item={item} />
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
            {item.title}
          </h2>
          {item.summary && <p className="mt-3 text-gray-500 leading-relaxed line-clamp-4">{item.summary}</p>}
          <span className="mt-4 inline-flex items-center text-sm font-medium text-red-600">
            {item.hasPost ? "Ver y leer" : "Escuchar"}
            <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </article>
    </EpisodeLink>
  );
}

function Card({ item }: { item: EpisodeItem }) {
  return (
    <EpisodeLink item={item} className="group block">
      <article>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
          <EpisodeThumb item={item} />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <PlayBadge />
        </div>
        <div className="mt-3">
          <Meta item={item} />
          <h3 className="mt-1 font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
            {item.title}
          </h3>
          {item.summary && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.summary}</p>}
        </div>
      </article>
    </EpisodeLink>
  );
}

export function EpisodesIndex({ posts }: { posts: ShelfPost[] }) {
  const [items, setItems] = useState<EpisodeItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [eps, vids] = await Promise.all([
        getJson<{ episodes?: ApiEpisode[] }>("/api/episodes"),
        getJson<{ videos?: ApiVideo[] }>("/api/youtube-videos"),
      ]);
      if (!cancelled) setItems(buildEpisodeItems(posts, eps?.episodes ?? null, vids?.videos ?? null));
    })();
    return () => {
      cancelled = true;
    };
  }, [posts]);

  if (!items) {
    return (
      <div className="animate-pulse">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-3 aspect-video rounded-2xl bg-gray-100" />
          <div className="md:col-span-2 space-y-3 self-center">
            <div className="h-3 w-24 rounded bg-gray-100" />
            <div className="h-8 w-3/4 rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-center py-20 text-gray-400 text-lg">Aún no hay episodios. ¡Vuelve pronto!</p>;
  }

  const [featured, ...rest] = items;
  const seasons = [...new Set(rest.map((i) => i.season))];

  return (
    <>
      <Featured item={featured} />
      <div className="space-y-12">
        {seasons.map((season) => {
          const eps = rest.filter((i) => i.season === season);
          return (
            <div key={season}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Temporada {season}</h2>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 font-medium">
                  {eps.length} episodio{eps.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {eps.map((item) => (
                  <Card key={item.key} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
