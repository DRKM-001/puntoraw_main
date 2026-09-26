import type { Metadata } from "next";
import { CrewAdmin } from "@/components/crew-admin";

export const metadata: Metadata = {
  title: "Perfiles vivos — admin",
  robots: { index: false, follow: false },
};

export default function CrewAdminPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
      <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">Solo el crew</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Perfiles vivos</h1>
      <CrewAdmin />
    </div>
  );
}
