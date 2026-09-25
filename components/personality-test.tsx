"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ITEMS_PER_TRAIT,
  QUESTIONS,
  SCALE,
  TRAITS,
  scoreAnswers,
  typeCode,
  encodeAnswers,
  decodeAnswers,
  validAdjustedCode,
  lettersOf,
} from "@/lib/personality";

const STORAGE_KEY = "puntoraw-test-v3"; // v3 = Sí/No + notas + lectura con IA
const TOTAL = QUESTIONS.length;
const NOTE_MAX = 280;
const MAX_ROUNDS = 3; // first reading + up to 2 refinements

type Stage = "intro" | "questions" | "results";

interface Analysis {
  lectura: string;
  fortalezas: string[];
  puntosCiegos: string[];
  enEquipo: string;
  preguntaParaLaMesa: string;
  ajustes?: string;
  codigo: string;
  cambios: { rasgo: string; de: string; a: string }[];
}

/** One AI reading, plus the person's reaction to it (if they gave one) */
interface Round {
  analysis: Analysis;
  feedback?: string;
}

interface Saved {
  name: string;
  answers: (number | null)[];
  index: number;
  /** Optional per-question notes — private, never in share links */
  notes?: string[];
  rounds?: Round[];
  settled?: boolean;
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function persist(s: Saved | null) {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable (private mode) — progress just won't survive a refresh
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

export function PersonalityTest() {
  const [stage, setStage] = useState<Stage>("intro");
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL).fill(null));
  const [notes, setNotes] = useState<string[]>(Array(TOTAL).fill(""));
  const [index, setIndex] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [settled, setSettled] = useState(false);
  const [shared, setShared] = useState<{ code: string | null } | null>(null); // viewing someone's link
  const [loaded, setLoaded] = useState(false);

  // Keep localStorage in sync (not for shared links, and only after the initial load)
  useEffect(() => {
    if (!loaded || shared) return;
    const empty = stage === "intro" && answers.every((a) => a === null);
    persist(empty ? null : { name, answers, notes, index, rounds, settled });
  }, [loaded, name, answers, notes, index, rounds, settled, stage, shared]);

  // On load: a shared result link (?r=…&n=…&c=…) or resume saved progress
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromLink = decodeAnswers(params.get("r"));
    /* eslint-disable react-hooks/set-state-in-effect -- reading URL/localStorage once on mount */
    if (fromLink) {
      setAnswers(fromLink);
      setName(params.get("n")?.slice(0, 40) ?? "");
      setShared({ code: validAdjustedCode(scoreAnswers(fromLink), params.get("c")) });
      setStage("results");
      setLoaded(true);
      return;
    }
    const saved = load();
    if (saved && saved.answers?.length === TOTAL) {
      setName(saved.name ?? "");
      setAnswers(saved.answers);
      if (saved.notes?.length === TOTAL) setNotes(saved.notes);
      setRounds(saved.rounds ?? []);
      setSettled(!!saved.settled);
      const i = Math.min(saved.index ?? 0, TOTAL - 1);
      setIndex(i);
      setNoteOpen(!!saved.notes?.[i]);
      if (saved.answers.every((a) => a !== null)) setStage("results");
      else if (saved.answers.some((a) => a !== null)) setStage("questions");
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const goTo = (i: number) => {
    setIndex(i);
    setNoteOpen(!!notes[i]);
  };

  const answer = (value: number) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    if (index + 1 >= TOTAL) {
      setRounds([]);
      setSettled(false);
      setStage("results");
    } else {
      goTo(index + 1);
    }
    window.scrollTo(0, 0);
  };

  const restart = () => {
    persist(null);
    setAnswers(Array(TOTAL).fill(null));
    setNotes(Array(TOTAL).fill(""));
    setRounds([]);
    setSettled(false);
    setIndex(0);
    setNoteOpen(false);
    setShared(null);
    setStage("intro");
    window.history.replaceState(null, "", "/test");
    window.scrollTo(0, 0);
  };

  const begin = () => {
    setStage("questions");
    goTo(0);
  };

  if (!loaded) return <section className="min-h-[60vh]" />;

