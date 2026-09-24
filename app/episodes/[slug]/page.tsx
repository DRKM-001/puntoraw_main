import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { EpisodeDetail, type EpisodeData, type RelatedPost } from "@/components/episode-detail";

interface EpisodePageProps {
  params: Promise<{
    slug: string;
  }>;
}


// Episodes baked in at build time (SEO + instant render).
// Any episode added later through /upload (D1) still works: see components/episode-detail.tsx
// and functions/episodes/[slug].ts, which serves the "pendiente" shell for unknown slugs.
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

/** Placeholder page that renders any episode from D1 on the client. */
export const SHELL_SLUG = "pendiente";

export async function generateStaticParams() {
  return [...Object.keys(episodes), SHELL_SLUG].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = episodes[slug];
  if (!episode) return { title: "Episodio" };

  return {
    title: `${episode.title} — T${episode.season} Ep${episode.seasonEpisode}`,
    description: episode.summary,
    alternates: { canonical: `/episodes/${slug}` },
    openGraph: {
      title: `${episode.title} | .RAW Sessions`,
      description: episode.summary,
      type: "article",
    },
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;

  // Blog posts known at build time — matched to episodes by season + episode number
  const posts: RelatedPost[] = getAllPosts()
    .filter((p) => p.season && p.seasonEpisode)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      season: p.season!,
      seasonEpisode: p.seasonEpisode!,
      readingMinutes: p.readingMinutes,
      youtubeId: p.youtubeId,
      spotifyId: p.spotifyId,
      excerpt: p.excerpt,
    }));

  return <EpisodeDetail initial={episodes[slug] ?? null} posts={posts} isShell={slug === SHELL_SLUG} />;
}
