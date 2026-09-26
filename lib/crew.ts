// The crew with living profiles (client-safe: used by pages and by the Pages Functions).
// `aliases` are the names people use for them on air — the AI uses them to attribute what was said.

export interface CrewMember {
  slug: string;
  name: string;
  aliases: string[];
  role: string;
  imageUrl: string;
  pixelUrl: string;
}

export const CREW: CrewMember[] = [
  {
    slug: "greg",
    name: "Greg Anthony",
    aliases: ["Greg", "Grego", "Greg Anthony"],
    role: "Crew",
    imageUrl: "/greg02.PNG",
    pixelUrl: "/greg_pxl.jpg",
  },
  {
    slug: "rafa",
    name: "Rafa",
    aliases: ["Rafa", "Rafael"],
    role: "Crew",
    imageUrl: "/rafa01.jpeg",
    pixelUrl: "/rafa_pxl.JPG",
  },
  {
    slug: "rj",
    name: "RJ",
    aliases: ["RJ", "Ramiro"],
    role: "Crew",
    imageUrl: "/RJ01.jpeg",
    pixelUrl: "/rj_pxl.JPG",
  },
];

export const CREW_SLUGS = CREW.map((m) => m.slug);

export function crewMember(slug: string) {
  return CREW.find((m) => m.slug === slug);
}

/** Kinds of observation the AI extracts from each episode */
export const OBS_KINDS = {
  postura: "Postura",
  cambio: "Cambio",
  tema: "Tema",
  frase: "Frase",
  pregunta: "Pregunta",
  fortaleza: "Fortaleza",
  reto: "Reto",
} as const;
export type ObsKind = keyof typeof OBS_KINDS;

/** Public observation (evidence and review data are never sent to the public API) */
export interface PublicObservation {
  id: number;
  kind: ObsKind;
  text: string;
  season: number | null;
  episode: number | null;
}

export interface Baseline {
  takenOn: string;
  code: string;
  /** 0–5 each; N is shown as emotional stability (higher = calmer) */
  scores: { E: number; O: number; A: number; C: number; N: number };
  season: number | null;
  episode: number | null;
}

/** What Markus writes when a profile is rebuilt */
export interface ProfileData {
  lectura: string;
  enMovimiento: string;
  temas: { tema: string; detalle: string }[];
  arco: { season: number; episode: number; texto: string }[];
  pregunta: { texto: string; season: number | null; episode: number | null } | null;
  fortalezas: string[];
  retos: string[];
  /** Latest episode the profile covers */
  hasta: { season: number; episode: number } | null;
}

export interface PublicProfile {
  member: string;
  profile: (ProfileData & { version: number; updatedAt: string }) | null;
  observations: PublicObservation[];
  baselines: Baseline[];
}

export function episodeCode(season?: number | null, episode?: number | null) {
  if (!season || !episode) return null;
  return `S${String(season).padStart(2, "0")}//EP${String(episode).padStart(3, "0")}`;
}
