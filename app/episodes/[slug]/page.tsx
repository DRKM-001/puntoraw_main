import { notFound } from "next/navigation";

interface EpisodePageProps {
  params: {
    slug: string;
  };
}

// Mock episode data
const episodes: Record<string, any> = {
  "episode-1-exposing-raw-intentions": {
    episodeNumber: 1,
    title: "Exposing Raw Intentions",
    speaker: "Greg Anthony",
    date: "2026-05-21",
    audioUrl: "/audio/episode-1.mp3",
    summary:
      "In our first episode, Greg opens up about the raw intentions behind starting this mastermind.",
    content: `
# Exposing Raw Intentions

## Overview

In our inaugural episode of Punto Raw, Greg Anthony takes the stage to expose the raw intentions behind starting this mastermind. We dive deep into accountability, growth, and what it means to be authentic in a world of curated content.

## Key Topics

- What inspired the creation of Punto Raw
- The importance of accountability among peers
- Defining "raw intentions" and why it matters
- How we measure growth beyond metrics
- Building a culture of authenticity

## Quotes

> "Raw intentions. Accountability. Growth. That's the foundation of everything we're building here."

## Guest Bio

**Greg Anthony** is the founder of Dark Matter Systems, a strategic thinker with deep experience in systems design, operations, and building teams. He's passionate about authentic connection and building things that actually matter.

## Resources Mentioned

- Coming soon
    `,
  },
};

export default function EpisodePage({ params }: EpisodePageProps) {
  const episode = episodes[params.slug];

  if (!episode) {
    notFound();
  }

  const formattedDate = new Date(episode.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <a
          href="/episodes"
          className="text-slate-400 hover:text-white transition text-sm mb-8 inline-flex items-center"
        >
          ← Back to Episodes
        </a>

        <div className="mb-8">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Episode {episode.episodeNumber}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {episode.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-400">
            <p className="text-lg font-medium text-slate-300">{episode.speaker}</p>
            <span className="hidden sm:inline text-slate-600">•</span>
            <p>{formattedDate}</p>
          </div>
        </div>

        {/* Audio Player */}
        {episode.audioUrl && (
          <div className="mb-12 bg-slate-900 rounded-lg p-6">
            <p className="text-sm text-slate-400 mb-4 font-medium">LISTEN TO EPISODE</p>
            <audio
              controls
              className="w-full"
              style={{
                colorScheme: "dark",
              }}
            >
              <source src={episode.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-4 text-slate-300">
          {episode.content.split('\n').map((line: string, idx: number) => {
            if (line.startsWith('# ')) {
              return <h1 key={idx} className="text-3xl font-bold mt-8 mb-4 text-white">{line.slice(2)}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={idx} className="text-2xl font-bold mt-6 mb-3 text-white">{line.slice(3)}</h2>;
            }
            if (line.startsWith('- ')) {
              return <li key={idx} className="ml-4">{line.slice(2)}</li>;
            }
            if (line.startsWith('> ')) {
              return <blockquote key={idx} className="border-l-4 border-slate-600 pl-4 italic text-slate-300 my-4">{line.slice(2)}</blockquote>;
            }
            if (line.startsWith('**')) {
              return <p key={idx} className="font-semibold my-2">{line}</p>;
            }
            if (line.trim()) {
              return <p key={idx} className="my-4">{line}</p>;
            }
            return null;
          })}
        </div>
      </section>
    </div>
  );
}
