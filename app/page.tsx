import Link from "next/link";
import { LivestreamSection } from "@/components/livestream-section";

export default function Home() {
  return (
    <div>
      {/* Hero Section — two-column: text left, livestream right */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text + CTAs */}
          <div>
            <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-4">
              Podcast & Livestream
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
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
            <div className="flex flex-col sm:flex-row gap-3">
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
          <LivestreamSection />
        </div>
      </section>

      {/* Three Pillars */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Lo Que Defendemos
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Buscar el Crecimiento
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Buscar la Responsabilidad
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Abrazar la Incomodidad
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
