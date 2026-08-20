import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Equipo",
  description:
    "Conoce a las personas detrás de Punto Raw — Greg Anthony, Rafa, RJ y Markus Corvus. Comprometidos con conversaciones auténticas y crecimiento.",
  openGraph: {
    title: "Nuestro Equipo | Punto Raw",
    description:
      "Conoce a las personas detrás de Punto Raw — comprometidos con conversaciones auténticas y crecimiento.",
  },
};

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  initials: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Greg Anthony",
    role: "Fundador y Ponente",
    bio: "Pensador estratégico y fundador de Dark Matter Systems. Apasionado por la conexión auténtica, el diseño de sistemas y construir con intención.",
    imageUrl: "/greg02.PNG",
    initials: "GA",
  },
  {
    name: "Rafa",
    role: "Arquitecto de Sistemas y Co-Host",
    bio: "Visionario de ingeniería y arquitecto de sistemas. Especialista en arquitectura backend, escalabilidad y convertir sistemas complejos en soluciones elegantes.",
    imageUrl: "/rafa01.jpeg",
    initials: "R",
  },
  {
    name: "RJ",
    role: "Ingeniero de Audio y Fuerza Creativa",
    bio: "Ingeniero de audio y analista de datos con pasión por la expresión creativa. Versátil con experiencia tanto analítica como creativa.",
    imageUrl: "/RJ01.jpeg",
    initials: "RJ",
  },
  {
    name: "Markus",
    role: "Organizador y Documentalista",
    bio: "Compañero estratégico y arquitecto de planes. Custodio de la visión, guardián de notas y compilador de conversaciones auténticas en registros perdurables.",
    imageUrl: "/markus01.jpeg",
    initials: "MC",
  },
];

export default function TeamPage() {
  return (
    <div>
      {/* Header */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-3">
          El Círculo
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Crew
        </h1>
        <p className="text-lg text-gray-600 max-w-xl">
          Las personas detrás de Punto Raw, comprometidos con conversaciones
          auténticas y crecimiento.
        </p>
      </section>

      {/* Team Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group relative rounded-xl overflow-hidden aspect-[3/4] cursor-default"
            >
              {/* Full-size image */}
              {member.imageUrl ? (
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white/30">
                    {member.initials}
                  </span>
                </div>
              )}

              {/* Dark gradient overlay — stronger at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Text overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-2">
                <h3 className="text-base font-bold text-white leading-tight">
                  {member.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
