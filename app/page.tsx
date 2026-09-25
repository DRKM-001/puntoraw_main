import Link from "next/link";
import { LivestreamSection } from "@/components/livestream-section";
import { getLatestVideo } from "@/lib/blog";

export default function Home() {
  const fallbackVideo = getLatestVideo();

  return (
    <div>
      {/* Hero — YouTube-style on mobile, two-column on desktop */}

      {/* Mobile hero: title section + edge-to-edge video */}
      <section className="lg:hidden">
        {/* Hero title — above the video */}
        <div className="px-4 pt-6 pb-4">
          <p className="text-[10px] font-semibold text-red-600 uppercase tracking-widest mb-1">
            Podcast & Livestream
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-[1.15]">
            Intenciones Auténticas. Crecimiento.
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mt-1">
            Conversaciones honestas sobre lo que realmente se necesita para
            crecer — de verdad.
          </p>
        </div>

        {/* Video — full bleed */}
        <LivestreamSection variant="mobile" fallbackVideo={fallbackVideo} />
      </section>

      {/* Desktop hero: original two-column layout */}
      <section className="hidden lg:block">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <div className="grid grid-cols-12 gap-12 items-center">
            {/* Left: Text + CTAs */}
            <div className="col-span-5">
              <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-4">
                Podcast & Livestream
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
                Intenciones
                <br />
                Auténticas.
                <br />
                Crecimiento.
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-md">
                Un podcast mastermind mensual donde cortamos el ruido y tenemos
                conversaciones honestas sobre lo que realmente se necesita para
                crecer — de verdad.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/episodes"
                  className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Escuchar Episodios
                </Link>
                <Link
                  href="/schedule"
                  className="inline-flex items-center justify-center h-12 px-8 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ver Calendario
                </Link>
              </div>
            </div>

            {/* Right: Livestream / Latest Episode */}
            <div className="col-span-7">
              <LivestreamSection variant="desktop" fallbackVideo={fallbackVideo} />
            </div>
          </div>
        </div>
      </section>

      {/* Personality test invitation */}
      <section className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
                Test de personalidad
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                ¿Quién eres en la mesa?
              </h2>
              <p className="text-gray-600 leading-7 mb-6 max-w-md">
                El test que hacemos en vivo con el equipo. 25 preguntas de Sí o No para
                conocer tu línea base de personalidad, con un análisis con IA al final. Compara tu
                resultado con el de la mesa.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/test"
                  className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Hacer el test →
                </Link>
                <span className="font-mono text-xs uppercase tracking-widest text-gray-400">
                  ~5 min · gratis · sin registro
                </span>
              </div>
            </div>

            {/* Sample result card */}
            <Link
              href="/test"
              aria-hidden
              tabIndex={-1}
              className="block rounded-2xl border border-gray-100 bg-gray-50/60 p-6 sm:p-8 hover:border-gray-200 transition-colors"
            >
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
                Tu resultado
              </p>
              <p className="text-5xl font-bold tracking-tight text-gray-900 mb-1">????-?</p>
              <p className="text-sm text-gray-500 mb-6">
                Extraversión · Apertura · Amabilidad · Responsabilidad · Estabilidad
              </p>
              <div className="space-y-3">
                {[4, 5, 2, 3, 4].map((v, i) => (
                  <div key={i} className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 5 }, (_, j) => (
                      <div key={j} className={`h-2.5 rounded-sm ${j < v ? "bg-red-600" : "bg-gray-200"}`} />
                    ))}
                  </div>
                ))}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Nuestro Norte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                Exige Crecimiento
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                El crecimiento es intencional. No sucede por accidente.
                Rechazamos el estancamiento y buscamos mejorar en cada área de
                la vida.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                Rinde Cuentas
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Invitamos retroalimentación honesta. Aceptamos responsabilidad.
                Nos exigimos un estándar más alto del que el mundo requiere.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                Abraza lo Incómodo
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                La comodidad es el enemigo del progreso. Nos inclinamos hacia
                conversaciones difíciles y nos retamos mutuamente a ser mejores.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
