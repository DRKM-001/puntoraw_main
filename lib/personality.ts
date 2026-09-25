// Big Five baseline, answered Sí / No.
// Items 1–20: Mini-IPIP (Donnellan, Oswald, Baird & Lucas, 2006).
// Items 21–25: one extra marker per trait from the IPIP Big-Five factor markers (Goldberg, 1992),
// so each trait has 5 yes/no items → an odd count, so every trait always has a clear majority.
// All items are from the International Personality Item Pool (IPIP), public domain.
// Spanish wording adapted for Latin American Spanish, phrased without negations
// ("No ...") so that answering Sí / No is never a double negative.

export type Trait = "E" | "A" | "C" | "N" | "O";

export interface Question {
  text: string;
  trait: Trait;
  /** true = agreeing means LESS of the trait (score is reversed) */
  reverse: boolean;
}

// Original item order (traits rotate so nobody can "game" a block)
export const QUESTIONS: Question[] = [
  { text: "Soy el alma de la fiesta.", trait: "E", reverse: false },
  { text: "Me identifico con los sentimientos de los demás.", trait: "A", reverse: false },
  { text: "Hago mis pendientes de inmediato.", trait: "C", reverse: false },
  { text: "Tengo cambios de humor frecuentes.", trait: "N", reverse: false },
  { text: "Tengo una imaginación muy viva.", trait: "O", reverse: false },
  { text: "Soy de pocas palabras.", trait: "E", reverse: true },
  { text: "Los problemas de otras personas me tienen sin cuidado.", trait: "A", reverse: true },
  { text: "Con frecuencia olvido regresar las cosas a su lugar.", trait: "C", reverse: true },
  { text: "Estoy relajado la mayor parte del tiempo.", trait: "N", reverse: true },
  { text: "Las ideas abstractas me aburren.", trait: "O", reverse: true },
  { text: "En las reuniones platico con mucha gente distinta.", trait: "E", reverse: false },
  { text: "Siento las emociones de los demás.", trait: "A", reverse: false },
  { text: "Me gusta el orden.", trait: "C", reverse: false },
  { text: "Me altero con facilidad.", trait: "N", reverse: false },
  { text: "Me cuesta entender las ideas abstractas.", trait: "O", reverse: true },
  { text: "Prefiero quedarme en segundo plano.", trait: "E", reverse: true },
  { text: "En general, la gente me interesa poco.", trait: "A", reverse: true },
  { text: "Suelo hacer un desorden de las cosas.", trait: "C", reverse: true },
  { text: "Casi siempre estoy de buen ánimo.", trait: "N", reverse: true },
  { text: "Soy poco imaginativo.", trait: "O", reverse: true },
  { text: "Me siento cómodo con la gente.", trait: "E", reverse: false },
  { text: "Hago que los demás se sientan a gusto.", trait: "A", reverse: false },
  { text: "Pongo atención a los detalles.", trait: "C", reverse: false },
  { text: "Me preocupo mucho por las cosas.", trait: "N", reverse: false },
  { text: "Estoy lleno de ideas.", trait: "O", reverse: false },
];

export const ITEMS_PER_TRAIT = 5;

/** 1 = Sí, 0 = No */
export const SCALE = [
  { value: 1, label: "Sí" },
  { value: 0, label: "No" },
];

export interface TraitInfo {
  key: Trait;
  name: string;
  low: string;
  high: string;
  description: string;
}

/** Display order. Neuroticism is shown flipped as "Estabilidad emocional". */
export const TRAITS: TraitInfo[] = [
  {
    key: "E",
    name: "Extraversión",
    low: "Reservado",
    high: "Sociable",
    description: "Cuánta energía sacas de la gente, la conversación y la acción.",
  },
  {
    key: "O",
    name: "Apertura",
    low: "Práctico",
    high: "Imaginativo",
    description: "Tu gusto por ideas nuevas, lo abstracto y la creatividad.",
  },
  {
    key: "A",
    name: "Amabilidad",
    low: "Directo",
    high: "Empático",
    description: "Qué tanto priorizas la armonía y los sentimientos de los demás.",
  },
  {
    key: "C",
    name: "Responsabilidad",
    low: "Flexible",
    high: "Organizado",
    description: "Tu disciplina, orden y forma de cumplir lo que empiezas.",
  },
  {
    key: "N",
    name: "Estabilidad emocional",
    low: "Sensible",
    high: "Sereno",
    description: "Qué tan estable te mantienes bajo presión y ante los cambios.",
  },
];

