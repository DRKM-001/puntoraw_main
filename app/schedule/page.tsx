"use client";

import { useState, useEffect } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  location: string;
  status: "published" | "upcoming";
}

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setEvents(data.events || []);
        }
      })
      .catch(() => {
        setError("No se pudo cargar el calendario.");
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-419", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      // Only show time if it's a dateTime (not an all-day event)
      if (dateStr.includes("T")) {
        return d.toLocaleTimeString("es-419", {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        });
      }
      return null;
    } catch {
      return null;
    }
  };

  const formatMonth = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-419", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Parse speaker from description (look for "Speaker: Name" or just use first line)
  const parseSpeaker = (description: string): string | null => {
    if (!description) return null;
    const speakerMatch = description.match(/^(?:Speaker|Ponente|Host):\s*(.+)$/im);
    if (speakerMatch) return speakerMatch[1].trim();
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-8">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
          Rotación
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Calendario de Ponentes
        </h1>
        <p className="text-gray-500">
          Episodios mensuales con conversaciones auténticas sobre intenciones, crecimiento y responsabilidad.
        </p>
      </section>

      {/* Loading */}
      {loading && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-6 h-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-gray-400 text-sm">Cargando calendario...</span>
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
          <div className="text-center py-20">
            <p className="text-red-500 text-sm font-medium">{error}</p>
          </div>
        </section>
      )}

      {/* Schedule Timeline */}
      {!loading && !error && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
          {events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No hay eventos programados aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => {
                const speaker = parseSpeaker(event.description);
                const time = formatTime(event.start);
                const isPast = event.status === "published";

                return (
                  <div
                    key={event.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all p-5 sm:p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Episodio {index + 1} · {formatMonth(event.start)}
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {event.title}
                        </h3>
                        {speaker && (
                          <p className="text-gray-600 font-medium mb-2">
                            {speaker}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">
                          {formatDate(event.start)}
                          {time && ` · ${time}`}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-400 mt-1">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${
                            isPast
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {isPast ? "Publicado" : "Próximo"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pass System Info */}
          <div className="mt-12 p-6 sm:p-8 rounded-xl border border-gray-100 bg-gray-50/50">
            <h3 className="text-xl font-bold text-gray-900 mb-3">El Sistema de Pase</h3>
            <p className="text-gray-600 mb-3">
              Si un ponente programado necesita pasar por cualquier razón:
            </p>
            <div className="space-y-2 text-gray-600 text-sm">
              <p>• Puede pasar, y la siguiente persona en rotación toma su lugar</p>
              <p>• O puede traer un ponente invitado para ese mes</p>
              <p>• Esto mantiene el impulso sin forzar conversaciones</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
