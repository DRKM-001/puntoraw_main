import type { Metadata } from "next";
import { EpisodeCard } from "@/components/episode-card";

export const metadata: Metadata = {
  title: "Episodios",
  description:
    "Escucha los episodios de Punto Raw — conversaciones mensuales sobre intenciones auténticas, responsabilidad y crecimiento personal.",
  openGraph: {
    title: "Episodios | .RAW Sessions",
    description:
      "Escucha los episodios de Punto Raw — conversaciones mensuales sobre intenciones auténticas, responsabilidad y crecimiento personal.",
  },
};

const episodes = [
  // Season 2
  {
    episodeNumber: 8,
    season: 2,
    seasonEpisode: 4,
    title: "Algo tiene que morir",
    speaker: "Punto Raw",
    date: "2026-08-08",
    duration: "1h 3min",
    summary:
      "Exploramos la entropía en la vida real — cómo nada se sostiene sin energía y por qué a veces lo más sano es dejar morir ciertas cosas para que nazcan otras nuevas.",
    slug: "s2-e4-algo-tiene-que-morir",
  },
  {
    episodeNumber: 7,
    season: 2,
    seasonEpisode: 3,
    title: "Conveniencia = Destrucción",
    speaker: "Punto Raw",
    date: "2026-07-03",
    duration: "1h 5min",
    summary:
      "Examinamos cómo la conveniencia tiene costos ocultos en tu vida — desde plásticos desechables hasta ingredientes procesados. Te retamos a abrazar alternativas incómodas.",
    slug: "s2-e3-conveniencia-destruccion",
  },
  {
    episodeNumber: 6,
    season: 2,
    seasonEpisode: 2,
    title: "¿Piensas o confías?",
    speaker: "Punto Raw",
    date: "2026-06-20",
    duration: "1h 3min",
    summary:
      "Hablamos sobre inteligencia artificial y si la gente realmente piensa críticamente sobre lo que la IA sugiere o simplemente confía sin cuestionar.",
    slug: "s2-e2-piensas-o-confias",
  },
  {
    episodeNumber: 5,
    season: 2,
    seasonEpisode: 1,
    title: "The Walking Dead",
    speaker: "Punto Raw",
    date: "2026-05-22",
    duration: "1h 15min",
    summary:
      "¿Te sientes como zombie en la vida? Exploramos qué significa realmente vivir, la diferencia entre metas y checkpoints, y por qué la disciplina supera a la motivación.",
    slug: "s2-e1-the-walking-dead",
  },
  // Season 1
  {
    episodeNumber: 4,
    season: 1,
    seasonEpisode: 4,
    title: "Cambio de mentalidad al éxito",
    speaker: "Punto Raw",
    date: "2025-03-31",
    duration: "1h 21min",
    summary:
      "Exploramos cuatro conceptos para transformar patrones de pensamiento: Genio Positivo, Arquitectura de Realidad, Metas Accesibles y Enfrentar la Oportunidad.",
    slug: "s1-e4-cambio-de-mentalidad",
  },
  {
    episodeNumber: 3,
    season: 1,
    seasonEpisode: 3,
    title: "Nunca te sientes listo... hasta que lo estás",
    speaker: "Punto Raw",
    date: "2025-03-04",
    duration: "1h 3min",
    summary:
      "Abordamos cómo el miedo a no estar preparados nos paraliza. El verdadero aprendizaje ocurre a través de la acción, no esperando a sentirte listo.",
    slug: "s1-e3-nunca-te-sientes-listo",
  },
  {
    episodeNumber: 2,
    season: 1,
    seasonEpisode: 2,
    title: "Si No Avanzas, Retrocedes",
    speaker: "Punto Raw",
    date: "2024-12-20",
    duration: "1h 4min",
    summary:
      "Exploramos el progreso a través de acción intencional — metas reales, productividad vs. estar ocupado, y confrontación personal.",
    slug: "s1-e2-si-no-avanzas-retrocedes",
  },
  {
    episodeNumber: 1,
    season: 1,
    seasonEpisode: 1,
    title: "Arrastras o te Arrastran",
    speaker: "Punto Raw",
    date: "2022-11-05",
    duration: "39min",
    summary:
      "Episodio piloto donde presentamos al grupo mastermind de emprendedores. La conversación que lo empezó todo.",
    slug: "s1-e1-arrastras-o-te-arrastran",
  },
];