/** Points per trait, 0–5. N is stored flipped as stability (higher = calmer). */
export type Scores = Record<Trait, number>;

/** answers: 25 values, 1 = Sí, 0 = No */
export function scoreAnswers(answers: number[]): Scores {
  const sums: Record<Trait, number> = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  QUESTIONS.forEach((q, i) => {
    const yes = answers[i] === 1 ? 1 : 0;
    sums[q.trait] += q.reverse ? 1 - yes : yes;
  });
  return { ...sums, N: ITEMS_PER_TRAIT - sums.N };
}

export interface LetterInfo {
  letter: string;
  name: string;
  description: string;
}

export const LETTERS: Record<string, LetterInfo> = {
  E: { letter: "E", name: "Extrovertido", description: "Recargas energía con gente y acción." },
  I: { letter: "I", name: "Introvertido", description: "Recargas energía en calma o a solas." },
  N: { letter: "N", name: "Intuitivo", description: "Te atraen las ideas, patrones y posibilidades." },
  S: { letter: "S", name: "Observador", description: "Te enfocas en lo concreto, práctico y comprobado." },
  F: { letter: "F", name: "Sentimental", description: "Decides pensando en valores y en las personas." },
  T: { letter: "T", name: "Pensador", description: "Decides con lógica y criterios objetivos." },
  J: { letter: "J", name: "Planificador", description: "Te gusta la estructura, los planes y cerrar pendientes." },
  P: { letter: "P", name: "Explorador", description: "Prefieres la flexibilidad y dejar opciones abiertas." },
  A: { letter: "A", name: "Seguro", description: "Te mantienes estable bajo presión." },
  X: { letter: "T", name: "Turbulento", description: "Eres autoexigente y sientes las cosas con intensidad." },
};

/** Myers-Briggs-style code derived from Big Five scores (like 16Personalities) */
export function typeCode(s: Scores) {
  const letters = [
    s.E >= 3 ? "E" : "I",
    s.O >= 3 ? "N" : "S",
    s.A >= 3 ? "F" : "T",
    s.C >= 3 ? "J" : "P",
  ];
  const identity = s.N >= 3 ? "A" : "X"; // X = Turbulent (shown as "T")
  return {
    code: `${letters.join("")}-${identity === "A" ? "A" : "T"}`,
    letters: [...letters, identity].map((l) => LETTERS[l]),
  };
}

// ── Share links: answers encoded as 25 digits (1 = Sí, 0 = No), e.g. ?r=10110...&n=Greg ──
export function encodeAnswers(answers: number[]) {
  return answers.map((a) => String(a)).join("");
}

export function decodeAnswers(r: string | null): number[] | null {
  if (!r || !new RegExp(`^[01]{${QUESTIONS.length}}$`).test(r)) return null;
  return r.split("").map(Number);
}

/**
 * A fine-tuned code (after AI + feedback) may only differ from the test's code
 * on traits that are near the middle (2 or 3 of 5). Returns the code if valid, else null.
 */
export function validAdjustedCode(s: Scores, code: string | null): string | null {
  if (!code || !/^[EI][NS][FT][JP]-[AT]$/.test(code)) return null;
  const base = typeCode(s).code;
  const order: Trait[] = ["E", "O", "A", "C", "N"];
  const pos = [0, 1, 2, 3, 5];
  for (let i = 0; i < order.length; i++) {
    const v = s[order[i]];
    if (code[pos[i]] !== base[pos[i]] && v !== 2 && v !== 3) return null;
  }
  return code;
}

/** Letter info for any code like "ESTP-A" */
export function lettersOf(code: string) {
  const [l, id] = code.split("-");
  return [...l.split(""), id === "A" ? "A" : "X"].map((k) => LETTERS[k]);
}
