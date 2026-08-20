import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EpisodePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface EpisodeData {
  episodeNumber: number;
  season: number;
  seasonEpisode: number;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  summary: string;
  topics: string[];
  quote?: string;
  spotifyId?: string;
}

// All episodes data
const episodes: Record<string, EpisodeData> = {
  // Season 2
  "s2-e4-algo-tiene-que-morir": {
    episodeNumber: 8,
    season: 2,
    seasonEpisode: 4,
    title: "Algo tiene que morir",
    speaker: "Punto Raw",
    date: "2026-08-08",
    duration: "1h 3min",
    summary:
      "Exploramos la entropía en la vida real — cómo nada se sostiene sin energía y por qué a veces lo más sano es dejar morir ciertas cosas para que nazcan otras nuevas.",
    topics: [
      "Entropía aplicada a la vida cotidiana",
      "El costo de mantener lo que ya no funciona",
      "Dejar ir para crear espacio nuevo",
      "Ciclos naturales de muerte y renacimiento",
      "Energía y mantenimiento en relaciones, proyectos y hábitos",
    ],
    quote:
      "A veces lo más sano es dejar morir ciertas cosas para que nazcan otras nuevas.",
    spotifyId: "7d7Sc1iNzC1Hz1kJqVlWt7",
  },
  "s2-e3-conveniencia-destruccion": {
    episodeNumber: 7,
    season: 2,
    seasonEpisode: 3,
    title: "Conveniencia = Destrucción",
    speaker: "Punto Raw",
    date: "2026-07-03",
    duration: "1h 5min",
    summary:
      "Examinamos cómo la conveniencia tiene costos ocultos en tu vida — desde plásticos desechables hasta ingredientes procesados. Te retamos a abrazar alternativas incómodas.",
    topics: [
      "Costos ocultos de la conveniencia moderna",
      "Plásticos desechables y su impacto real",
      "Ingredientes procesados vs. alternativas naturales",
      "El reto de elegir lo incómodo a propósito",
      "Consumismo consciente",
    ],
    quote:
      "La conveniencia tiene costos ocultos que estamos pagando sin darnos cuenta.",
    spotifyId: "5t3RZujk56q0OmDNDqNW7L",
  },
  "s2-e2-piensas-o-confias": {
    episodeNumber: 6,
    season: 2,
    seasonEpisode: 2,
    title: "¿Piensas o confías?",
    speaker: "Punto Raw",
    date: "2026-06-20",
    duration: "1h 3min",
    summary:
      "Hablamos sobre inteligencia artificial y si la gente realmente piensa críticamente sobre lo que la IA sugiere o simplemente confía sin cuestionar.",
    topics: [
      "Inteligencia artificial en la vida diaria",
      "Pensamiento crítico vs. confianza ciega",
      "El peligro de delegar decisiones a la tecnología",
      "Cómo mantener tu criterio propio",
      "El futuro de la relación humano-IA",
    ],
    quote:
      "¿Realmente piensas críticamente sobre lo que la IA te sugiere o simplemente confías sin cuestionar?",
    spotifyId: "3VreLNayXOMjeSsnO7pDZt",
  },
  "s2-e1-the-walking-dead": {
    episodeNumber: 5,
    season: 2,
    seasonEpisode: 1,
    title: "The Walking Dead",
    speaker: "Punto Raw",
    date: "2026-05-22",
    duration: "1h 15min",
    summary:
      "¿Te sientes como zombie en la vida? Exploramos qué significa realmente vivir, la diferencia entre metas y checkpoints, y por qué la disciplina supera a la motivación.",
    topics: [
      "La diferencia entre existir y vivir",
      "Metas vs. checkpoints — y por qué importa",
      "Disciplina sobre motivación",
      "Señales de que estás en piloto automático",
      "Cómo despertar y tomar control",
    ],
    quote:
      "La disciplina supera a la motivación porque la motivación es temporal, la disciplina es una decisión.",
    spotifyId: "5QIPCJaU40wkoRpJ9BVDzE",
  },
  // Season 1
  "s1-e4-cambio-de-mentalidad": {
    episodeNumber: 4,
    season: 1,
    seasonEpisode: 4,
    title: "Cambio de mentalidad al éxito",
    speaker: "Punto Raw",
    date: "2025-03-31",
    duration: "1h 21min",
    summary:
      "Exploramos cuatro conceptos para transformar patrones de pensamiento: Genio Positivo, Arquitectura de Realidad, Metas Accesibles y Enfrentar la Oportunidad.",
    topics: [
      "Genio Positivo — canalizar tu energía mental",
      "Arquitectura de Realidad — diseñar tu entorno",
      "Metas Accesibles — lo alcanzable como trampolín",
      "Enfrentar la Oportunidad — actuar cuando se presenta",
    ],
    quote:
      "Transforma tus patrones de pensamiento y transformarás tu realidad.",
    spotifyId: "6xYI0jDvLegUljKvzky5vi",
  },
  "s1-e3-nunca-te-sientes-listo": {
    episodeNumber: 3,
    season: 1,
    seasonEpisode: 3,
    title: "Nunca te sientes listo... hasta que lo estás",
    speaker: "Punto Raw",
    date: "2025-03-04",
    duration: "1h 3min",
    summary:
      "Abordamos cómo el miedo a no estar preparados nos paraliza. El verdadero aprendizaje ocurre a través de la acción, no esperando a sentirte listo.",
    topics: [
      "El mito de estar 'listo'",
      "Parálisis por análisis",
      "Aprender haciendo vs. aprender planeando",
      "Ejemplos reales de lanzarse sin estar preparado",
      "Cómo el miedo disfraza la procrastinación",
    ],
    quote:
      "El verdadero aprendizaje ocurre a través de la acción, no esperando a sentirte listo.",
    spotifyId: "5ilMRgwvC72LxMBjhY5qC7",
  },
  "s1-e2-si-no-avanzas-retrocedes": {
    episodeNumber: 2,
    season: 1,
    seasonEpisode: 2,
    title: "Si No Avanzas, Retrocedes",
    speaker: "Punto Raw",
    date: "2024-12-20",
    duration: "1h 4min",
    summary:
      "Exploramos el progreso a través de acción intencional — metas reales, productividad vs. estar ocupado, y confrontación personal.",
    topics: [
      "El estancamiento como retroceso",
      "Metas reales vs. metas de ego",
      "Productividad vs. estar ocupado",
      "Confrontación personal y honestidad",
      "Acción intencional como motor del progreso",
    ],
    quote:
      "No existe quedarse quieto — o avanzas, o retrocedes.",
    spotifyId: "1ShhNM0WE89japKcGqBBis",
  },
  "s1-e1-arrastras-o-te-arrastran": {
    episodeNumber: 1,
    season: 1,
    seasonEpisode: 1,
    title: "Arrastras o te Arrastran",
    speaker: "Punto Raw",
    date: "2022-11-05",
    duration: "39min",
    summary:
      "Episodio piloto donde presentamos al grupo mastermind de emprendedores. La conversación que lo empezó todo.",
    topics: [
      "Origen del grupo mastermind",
      "Presentación de los miembros",
      "La filosofía detrás de Punto Raw",
      "Tomar las riendas de tu vida",
      "La importancia de rodearte de las personas correctas",
    ],
    quote:
      "O arrastras o te arrastran — tú decides.",
    spotifyId: "23xpSSaXeVq2db3m3CI0C",
  },
};

