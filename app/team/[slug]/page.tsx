import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CREW, crewMember } from "@/lib/crew";
import { LivingProfile } from "@/components/living-profile";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return CREW.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = crewMember(slug);
  if (!m) return { title: "Crew" };
  return {
    title: `${m.name} — Perfil vivo`,
    description: `El perfil vivo de ${m.name} en .RAW Sessions: cómo piensa, qué está trabajando y cómo ha cambiado a lo largo del podcast.`,
    alternates: { canonical: `/team/${m.slug}` },
  };
}

export default async function CrewProfilePage({ params }: Props) {
  const { slug } = await params;
  const m = crewMember(slug);
  if (!m) notFound();

  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-12 pb-8">
        <Link href="/team" className="text-gray-400 hover:text-gray-900 transition text-sm mb-8 inline-flex items-center py-2">
          ← Crew
        </Link>

        <div className="flex items-end gap-5 sm:gap-8 pb-6 border-b-[6px] border-gray-900">
          <div className="relative w-24 sm:w-36 aspect-[3/4] shrink-0 overflow-hidden rounded-xl bg-gray-900">
            <Image src={m.pixelUrl} alt={m.name} fill sizes="144px" className="object-cover" priority />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-red-600 mb-2">Perfil vivo</p>
            <h1 className="font-headline font-black uppercase tracking-[-0.03em] text-gray-900 text-5xl sm:text-7xl md:text-8xl leading-[0.9]">
              {m.name}
            </h1>
            {m.aliases.filter((a) => a !== m.name).length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                También: {m.aliases.filter((a) => a !== m.name).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <LivingProfile slug={m.slug} name={m.name} />
      </section>
    </div>
  );
}