export default function EpisodesPage() {
  // Group by season
  const season2 = episodes.filter((e) => e.season === 2);
  const season1 = episodes.filter((e) => e.season === 1);

  return (
    <div>
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-3">
          Todos los Episodios
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Sessions
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mb-6">
          Conversaciones mensuales sobre intenciones auténticas, responsabilidad
          y crecimiento.
        </p>

        {/* Platform Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://open.spotify.com/show/1xyVfSvuMnRbMcdClJJT3Y"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-gray-800 transition-colors text-sm font-medium text-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Spotify
          </a>
          <a
            href="https://podcasts.apple.com/co/podcast/punto-raw/id1653224018"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-gray-800 transition-colors text-sm font-medium text-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59-.12.947-.472.947-.36 0-.556-.244-.64-.736-.36-1.584-.876-2.676-1.87-3.736-1.4-1.488-3.18-2.256-5.27-2.256-2.463 0-4.622 1.2-5.956 3.24-.804 1.236-1.176 2.508-1.176 4.08 0 .276-.012.612.012.852.06.696-.348 1.068-.696 1.068-.384 0-.66-.348-.66-.876-.012-.492-.024-.852-.024-1.26 0-2.064.744-3.936 2.148-5.532C7.092 3.612 9.288 2.568 11.865 2.568zM12 7.128c1.656 0 3.108.768 4.14 2.04.636.78.96 1.548 1.116 2.676.06.468-.156.78-.516.78-.336 0-.552-.216-.612-.636-.168-1.236-.684-2.16-1.524-2.94-.804-.744-1.764-1.128-2.748-1.128-1.404 0-2.604.684-3.444 1.788-.516.684-.804 1.464-.804 2.412 0 .324.012.588.036.852.048.396-.192.684-.54.684-.384 0-.612-.288-.636-.72a8.72 8.72 0 01-.036-.972c0-1.344.516-2.58 1.488-3.588.972-1.008 2.256-1.548 3.636-1.548h.444zm-.12 4.332c.924 0 1.716.636 1.884 1.536.06.324.06.636 0 .948l-.744 3.78c-.108.552-.36.78-.66.78-.288 0-.54-.228-.648-.78l-.744-3.78a2.09 2.09 0 010-.948c.168-.9.996-1.536 1.912-1.536zm0 9.744c-.792 0-1.476-.672-1.476-1.464 0-.804.684-1.464 1.476-1.464.804 0 1.476.66 1.476 1.464 0 .792-.672 1.464-1.476 1.464z" />
            </svg>
            Apple Podcasts
          </a>
          <a
            href="https://www.youtube.com/channel/UCK0EHaEaACp8PE3zpcK6Y1w"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-gray-800 transition-colors text-sm font-medium text-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
              <path fill="black" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </a>
        </div>
      </section>

      {/* Season 2 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-6">
          Temporada 2
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {season2.map((episode) => (
            <EpisodeCard
              key={episode.slug}
              episodeNumber={episode.seasonEpisode}
              title={episode.title}
              speaker={episode.speaker}
              date={episode.date}
              summary={episode.summary}
              slug={episode.slug}
              duration={episode.duration}
              season={episode.season}
            />
          ))}
        </div>
      </section>

      {/* Season 1 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <h2 className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-6">
          Temporada 1
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {season1.map((episode) => (
            <EpisodeCard
              key={episode.slug}
              episodeNumber={episode.seasonEpisode}
              title={episode.title}
              speaker={episode.speaker}
              date={episode.date}
              summary={episode.summary}
              slug={episode.slug}
              duration={episode.duration}
              season={episode.season}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