  // ───────────────────────── Intro ─────────────────────────
  if (stage === "intro") {
    return (
      <section className="max-w-xl mx-auto px-5 sm:px-6 pt-12 md:pt-20 pb-20">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
          {TOTAL} preguntas · ~5 min
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
          Test de personalidad
        </h1>
        <p className="text-gray-600 leading-7 mb-8">
          Descubre quién eres y el porqué de tus comportamientos. Contesta Sí o No; al final la IA
          te dice cómo te ve, y tú le dices qué acertó y qué no para afinar juntos tu lectura.
        </p>

        <ul className="space-y-2.5 text-sm text-gray-600 mb-10">
          {[
            "Contesta con lo que eres normalmente, no con lo que te gustaría ser.",
            "Si dudas, quédate con tu primera reacción.",
            "¿Quieres matizar? Agrega una nota antes de contestar.",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <span className="text-red-600">—</span>
              {t}
            </li>
          ))}
        </ul>

        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          onKeyDown={(e) => e.key === "Enter" && begin()}
          placeholder="Tu nombre"
          aria-label="Tu nombre"
          autoComplete="given-name"
          className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-lg mb-3 focus:outline-none focus:border-gray-900"
        />
        <button
          onClick={begin}
          className="w-full rounded-xl bg-gray-900 text-white font-semibold py-4 text-lg hover:bg-red-600 transition-colors"
        >
          Empezar
        </button>

        <p className="text-xs text-gray-400 mt-8 leading-relaxed">
          Preguntas del International Personality Item Pool (dominio público). Herramienta de
          autoconocimiento y conversación, no un diagnóstico psicológico.
        </p>
      </section>
    );
  }

  // ───────────────────────── Questions ─────────────────────────
  if (stage === "questions") {
    const q = QUESTIONS[index];
    const current = answers[index];
    return (
      <section className="max-w-xl mx-auto px-5 sm:px-6 pt-8 md:pt-14 pb-20">
        <div className="flex items-end justify-between gap-4 mb-2">
          <p className="font-mono text-sm font-semibold text-gray-900">
            {pad(index + 1)}
            <span className="text-gray-300">/{pad(TOTAL)}</span>
          </p>
          {name && <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400">{name}</p>}
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-12">
          <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(index / TOTAL) * 100}%` }} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-snug mb-8 min-h-[4.5rem]">
          {q.text}
        </h2>

        {/* Optional note — write it first, then answer */}
        <div className="mb-5">
          {noteOpen ? (
            <>
              <textarea
                value={notes[index]}
                onChange={(e) => {
                  const next = [...notes];
                  next[index] = e.target.value.slice(0, NOTE_MAX);
                  setNotes(next);
                }}
                rows={2}
                autoFocus
                placeholder="Ej. Sí, pero solo con gente de confianza…"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base leading-6 focus:outline-none focus:border-gray-900 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right font-mono">
                {notes[index].length}/{NOTE_MAX}
              </p>
            </>
          ) : (
            <button onClick={() => setNoteOpen(true)} className="text-sm text-gray-400 hover:text-gray-900 py-1">
              + Agregar nota
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SCALE.map((opt) => (
            <button
              key={opt.value}
              onClick={() => answer(opt.value)}
              className={`rounded-2xl border-2 py-7 sm:py-9 text-3xl font-bold tracking-tight transition-colors ${
                current === opt.value
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-gray-200 text-gray-900 hover:border-gray-900 active:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 text-sm">
          <button
            onClick={() => goTo(Math.max(0, index - 1))}
            disabled={index === 0}
            className="text-gray-400 hover:text-gray-900 disabled:invisible py-2"
          >
            ← Anterior
          </button>
          {current !== null && index < TOTAL - 1 && (
            <button onClick={() => goTo(index + 1)} className="text-gray-400 hover:text-gray-900 py-2">
              Siguiente →
            </button>
          )}
        </div>
      </section>
    );
  }

  // ───────────────────────── Results ─────────────────────────
  return (
    <Results
      name={name}
      answers={answers.map((a) => a ?? 0)}
      notes={shared ? [] : notes}
      rounds={rounds}
      setRounds={setRounds}
      settled={settled}
      setSettled={setSettled}
      shared={shared}
      onRestart={restart}
    />
  );
}

