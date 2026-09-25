import type { Metadata } from "next";
import { PersonalityTest } from "@/components/personality-test";

export const metadata: Metadata = {
  title: "Test de personalidad",
  description:
    "Descubre quién eres y el porqué de tus comportamientos: 25 preguntas de Sí o No basadas en los cinco grandes rasgos (Big Five), con una lectura de IA que afinas tú mismo.",
  alternates: { canonical: "/test" },
};

export default function TestPage() {
  return <PersonalityTest />;
}
