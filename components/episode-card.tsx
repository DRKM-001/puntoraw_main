import Link from "next/link";
import Image from "next/image";

interface EpisodeCardProps {
  title: string;
  speaker: string;
  date: string;
  summary: string;
  episodeNumber: number;
  imageUrl?: string;
  slug: string;
}

export function EpisodeCard({
  title,
  speaker,
  date,
  summary,
  episodeNumber,
  imageUrl,
  slug,
}: EpisodeCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/episodes/${slug}`}>
      <article className="group border border-slate-800 rounded-lg overflow-hidden hover:border-slate-600 transition bg-slate-900/50 hover:bg-slate-900 h-full flex flex-col cursor-pointer">
        {/* Image */}
        {imageUrl && (
          <div className="relative w-full h-40 bg-slate-800 overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Episode {episodeNumber}
            </span>
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-slate-100 transition line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-slate-400 mb-4">{speaker}</p>

          <p className="text-sm text-slate-300 mb-4 flex-1 line-clamp-3">
            {summary}
          </p>

          <div className="flex items-center text-sm font-medium text-white group-hover:gap-2 transition">
            Read More
            <span className="ml-1 group-hover:translate-x-1 transition">→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
