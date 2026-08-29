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
  const formattedDate = new Date(date).toLocaleDateString("es-419", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/episodes/${slug}`}>
      <article className="group border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition bg-gray-50/50 hover:bg-gray-50 h-full flex flex-col cursor-pointer">
        {/* Image */}
        {imageUrl && (
          <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
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
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
              Episodio {episodeNumber}
            </span>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-gray-500 mb-4">{speaker}</p>

          <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
            {summary}
          </p>

          <div className="flex items-center text-sm font-medium text-red-600 group-hover:gap-2 transition">
            Escuchar
            <span className="ml-1 group-hover:translate-x-1 transition">→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
