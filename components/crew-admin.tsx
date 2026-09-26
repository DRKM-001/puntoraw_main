"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OBS_KINDS, episodeCode, type ObsKind, type ProfileData } from "@/lib/crew";

const KEY_STORAGE = "puntoraw-crew-admin-key";

interface Obs {
  id: number;
  member: string;
  season: number | null;
  episode: number | null;
  kind: ObsKind;
  text: string;
  evidence: string | null;
  confidence: number | null;
  status: "pending" | "approved" | "hidden";
}

interface ProfileRow {
  member: string;
  version: number;
  status: "draft" | "published";
  created_at: string;
  data: ProfileData;
}

interface Overview {
  crew: { slug: string; name: string }[];
  observations: Obs[];
  profiles: ProfileRow[];
}

function readKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

function saveKey(k: string) {
  try {
    if (k) localStorage.setItem(KEY_STORAGE, k);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* private mode */
  }
}

const btn = "inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-40";
const btnDark = `${btn} bg-gray-900 text-white hover:bg-gray-800`;
const btnLight = `${btn} border border-gray-200 text-gray-700 hover:bg-gray-50`;
const input = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10";

export function CrewAdmin() {
  const [key, setKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [tab, setTab] = useState<"ingest" | "review" | "profiles">("review");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const api = useCallback(
    async (body?: Record<string, unknown>) => {
      const r = await fetch("/api/crew/admin", {
        method: body ? "POST" : "GET",
        headers: { authorization: `Bearer ${key}`, ...(body ? { "content-type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await r.json().catch(() => ({ error: `Error ${r.status}` }));
      if (!r.ok) {
        if (r.status === 401) {
          saveKey("");
          setKey("");
        }
        throw new Error(j.error || `Error ${r.status}`);
      }
      return j;
    },
    [key]
  );

  const load = useCallback(async () => {
    try {
      setData((await api()) as Overview);
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
    }
  }, [api]);

  // Remembered key (read after mount: the page is prerendered without it)
  useEffect(() => {
    const k = readKey();
    if (k) queueMicrotask(() => setKey(k));
  }, []);

  useEffect(() => {
    if (key) queueMicrotask(load);
  }, [key, load]);

  async function run(label: string, body: Record<string, unknown>, success?: (j: Record<string, unknown>) => string) {
    setBusy(label);
    setNotice(null);
    try {
      const j = await api(body);
      if (success) setNotice({ ok: true, text: success(j) });
      await load();
      return j;
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
      return null;
    } finally {
      setBusy(null);
    }
  }

  if (!key) {
    return (
      <form
        className="max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          saveKey(keyInput.trim());
          setKey(keyInput.trim());
        }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">Clave del crew</label>
        <input type="password" className={input} value={keyInput} onChange={(e) => setKeyInput(e.target.value)} autoFocus />
        <button className={`${btnDark} mt-3`} disabled={!keyInput.trim()}>
          Entrar
        </button>
        {notice && !notice.ok && <p className="mt-3 text-sm text-red-600">{notice.text}</p>}
      </form>
    );
  }

  const pending = data?.observations.filter((o) => o.status === "pending").length ?? 0;
  const names = Object.fromEntries((data?.crew ?? []).map((c) => [c.slug, c.name]));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(
          [
            ["ingest", "1 · Nuevo episodio"],
            ["review", `2 · Revisar${pending ? ` (${pending})` : ""}`],
            ["profiles", "3 · Perfiles"],
          ] as const
        ).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? btnDark : btnLight}>
            {label}
          </button>
        ))}
        <button
          onClick={() => {
            saveKey("");
            setKey("");
            setData(null);
          }}
          className="ml-auto text-xs text-gray-400 hover:text-gray-700"
        >
          Salir
        </button>
      </div>

      {notice && (
        <p className={`mb-6 rounded-lg px-4 py-3 text-sm ${notice.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
          {notice.text}
        </p>
      )}

      {!data ? (
        <p className="text-sm text-gray-400">Cargando…</p>
      ) : tab === "ingest" ? (
        <Ingest busy={busy} run={run} onDone={() => setTab("review")} />
      ) : tab === "review" ? (
        <Review data={data} names={names} busy={busy} run={run} />
      ) : (
        <Profiles data={data} names={names} busy={busy} run={run} />
      )}
    </div>
  );
}

type Run = (
  label: string,
  body: Record<string, unknown>,
  success?: (j: Record<string, unknown>) => string
) => Promise<Record<string, unknown> | null>;

function Ingest({ busy, run, onDone }: { busy: string | null; run: Run; onDone: () => void }) {
  const [season, setSeason] = useState("2");
  const [episode, setEpisode] = useState("");
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");

  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-gray-500">
        Pega o sube la transcripción. Markus anota lo que el episodio revela de cada miembro del crew; nada se publica
        hasta que lo apruebes en “Revisar”. La transcripción no se guarda.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="text-xs text-gray-500">
          Temporada
          <input className={input} inputMode="numeric" value={season} onChange={(e) => setSeason(e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">
          Episodio
          <input className={input} inputMode="numeric" value={episode} onChange={(e) => setEpisode(e.target.value)} />
        </label>
        <label className="text-xs text-gray-500 col-span-2">
          Título (opcional)
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
      </div>
      <input
        type="file"
        accept=".txt,.srt,.vtt,text/plain"
        className="block text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) setTranscript(await f.text());
        }}
      />
      <textarea
        className={`${input} h-64 font-mono text-xs`}
        placeholder="…o pega aquí la transcripción"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <button
          className={btnDark}
          disabled={!!busy || !episode || transcript.trim().length < 500}
          onClick={async () => {
            const j = await run(
              "ingest",
              { action: "ingest", season: Number(season), episode: Number(episode), title, transcript },
              (j) => `Listo: ${j.added} observaciones nuevas para revisar.${j.truncated ? " (La transcripción era muy larga; se usó el inicio.)" : ""}`
            );
            if (j) {
              setTranscript("");
              onDone();
            }
          }}
        >
          {busy === "ingest" ? "Markus está leyendo… (≈1 min)" : "Analizar episodio"}
        </button>
        <span className="text-xs text-gray-400">{transcript.length.toLocaleString()} caracteres</span>
      </div>
    </div>
  );
}

function ObsCard({ o, names, busy, run }: { o: Obs; names: Record<string, string>; busy: string | null; run: Run }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(o.text);
  const label = `obs-${o.id}`;

  return (
    <div className={`rounded-xl border p-4 ${o.status === "hidden" ? "border-gray-100 opacity-60" : "border-gray-200"}`}>
      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
        <span className="font-mono text-red-600">{episodeCode(o.season, o.episode)}</span>
        <select
          className="rounded border border-gray-200 px-1.5 py-0.5"
          value={o.kind}
          disabled={!!busy}
          onChange={(e) => run(label, { action: "review", id: o.id, kind: e.target.value })}
        >
          {Object.entries(OBS_KINDS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-gray-200 px-1.5 py-0.5"
          value={o.member}
          disabled={!!busy}
          onChange={(e) => run(label, { action: "review", id: o.id, member: e.target.value })}
          title="Cambiar a quién se atribuye"
        >
          {Object.entries(names).map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
        {o.confidence !== null && o.confidence < 1 && (
          <span className={o.confidence < 0.75 ? "text-amber-600" : "text-gray-400"}>
            atribución {Math.round(o.confidence * 100)}%
          </span>
        )}
        <span className="ml-auto uppercase tracking-wide text-[10px] text-gray-400">
          {o.status === "pending" ? "Pendiente" : o.status === "approved" ? "Publicada" : "Oculta"}
        </span>
      </div>

      {editing ? (
        <textarea className={`${input} h-24`} value={text} onChange={(e) => setText(e.target.value)} />
      ) : (
        <p className="text-gray-800 leading-relaxed">{o.text}</p>
      )}
      {o.evidence && <p className="mt-2 text-xs text-gray-400 italic">Evidencia: “{o.evidence}”</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {editing ? (
          <>
            <button
              className={btnDark}
              disabled={!!busy}
              onClick={async () => {
                await run(label, { action: "review", id: o.id, text, status: "approved" });
                setEditing(false);
              }}
            >
              Guardar y aprobar
            </button>
            <button className={btnLight} onClick={() => (setEditing(false), setText(o.text))}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            {o.status !== "approved" && (
              <button className={btnDark} disabled={!!busy} onClick={() => run(label, { action: "review", id: o.id, status: "approved" })}>
                Aprobar
              </button>
            )}
            {o.status !== "hidden" && (
              <button className={btnLight} disabled={!!busy} onClick={() => run(label, { action: "review", id: o.id, status: "hidden" })}>
                Ocultar
              </button>
            )}
            <button className={btnLight} disabled={!!busy} onClick={() => setEditing(true)}>
              Editar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Review({ data, names, busy, run }: { data: Overview; names: Record<string, string>; busy: string | null; run: Run }) {
  const [filter, setFilter] = useState<Obs["status"]>("pending");
  const list = useMemo(() => data.observations.filter((o) => o.status === filter), [data, filter]);

  return (
    <div className="max-w-3xl">
      <div className="flex gap-2 mb-6 text-sm">
        {(
          [
            ["pending", "Pendientes"],
            ["approved", "Publicadas"],
            ["hidden", "Ocultas"],
          ] as const
        ).map(([s, label]) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 ${filter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {label} ({data.observations.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400">Nada aquí.</p>
      ) : (
        data.crew.map((c) => {
          const mine = list.filter((o) => o.member === c.slug);
          if (!mine.length) return null;
          return (
            <section key={c.slug} className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-semibold text-gray-900">{c.name}</h2>
                <span className="text-xs text-gray-400">{mine.length}</span>
                {filter === "pending" && (
                  <button
                    className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
                    disabled={!!busy}
                    onClick={async () => {
                      for (const o of mine) await run(`obs-${o.id}`, { action: "review", id: o.id, status: "approved" });
                    }}
                  >
                    Aprobar todas
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {mine.map((o) => (
                  <ObsCard key={`${o.id}-${o.status}-${o.text}`} o={o} names={names} busy={busy} run={run} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function ProfilePreview({ p }: { p: ProfileData }) {
  return (
    <div className="space-y-3 text-sm text-gray-700">
      {p.lectura.split(/\n+/).map((t, i) => (
        <p key={i} className="leading-relaxed">
          {t}
        </p>
      ))}
      {p.enMovimiento && (
        <p className="border-l-4 border-red-500 pl-3 font-medium text-gray-900">{p.enMovimiento}</p>
      )}
      {p.temas.length > 0 && <p className="text-xs text-gray-500">Temas: {p.temas.map((t) => t.tema).join(" · ")}</p>}
      {p.arco.map((a) => (
        <p key={`${a.season}-${a.episode}`} className="text-xs">
          <span className="font-mono text-red-600">{episodeCode(a.season, a.episode)}</span> {a.texto}
        </p>
      ))}
      {p.pregunta && <p className="rounded-lg bg-gray-900 text-white px-3 py-2">{p.pregunta.texto}</p>}
    </div>
  );
}

function Profiles({ data, names, busy, run }: { data: Overview; names: Record<string, string>; busy: string | null; run: Run }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {data.crew.map((c) => {
        const draft = data.profiles.find((p) => p.member === c.slug && p.status === "draft");
        const published = data.profiles.find((p) => p.member === c.slug && p.status === "published");
        const approved = data.observations.filter((o) => o.member === c.slug && o.status === "approved").length;
        const label = `profile-${c.slug}`;
        return (
          <div key={c.slug} className="rounded-2xl border border-gray-200 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-gray-900">{names[c.slug]}</h2>
              <a href={`/team/${c.slug}`} target="_blank" className="text-xs text-gray-400 hover:text-gray-700">
                Ver página ↗
              </a>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {approved} observaciones publicadas · {published ? `v${published.version} en línea` : "sin perfil publicado"}
            </p>

            {draft ? (
              <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-4 mb-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-3">Borrador v{draft.version}</p>
                <ProfilePreview p={draft.data} />
                <div className="mt-4 flex gap-2">
                  <button
                    className={btnDark}
                    disabled={!!busy}
                    onClick={() =>
                      run(label, { action: "publish", member: c.slug, version: draft.version }, () => `Perfil de ${c.name} publicado.`)
                    }
                  >
                    Publicar
                  </button>
                  <button className={btnLight} disabled={!!busy} onClick={() => run(label, { action: "discard", member: c.slug, version: draft.version })}>
                    Descartar
                  </button>
                </div>
              </div>
            ) : published ? (
              <div className="mb-4 opacity-80">
                <ProfilePreview p={published.data} />
              </div>
            ) : null}

            <button
              className={`${btnLight} mt-auto`}
              disabled={!!busy || approved === 0}
              onClick={() => run(label, { action: "rebuild", member: c.slug }, () => `Nuevo borrador para ${c.name}. Revísalo y publícalo.`)}
            >
              {busy === label ? "Markus está escribiendo…" : "Reescribir perfil con lo aprobado"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
