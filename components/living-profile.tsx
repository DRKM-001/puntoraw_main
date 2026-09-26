"use client";

import { useEffect, useState } from "react";
import { TRAITS } from "@/lib/personality";
import { episodeCode, type Baseline, type PublicProfile } from "@/lib/crew";

function useProfile(slug: string) {
  const [data, setData] = useState<PublicProfile | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/crew/${slug}`)
      .then(async (r) => {
        if (!r.ok || !r.headers.get("content-type")?.includes("application/json")) throw new Error();
        return (await r.json()) as PublicProfile;
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setState("ready");
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, state };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{children}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function TestCard({ baselines }: { baselines: Baseline[] }) {
  const latest = baselines[baselines.length - 1];
  const previous = baselines.length > 1 ? baselines[baselines.length - 2] : null;
  if (!latest) return null;

  return (
    <div className="rounded-2xl border border-gray-100 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <p className="font-mono text-2xl font-semibold text-gray-900 tracking-tight">{latest.code}</p>
        <p className="text-xs text-gray-400">
          Test de personalidad{latest.season ? ` · ${episodeCode(latest.season, latest.episode)}` : ""}
        </p>
      </div>
      <div className="space-y-3">
        {TRAITS.map((t) => {
          const v = latest.scores[t.key];
          const prev = previous?.scores[t.key];
          return (
            <div key={t.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{t.name}</span>
                <span className="text-gray-400 tabular-nums">
                  {v}/5
                  {prev !== undefined && prev !== v && (
                    <span className={v > prev ? "text-green-600" : "text-red-500"}>
                      {" "}
                      ({v > prev ? "+" : ""}
                      {v - prev})
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-gray-900" style={{ width: `${(v / 5) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
                <span>{t.low}</span>
                <span>{t.high}</span>
              </div>
            </div>
          );
        })}
      </div>
      <a href="/test" className="mt-5 inline-block text-xs font-medium text-red-600 hover:text-red-700">
        Haz el test →
      </a>
    </div>
  );
}

export function LivingProfile({ slug, name }: { slug: string; name: string }) {
  const { data, state } = useProfile(slug);

  if (state === "loading") {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-40 rounded bg-gray-100" />
        <div className="h-24 rounded-xl bg-gray-100" />
        <div className="h-48 rounded-xl bg-gray-100" />
      </div>
    );
  }

  const profile = data?.profile ?? null;
  const baselines = data?.baselines ?? [];
  const quotes = (data?.observations ?? []).filter((o) => o.kind === "frase").slice(-6).reverse();

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      {/* Main column */}
      <div className="lg:col-span-2 space-y-10">
        {profile ? (
          <section>
            <SectionTitle>Cómo lo ve Markus</SectionTitle>
            <div className="space-y-4 text-[17px] leading-8 text-gray-700">
              {profile.lectura.split(/\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {profile.enMovimiento && (
              <p className="mt-6 border-l-4 border-red-500 pl-4 text-gray-900 font-medium">
                <span className="block text-[11px] font-bold uppercase tracking-widest text-red-600 mb-1">
                  En movimiento
                </span>
                {profile.enMovimiento}
              </p>
            )}
          </section>
        ) : (
          <section className="rounded-2xl bg-gray-50 p-6 sm:p-8">
            <p className="font-mono text-[11px] text-gray-400 tracking-wider mb-2">.RAW&gt;_ markus</p>
            <p className="text-gray-700 leading-relaxed">
              {state === "error"
                ? "No pude cargar este perfil ahora mismo. Intenta de nuevo en un momento."
                : `Estoy escribiendo el perfil de ${name}. Se construye con lo que dice en cada episodio y crece con el podcast.`}
            </p>
          </section>
        )}

        {profile && profile.arco.length > 0 && (
          <section>
            <SectionTitle>Su recorrido</SectionTitle>
            <ol className="relative border-l border-gray-200 ml-1.5 space-y-6">
              {profile.arco.map((a) => (
                <li key={`${a.season}-${a.episode}`} className="pl-6 relative">
                  <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-red-600 ring-4 ring-white" />
                  <p className="font-mono text-[11px] text-red-600 tracking-wide">{episodeCode(a.season, a.episode)}</p>
                  <p className="text-gray-700 leading-relaxed mt-0.5">{a.texto}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {profile && profile.temas.length > 0 && (
          <section>
            <SectionTitle>Temas a los que vuelve</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.temas.map((t) => (
                <div key={t.tema} className="rounded-xl border border-gray-100 p-4">
                  <p className="font-semibold text-gray-900">{t.tema}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{t.detalle}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile && (profile.fortalezas.length > 0 || profile.retos.length > 0) && (
          <section className="grid gap-8 sm:grid-cols-2">
            {profile.fortalezas.length > 0 && (
              <div>
                <SectionTitle>Fortalezas</SectionTitle>
                <ul className="space-y-2">
                  {profile.fortalezas.map((f) => (
                    <li key={f} className="relative pl-5 text-gray-600 leading-relaxed before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-gray-900">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {profile.retos.length > 0 && (
              <div>
                <SectionTitle>Lo que trabaja</SectionTitle>
                <ul className="space-y-2">
                  {profile.retos.map((r) => (
                    <li key={r} className="relative pl-5 text-gray-600 leading-relaxed before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-500">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {quotes.length > 0 && (
          <section>
            <SectionTitle>En sus palabras</SectionTitle>
            <div className="space-y-5">
              {quotes.map((q) => (
                <blockquote key={q.id} className="border-l-2 border-gray-200 pl-4">
                  <p className="text-lg text-gray-800 italic leading-relaxed">&ldquo;{q.text}&rdquo;</p>
                  {q.season && (
                    <p className="font-mono text-[11px] text-gray-400 mt-1">{episodeCode(q.season, q.episode)}</p>
                  )}
                </blockquote>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Side column */}
      <aside className="space-y-6">
        {profile?.pregunta && (
          <div className="rounded-2xl bg-gray-900 text-white p-5 sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 mb-2">Su pregunta para la mesa</p>
            <p className="text-lg leading-snug">{profile.pregunta.texto}</p>
            {profile.pregunta.season && (
              <p className="font-mono text-[11px] text-white/40 mt-3">
                desde {episodeCode(profile.pregunta.season, profile.pregunta.episode)}
              </p>
            )}
          </div>
        )}

        <TestCard baselines={baselines} />

        <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500 leading-relaxed">
          <p className="font-semibold text-gray-700 mb-1">Un perfil vivo</p>
          Markus lo escribe a partir de lo que {name} dice en cada episodio, y el crew aprueba cada actualización antes de
          publicarla.
          {profile?.hasta && (
            <span className="block mt-2 font-mono text-[11px] text-gray-400">
              v{profile.version} · actualizado tras {episodeCode(profile.hasta.season, profile.hasta.episode)}
            </span>
          )}
        </div>
      </aside>
    </div>
  );
}