// ───────────────────────── Results ─────────────────────────
function Results({
  name,
  answers,
  notes,
  rounds,
  setRounds,
  settled,
  setSettled,
  shared,
  onRestart,
}: {
  name: string;
  answers: number[];
  notes: string[];
  rounds: Round[];
  setRounds: (r: Round[]) => void;
  settled: boolean;
  setSettled: (b: boolean) => void;
  shared: { code: string | null } | null;
  onRestart: () => void;
}) {
  const scores = scoreAnswers(answers);
  const baseCode = typeCode(scores).code;
  const latest = rounds[rounds.length - 1]?.analysis;
  const code = shared ? (shared.code ?? baseCode) : (latest?.codigo ?? baseCode);
  const letters = lettersOf(code);

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const answersKey = encodeAnswers(answers);
  const request = useCallback(
    async (history: { reading: string; feedback: string }[], prev: Round[]) => {
      setStatus("loading");
      setError("");
      try {
        const res = await fetch("/api/personality-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: answersKey, name, notes, history }),
        });
        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? ((await res.json()) as { analysis?: Analysis; error?: string }) : {};
        if (!res.ok || !data.analysis) {
          throw new Error(data.error || "La lectura con IA no está disponible en este momento.");
        }
        setRounds([...prev, { analysis: data.analysis }]);
        setStatus("idle");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Algo salió mal.");
        setStatus("error");
      }
    },
    [answersKey, name, notes, setRounds]
  );

  // Start the first reading automatically on submission
  const started = useRef(false);
  useEffect(() => {
    if (rounds.length || started.current) return;
    started.current = true;
    request([], []);
  }, [rounds.length, request]);

  const historyOf = (rs: Round[]) =>
    rs.filter((r) => r.feedback).map((r) => ({ reading: r.analysis.lectura, feedback: r.feedback! }));

  const refine = (feedback: string) => {
    const withFeedback = rounds.map((r, i) => (i === rounds.length - 1 ? { ...r, feedback } : r));
    setRounds(withFeedback);
    request(historyOf(withFeedback), withFeedback);
    document.getElementById("lectura")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/test?r=${answersKey}${name ? `&n=${encodeURIComponent(name)}` : ""}${
          code !== baseCode ? `&c=${code}` : ""
        }`
      : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia este link:", shareUrl);
    }
  };

  const canRefine = !shared && !settled && rounds.length > 0 && rounds.length < MAX_ROUNDS && status === "idle";
  const refinedCount = Math.max(0, rounds.length - 1);

  return (
    <section className="max-w-xl mx-auto px-5 sm:px-6 pt-10 md:pt-16 pb-20">
      {/* Header */}
      <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
        {shared ? "Resultado" : "Tu resultado"}
        {name ? ` · ${name}` : ""}
      </p>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">{code}</h1>
      <p className="text-gray-500 mt-2">{letters.map((l) => l.name).join(" · ")}</p>
      {code !== baseCode && (
        <p className="text-[11px] text-gray-400 mt-2 font-mono uppercase tracking-widest">
          Afinado · el test dio {baseCode}
        </p>
      )}

      {/* Traits — compact */}
      <div className="mt-8 space-y-2.5">
        {TRAITS.map((t) => {
          const v = scores[t.key];
          return (
            <div
              key={t.key}
              className="grid grid-cols-[8.5rem_1fr_auto] sm:grid-cols-[10rem_1fr_auto] items-center gap-3"
            >
              <span className="text-sm text-gray-600 truncate">{t.name}</span>
              <span className="grid grid-cols-5 gap-0.5">
                {Array.from({ length: ITEMS_PER_TRAIT }, (_, i) => (
                  <span key={i} className={`h-1.5 rounded-full ${i < v ? "bg-red-600" : "bg-gray-100"}`} />
                ))}
              </span>
              <span className="font-mono text-xs text-gray-400 w-6 text-right">{v}/5</span>
            </div>
          );
        })}
      </div>

      {/* Reading */}
      <div id="lectura" className="mt-12 pt-10 border-t border-gray-100 scroll-mt-24">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Cómo te veo</h2>
          {refinedCount > 0 && status !== "loading" && (
            <span className="text-[11px] font-mono uppercase tracking-widest text-red-600">
              Afinada ×{refinedCount}
            </span>
          )}
        </div>

        {status === "loading" && (
          <div aria-live="polite">
            <p className="text-gray-500 mb-4">
              {rounds.length ? "Pensando en lo que me dijiste…" : "Leyendo tus respuestas…"}
            </p>
            <div className="space-y-2.5 animate-pulse">
              {["w-full", "w-11/12", "w-full", "w-4/5", "w-2/3"].map((w, i) => (
                <div key={i} className={`h-3.5 bg-gray-100 rounded ${w}`} />
              ))}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mb-6">
            <p className="text-gray-600 mb-3">{error}</p>
            <button
              onClick={() => request(historyOf(rounds), rounds)}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Intentar de nuevo →
            </button>
          </div>
        )}

        {status !== "loading" && latest && (
          <article>
            {latest.ajustes && (
              <p className="text-sm text-gray-500 border-l-2 border-red-600 pl-3 mb-5">
                <span className="font-semibold text-gray-900">Lo que ajusté: </span>
                {latest.ajustes}
              </p>
            )}
            <p className="text-lg text-gray-900 leading-8">{latest.lectura}</p>

            <div className="grid gap-6 sm:grid-cols-2 mt-8">
              <ReadingList title="Fortalezas" items={latest.fortalezas} />
              <ReadingList title="Puntos ciegos" items={latest.puntosCiegos} />
            </div>

            {latest.enEquipo && (
              <p className="text-gray-600 leading-7 mt-6">
                <span className="font-semibold text-gray-900">En grupo: </span>
                {latest.enEquipo}
              </p>
            )}

            {latest.preguntaParaLaMesa && (
              <div className="rounded-2xl bg-gray-900 text-white p-6 mt-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-red-400 mb-2">
                  Pregunta para la mesa
                </p>
                <p className="text-lg font-semibold leading-snug">{latest.preguntaParaLaMesa}</p>
              </div>
            )}
          </article>
        )}
      </div>

      {/* Feedback loop */}
      {canRefine && (
        <Feedback key={rounds.length} round={rounds.length} onSettle={() => setSettled(true)} onRefine={refine} />
      )}
      {!shared && status === "idle" && latest && (settled || rounds.length >= MAX_ROUNDS) && (
        <p className="mt-10 text-sm text-gray-500">
          <span className="font-semibold text-gray-900">Lectura final.</span> Copia tu link para
          compararte con los demás.
        </p>
      )}

      {/* Letters (collapsed) */}
      <details className="group mt-12 border-t border-gray-100 pt-6">
        <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-gray-900">
          ¿Qué significa {code}?
          <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
        </summary>
        <dl className="mt-5 space-y-3">
          {letters.map((l, i) => (
            <div key={i} className="flex gap-4">
              <dt className="w-5 font-bold text-red-600">{l.letter}</dt>
              <dd className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{l.name}.</span> {l.description}
              </dd>
            </div>
          ))}
        </dl>
      </details>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button
          onClick={copy}
          className="flex-1 rounded-xl bg-gray-900 text-white font-semibold py-3.5 hover:bg-red-600 transition-colors"
        >
          {copied ? "¡Link copiado!" : "Copiar link de resultado"}
        </button>
        <button
          onClick={onRestart}
          className="flex-1 rounded-xl border border-gray-200 font-semibold py-3.5 text-gray-900 hover:border-gray-900 transition-colors"
        >
          {shared ? "Hacer el test" : "Repetir el test"}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-8 leading-relaxed">
        La lectura la genera una IA a partir de tus respuestas{notes.some(Boolean) ? " y notas" : ""}.
        Es un punto de partida para conocerte y platicarlo, no una etiqueta.{" "}
        <Link href="/episodes" className="underline hover:text-gray-600">
          Escucha el podcast
        </Link>
        .
      </p>
    </section>
  );
}

// ───────────────────────── Feedback ─────────────────────────
const REACTIONS = [
  { key: "si", label: "Muy acertado" },
  { key: "parte", label: "En parte" },
  { key: "no", label: "No mucho" },
] as const;

function Feedback({
  round,
  onSettle,
  onRefine,
}: {
  round: number;
  onSettle: () => void;
  onRefine: (feedback: string) => void;
}) {
  const [reaction, setReaction] = useState<(typeof REACTIONS)[number]["key"] | null>(null);
  const [text, setText] = useState("");

  const submit = () => {
    const label = REACTIONS.find((r) => r.key === reaction)?.label ?? "";
    onRefine(`${label}${text.trim() ? `. ${text.trim()}` : ""}`);
  };

  return (
    <div className="mt-10 rounded-2xl border border-gray-200 p-5 sm:p-6">
      <h3 className="font-semibold text-gray-900">{round === 1 ? "¿Qué tan acertado es?" : "¿Y ahora?"}</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Dime qué sí y qué no. A veces uno contesta por impulso; tu respuesta afina la lectura.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            onClick={() => setReaction(r.key)}
            className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
              reaction === r.key
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-700 hover:border-gray-900"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {reaction === "si" && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onSettle}
            className="flex-1 rounded-xl bg-red-600 text-white font-semibold py-3 hover:bg-red-700 transition-colors"
          >
            Quedarme con esta lectura
          </button>
          <button
            onClick={() => setReaction("parte")}
            className="flex-1 rounded-xl border border-gray-200 text-gray-700 font-medium py-3 hover:border-gray-900"
          >
            Agregar un matiz
          </button>
        </div>
      )}

      {(reaction === "parte" || reaction === "no") && (
        <div className="mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 600))}
            rows={4}
            autoFocus
            placeholder="Ej. Tienes razón en lo de la calma, pero no soy tan cerrado: con mi gente soy el que organiza todo…"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base leading-6 focus:outline-none focus:border-gray-900 resize-none"
          />
          <button
            onClick={submit}
            disabled={text.trim().length < 5}
            className="mt-2 w-full rounded-xl bg-red-600 text-white font-semibold py-3 hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            Afinar mi lectura
          </button>
        </div>
      )}
    </div>
  );
}

function ReadingList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{title}</h3>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="text-gray-700 leading-6">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
