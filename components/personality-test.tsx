"use client";

import { useEffect, useState } from "react";
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
} from "@/lib/personality";

const STORAGE_KEY = "puntoraw-test-v2"; // v2 = Sí/No, 25 preguntas
const TOTAL = QUESTIONS.length;

type Stage = "intro" | "questions" | "results";

interface Saved {
  name: string;
  answers: (number | null)[];
  index: number;
  /** Optional per-question notes ("explica tu respuesta") — kept private, never in share links */
  notes?: string[];
}

const NOTE_MAX = 280;

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(s: Saved | null) {
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
  const [index, setIndex] = useState(0);
  const [notes, setNotes] = useState<string[]>(Array(TOTAL).fill(""));
  const [noteOpen, setNoteOpen] = useState(false);
  const [shared, setShared] = useState(false); // viewing someone's shared link
  const [copied, setCopied] = useState(false);

  // On load: a shared result link (?r=…&n=…) or resume saved progress
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromLink = decodeAnswers(params.get("r"));
    /* eslint-disable react-hooks/set-state-in-effect -- reading URL/localStorage once on mount */
    if (fromLink) {
      setAnswers(fromLink);
      setName(params.get("n")?.slice(0, 40) ?? "");
      setShared(true);
      setStage("results");
      return;
    }
    const saved = load();
    if (saved && saved.answers?.length === TOTAL) {
      setName(saved.name ?? "");
      setAnswers(saved.answers);
      if (saved.notes?.length === TOTAL) setNotes(saved.notes);
      setIndex(Math.min(saved.index ?? 0, TOTAL - 1));
      if (saved.answers.every((a) => a !== null)) setStage("results");
      else if (saved.answers.some((a) => a !== null)) setStage("questions");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const start = () => {
    setStage("questions");
    setIndex(0);
    save({ name, answers, notes, index: 0 });
    window.scrollTo(0, 0);
  };

  const answer = (value: number) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    const nextIndex = index + 1;
    if (nextIndex >= TOTAL) {
      setStage("results");
      save({ name, answers: next, notes, index });
    } else {
      setIndex(nextIndex);
      setNoteOpen(!!notes[nextIndex]);
      save({ name, answers: next, notes, index: nextIndex });
    }
    window.scrollTo(0, 0);
  };

  const back = () => {
    const prev = Math.max(0, index - 1);
    setIndex(prev);
    setNoteOpen(!!notes[prev]);
    save({ name, answers, notes, index: prev });
  };

  const restart = () => {
    save(null);
    setAnswers(Array(TOTAL).fill(null));
    setNotes(Array(TOTAL).fill(""));
    setNoteOpen(false);
    setIndex(0);
    setShared(false);
    setStage("intro");
    window.history.replaceState(null, "", "/test");
    window.scrollTo(0, 0);
  };

  // ───────────────────────── Intro ─────────────────────────
  if (stage === "intro") {
    return (
      <section className="max-w-xl mx-auto px-4 sm:px-6 pt-10 md:pt-16 pb-16">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
          Test de personalidad · {TOTAL} preguntas · ~5 min
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-5">
          ¿Quién eres en la mesa?
        </h1>
        <p className="text-gray-600 leading-7 mb-4">
          Un test corto para establecer tu <strong className="text-gray-900">línea base</strong> de
          personalidad. Mide los cinco grandes rasgos que usa la psicología (Big Five) y te da un
          código estilo Myers-Briggs para platicarlo en la mesa.
        </p>
        <p className="text-gray-600 leading-7 mb-8">
          Solo contesta <strong className="text-gray-900">Sí</strong> o{" "}
          <strong className="text-gray-900">No</strong>, con lo que <em>eres</em> normalmente, no
          con lo que te gustaría ser. Si dudas, quédate con tu primera reacción. Si quieres matizar
          una respuesta, puedes agregar una nota antes de contestar.
        </p>

        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          Tu nombre
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          placeholder="Ej. Rafa"
          autoComplete="given-name"
          className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-lg mb-6 focus:outline-none focus:border-gray-900"
        />

        <button
          onClick={start}
          className="w-full rounded-xl bg-gray-900 text-white font-semibold py-4 text-lg hover:bg-red-600 transition-colors"
        >
          Empezar
        </button>

        <p className="text-xs text-gray-400 mt-6 leading-relaxed">
          Preguntas del International Personality Item Pool (Mini-IPIP y marcadores Big Five), de
          dominio público. Es una herramienta de autoconocimiento y conversación, no un diagnóstico
          psicológico.
        </p>
      </section>
    );
  }

  // ───────────────────────── Questions ─────────────────────────
  if (stage === "questions") {
    const q = QUESTIONS[index];
    const current = answers[index];
    return (
      <section className="max-w-xl mx-auto px-4 sm:px-6 pt-8 md:pt-14 pb-16">
        {/* Progress */}
        <div className="flex items-end justify-between gap-4 mb-2">
          <p className="font-mono text-sm font-semibold text-gray-900">
            PREGUNTA {pad(index + 1)}
            <span className="text-gray-300">{"//"}{pad(TOTAL)}</span>
          </p>
          {name && <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400">{name}</p>}
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-10">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${(index / TOTAL) * 100}%` }}
          />
        </div>

        {/* Statement */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-snug mb-10 min-h-[4.5rem]">
          {q.text}
        </h2>

        {/* Optional note — write it first, then answer */}
        <div className="-mt-6 mb-6">
          {noteOpen ? (
            <div>
              <textarea
                value={notes[index]}
                onChange={(e) => {
                  const next = [...notes];
                  next[index] = e.target.value.slice(0, NOTE_MAX);
                  setNotes(next);
                  save({ name, answers, notes: next, index });
                }}
                rows={3}
                autoFocus
                placeholder="Ej. Sí, pero solo con gente de confianza…"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base leading-6 focus:outline-none focus:border-gray-900 resize-none"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Opcional · la IA lo toma en cuenta · no se comparte en tu link</span>
                <span className="font-mono">
                  {notes[index].length}/{NOTE_MAX}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNoteOpen(true)}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 py-1"
            >
              + Agregar una nota
            </button>
          )}
        </div>

        {/* Sí / No */}
        <div className="grid grid-cols-2 gap-3">
          {SCALE.map((opt) => (
            <button
              key={opt.value}
              onClick={() => answer(opt.value)}
              className={`rounded-2xl border-2 py-8 sm:py-10 text-3xl sm:text-4xl font-bold tracking-tight transition-colors ${
                current === opt.value
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-gray-200 text-gray-900 hover:border-gray-900 active:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={back}
            disabled={index === 0}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-0 py-2"
          >
            ← Anterior
          </button>
          {current !== null && index < TOTAL - 1 && (
            <button
              onClick={() => {
                setIndex(index + 1);
                setNoteOpen(!!notes[index + 1]);
                save({ name, answers, notes, index: index + 1 });
              }}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 py-2"
            >
              Siguiente →
            </button>
          )}
        </div>
      </section>
    );
  }

  // ───────────────────────── Results ─────────────────────────
  const complete = answers.map((a) => a ?? 0);
  const scores = scoreAnswers(complete);
  const { code, letters } = typeCode(scores);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/test?r=${encodeAnswers(complete)}${name ? `&n=${encodeURIComponent(name)}` : ""}`
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

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 md:pt-14 pb-16">
      <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
        Tu resultado{name ? ` · ${name}` : ""}
      </p>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-2">{code}</h1>
      <p className="text-lg text-gray-500 mb-8">
        {letters.map((l) => l.name).join(" · ")}
      </p>

      {/* Letters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-12">
        {letters.map((l, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <span className="text-2xl font-bold text-red-600 leading-none w-6">{l.letter}</span>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">{l.name}</p>
              <p className="text-sm text-gray-500 leading-snug mt-0.5">{l.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Big Five bars */}
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Tus cinco rasgos</h2>
      <div className="space-y-6 mb-12">
        {TRAITS.map((t) => {
          const v = scores[t.key];
          return (
            <div key={t.key}>
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {v}
                  <span className="text-gray-300">/{ITEMS_PER_TRAIT}</span>
                </p>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: ITEMS_PER_TRAIT }, (_, i) => (
                  <div key={i} className={`h-3 rounded-sm ${i < v ? "bg-red-600" : "bg-gray-100"}`} />
                ))}
              </div>
              <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-gray-400 mt-1">
                <span>{t.low}</span>
                <span>{v === 2 || v === 3 ? "Cerca del medio" : ""}</span>
                <span>{t.high}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1.5">{t.description}</p>
            </div>
          );
        })}
      </div>

      <AiAnalysis answers={encodeAnswers(complete)} name={name} notes={shared ? [] : notes} />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={copy}
          className="flex-1 rounded-xl bg-gray-900 text-white font-semibold py-3.5 hover:bg-red-600 transition-colors"
        >
          {copied ? "¡Link copiado!" : "Copiar link de mi resultado"}
        </button>
        <button
          onClick={restart}
          className="flex-1 rounded-xl border border-gray-200 font-semibold py-3.5 text-gray-900 hover:border-gray-900 transition-colors"
        >
          {shared ? "Hacer el test yo" : "Repetir el test"}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-8 leading-relaxed">
        Un 2 o 3 de 5 significa que ese rasgo está cerca del medio: la letra sale por poco y vale la
        pena platicar &ldquo;qué tanto&rdquo;. Úsalo como punto de partida para conocerte, no como
        etiqueta.{" "}
        <Link href="/episodes" className="underline hover:text-gray-600">
          Escucha el podcast
        </Link>
        .
      </p>
    </section>
  );
}

// ───────────────────────── AI analysis ─────────────────────────
interface Analysis {
  resumen: string;
  fortalezas: string[];
  puntosCiegos: string[];
  enEquipo: string;
  preguntaParaLaMesa: string;
}

function AiAnalysis({ answers, name, notes }: { answers: string; name: string; notes: string[] }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");

  const run = async () => {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/personality-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, name, notes }),
      });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? ((await res.json()) as { analysis?: Analysis; error?: string }) : {};
      if (!res.ok || !data.analysis) {
        throw new Error(data.error || "El análisis con IA no está disponible en este momento.");
      }
      setAnalysis(data.analysis);
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal.");
      setState("error");
    }
  };

  return (
    <div className="mb-12 rounded-2xl border border-gray-200 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4 mb-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Análisis con IA</h2>
        <span className="font-mono text-[11px] uppercase tracking-widest text-red-600">Beta</span>
      </div>

      {state !== "done" && (
        <>
          <p className="text-gray-600 leading-7 mb-5">
            Una lectura de tu resultado: fortalezas, puntos ciegos, cómo te ves en un grupo y una
            pregunta para la mesa.
            {notes.some((n) => n.trim()) && (
              <>
                {" "}
                {notes.filter((n) => n.trim()).length === 1
                  ? "Incluye la nota que escribiste."
                  : `Incluye las ${notes.filter((n) => n.trim()).length} notas que escribiste.`}
              </>
            )}
          </p>
          <button
            onClick={run}
            disabled={state === "loading"}
            className="w-full rounded-xl bg-red-600 text-white font-semibold py-3.5 hover:bg-red-700 disabled:opacity-70 transition-colors"
          >
            {state === "loading" ? "Analizando…" : "Analizar mi resultado"}
          </button>
          {state === "loading" && (
            <div className="mt-5 space-y-2 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-4/6" />
            </div>
          )}
          {state === "error" && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </>
      )}

      {state === "done" && analysis && (
        <div className="mt-3">
          <p className="text-lg text-gray-900 leading-8 mb-6">{analysis.resumen}</p>

          <div className="grid gap-5 sm:grid-cols-2 mb-6">
            <AnalysisList title="Fortalezas" items={analysis.fortalezas} />
            <AnalysisList title="Puntos ciegos" items={analysis.puntosCiegos} />
          </div>

          {analysis.enEquipo && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-1">En la mesa</h3>
              <p className="text-gray-600 leading-7">{analysis.enEquipo}</p>
            </div>
          )}

          {analysis.preguntaParaLaMesa && (
            <div className="rounded-xl bg-gray-900 text-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-400 mb-2">
                Pregunta para la mesa
              </p>
              <p className="text-lg font-semibold leading-snug">{analysis.preguntaParaLaMesa}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Generado por IA a partir de tus respuestas. Tómalo como punto de partida para la
            conversación, no como verdad absoluta.
          </p>
        </div>
      )}
    </div>
  );
}

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-gray-600 leading-6">
            <span className="text-red-500 text-xs mt-1.5">●</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
