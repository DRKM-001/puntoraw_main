import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { EpisodesIndex } from "@/components/episodes-index";
import type { ShelfPost } from "@/lib/episode-items";

export const metadata: Metadata = {
  title: "Episodios",
  description:
    "Todos los episodios de .RAW Sessions — video, audio y el resumen de cada conversación.",
  alternates: { canonical: "/episodes" },
};

export default function EpisodesPage() {
  const posts: ShelfPost[] = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt,
    duration: p.duration,
    season: p.season,
    seasonEpisode: p.seasonEpisode,
    youtubeId: p.youtubeId,
  }));

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-8">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">Podcast</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Episodios</h1>
        <p className="text-gray-500">
          Mira, escucha o lee cada conversación sobre intenciones auténticas, responsabilidad y crecimiento.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <EpisodesIndex posts={posts} />
      </section>
    </div>
  );
}
