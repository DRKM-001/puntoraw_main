import { EpisodeCard } from "@/components/episode-card";

// Placeholder data - will be replaced with actual episodes
const episodes = [
  {
    episodeNumber: 1,
    title: "Exposing Raw Intentions",
    speaker: "Greg Anthony",
    date: "2026-05-21",
    summary: "In our first episode, Greg opens up about the raw intentions behind starting this mastermind. We dive deep into accountability, growth, and what it means to be authentic in a world of curated content.",
    slug: "episode-1-exposing-raw-intentions",
    imageUrl: "/episodes/ep1.jpg",
  },
];

export default function EpisodesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Episodes</h1>
        <p className="text-lg text-slate-400">
          Monthly conversations about raw intentions, accountability, and growth.
        </p>
      </section>

      {/* Episodes Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((episode) => (
              <EpisodeCard
                key={episode.slug}
                episodeNumber={episode.episodeNumber}
                title={episode.title}
                speaker={episode.speaker}
                date={episode.date}
                summary={episode.summary}
                slug={episode.slug}
                imageUrl={episode.imageUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No episodes yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
