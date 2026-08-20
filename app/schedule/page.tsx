import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendario",
  description:
    "Mira la rotación de ponentes de Punto Raw — quién sigue, próximos episodios y el sistema de pase que mantiene el impulso.",
  openGraph: {
    title: "Calendario de Ponentes | Punto Raw",
    description:
      "Mira la rotación de ponentes de Punto Raw — quién sigue, próximos episodios y el sistema de pase.",
  },
};

export default function SchedulePage() {
  const schedule = [
    {
      month: "Mayo 2026",
      date: "May 21, 2026",
      episodeNumber: 1,
      speaker: "Greg Anthony",
      topic: "Exponiendo Intenciones Auténticas",
      status: "published" as const,
    },
    {
      month: "Junio 2026",
      date: "June 21, 2026",
      episodeNumber: 2,
      speaker: "Rafa",
      topic: "Pensamiento Sistémico y Escalabilidad",
      status: "upcoming" as const,
    },
    {
      month: "Julio 2026",
      date: "July 21, 2026",
      episodeNumber: 3,
      speaker: "RJ",
      topic: "Expresión Creativa y Datos",
      status: "upcoming" as const,
    },
    {
      month: "Agosto 2026",
      date: "August 21, 2026",
      episodeNumber: 4,
      speaker: "Por Confirmar",
      topic: "Por anunciar",
      status: "upcoming" as const,
    },
  ];

  return (
    <div>
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-3">
          Rotación
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Calendario de Ponentes
        </h1>
        <p className="text-lg text-gray-600 max-w-xl">
          Episodios mensuales con conversaciones auténticas sobre intenciones,
          crecimiento y responsabilidad.
        </p>
      </section>

      {/* Schedule Timeline */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="space-y-4">
          {schedule.map((episode, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Episodio {episode.episodeNumber} · {episode.month}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {episode.topic}
                  </h3>
                  <p className="text-gray-600 font-medium mb-2">
                    {episode.speaker}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(episode.date).toLocaleDateString("es-419", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · 7:00 PM PST
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                      episode.status === "published"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {episode.status === "published" ? "Publicado" : "Próximo"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pass System Info */}
        <div className="mt-12 p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            El Sistema de Pase
          </h3>
          <p className="text-gray-600 mb-3 text-sm">
            Si un ponente programado necesita pasar por cualquier razón:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">●</span>
              Puede pasar, y la siguiente persona en rotación toma su lugar
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">●</span>
              O puede traer un ponente invitado para ese mes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">●</span>
              Esto mantiene el impulso sin forzar presentaciones
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
