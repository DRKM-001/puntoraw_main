import type { Metadata } from "next";
import { PersonalityTest } from "@/components/personality-test";

export const metadata: Metadata = {
  title: "Test de personalidad",
  description:
    "¿Quién eres en la mesa? Un test corto de 20 preguntas basado en los cinco grandes rasgos de personalidad (Big Five), con tu código estilo Myers-Briggs.",
  alternates: { canonical: "/test" },
};

export default function TestPage() {
  return <PersonalityTest />;
}
