import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Merch",
  description:
    "Representa a .RAW Sessions — camisetas, stickers y mugs para los que viven con intención.",
  openGraph: {
    title: "Merch | .RAW Sessions",
    description:
      "Representa a .RAW Sessions — camisetas, stickers y mugs para los que viven con intención.",
  },
};

interface MerchItem {
  name: string;
  description: string;
  price: string;
  category: "camiseta" | "sticker" | "mug";
  imageUrl?: string;
  badge?: string;
}

const merchItems: MerchItem[] = [
  {
    name: "Camiseta .RAW",
    description:
      "Logo principal en el pecho. Algodón premium, corte unisex. Disponible en negro y blanco.",
    price: "$26",
    category: "camiseta",
    imageUrl: "/tee_merch_01.png",
  },
];

const categoryLabels: Record<string, string> = {
  camiseta: "Camisetas",
  sticker: "Stickers",
  mug: "Mugs",
};

const categoryIcons: Record<string, string> = {
  camiseta: "👕",
  sticker: "✦",
  mug: "☕",
};

function MerchCard({ item }: { item: MerchItem }) {
  return (
    <div className="group border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all h-full flex flex-col">
      {/* Image placeholder */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <span className="text-5xl">
              {categoryIcons[item.category]}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide">
              Próximamente
            </span>
          </div>
        )}

        {/* Badge */}
        {item.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded-lg">
            {item.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          {categoryLabels[item.category]}
        </span>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {item.name}
        </h3>

        <p className="text-sm text-gray-600 mb-4 flex-1 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{item.price}</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Próximamente
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MerchPage() {
  return (
    <div>
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-3">
          Representa
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Merch
        </h1>
        <p className="text-lg text-gray-600 max-w-xl">
          Lleva el mensaje contigo. Productos para los que viven con intención.
        </p>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {merchItems.map((item, i) => (
            <MerchCard key={i} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
