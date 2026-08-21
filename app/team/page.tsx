import type { Metadata } from "next";
import { TeamCard } from "@/components/team-card";

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

const teamMembers = [
  {
    name: "Greg Anthony",
    role: "Crew",
    imageUrl: "/greg02.PNG",
    pixelUrl: "/greg_pxl.jpg",
    initials: "GA",
    coffeeUrl: "https://buymeacoffee.com/roveloga",
  },
  {
    name: "Rafa",
    role: "Crew",
    imageUrl: "/rafa01.jpeg",
    pixelUrl: "/rafa_pxl.JPG",
    videoUrl: "/rafa_loop.mp4",
    initials: "R",
    coffeeUrl: "https://buymeacoffee.com/rafaelcdelgado",
  },
  {
    name: "RJ",
    role: "Crew",
    imageUrl: "/RJ01.jpeg",
    pixelUrl: "/rj_pxl.JPG",
    initials: "RJ",
    coffeeUrl: "https://venmo.com/u/rjenriquez",
    coffeeLabel: "Venmo",
    coffeeColor: "blue" as const,
  },
  {
    name: "Markus",
    role: "Organizador y Documentalista",
    imageUrl: "/markus01.jpeg",
    pixelUrl: "/markus_pxl.JPG",
    videoUrl: "/markus_loop.mp4",
    initials: "MC",
  },
];

export default function TeamPage() {
  return (
    <div>
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {teamMembers.map((member, index) => (
            <TeamCard key={index} {...member} />
          ))}
        </div>
      </section>
    </div>
  );
}