export async function generateStaticParams() {
  return Object.keys(episodes).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = episodes[slug];
  if (!episode) return { title: "Episodio No Encontrado" };

  return {
    title: `${episode.title} — T${episode.season} Ep${episode.seasonEpisode}`,
    description: episode.summary,
    openGraph: {
      title: `${episode.title} | .RAW Sessions`,
      description: episode.summary,
      type: "article",
    },
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;
  const episode = episodes[slug];

  if (!episode) {
    notFound();
  }

  const formattedDate = new Date(episode.date).toLocaleDateString("es-419", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        <Link
          href="/episodes"
          className="text-gray-400 hover:text-gray-900 transition text-sm mb-8 inline-flex items-center py-2"
        >
          ← Volver a Episodios
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">
            Temporada {episode.season} · Episodio {episode.seasonEpisode}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {episode.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500">
            <p className="text-lg font-medium text-gray-700">
              {episode.speaker}
            </p>
            <span className="hidden sm:inline text-gray-300">·</span>
            <p>{formattedDate}</p>
            <span className="hidden sm:inline text-gray-300">·</span>
            <p>{episode.duration}</p>
          </div>
        </div>

        {/* Spotify Embedded Player */}
        {episode.spotifyId && (
          <div className="mb-12">
            <iframe
              src={`https://open.spotify.com/embed/episode/${episode.spotifyId}?utm_source=generator`}
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
            />
          </div>
        )}
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        {/* Summary */}
        <p className="text-lg text-gray-600 leading-relaxed mb-10">
          {episode.summary}
        </p>

        {/* Topics */}
        {episode.topics.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Temas Principales
            </h2>
            <ul className="space-y-2">
              {episode.topics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-600">
                  <span className="text-red-500 mt-1 text-sm">●</span>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quote */}
        {episode.quote && (
          <blockquote className="border-l-4 border-red-500 pl-6 py-2 my-10">
            <p className="text-xl italic text-gray-700 leading-relaxed">
              &ldquo;{episode.quote}&rdquo;
            </p>
          </blockquote>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/episodes"
            className="text-sm font-medium text-red-600 hover:text-red-700 transition"
          >
            ← Ver todos los episodios
          </Link>
        </div>
      </section>
    </div>
  );
}
