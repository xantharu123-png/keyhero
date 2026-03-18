import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Deals - KeyHero",
  description: "Aktuelle Game-Key-Angebote",
};

export default async function DealsPage() {
  let deals: any[] = [];
  try {
    deals = await prisma.offer.findMany({
      take: 30,
      orderBy: { finalPrice: "asc" },
      where: {
        finalPrice: { gt: 0 },
      },
      include: {
        game: true,
        store: true,
      },
    });
  } catch (e) {
    console.error("Deals fetch error:", e);
  }

  const hasDeals = Array.isArray(deals) && deals.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Deals</h1>
        <p className="text-sm text-gray-400">
          Live-Preise. Angaben ohne Gewähr.
        </p>
      </div>

      {!hasDeals && (
        <div className="border border-white/10 rounded-xl p-6 text-sm text-gray-400 text-center">
          Noch keine Deals in der Datenbank. Führe den Importer aus um Daten zu
          laden.
        </div>
      )}

      {hasDeals && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal: any) => (
            <Link
              key={deal.id}
              href={`/game/${deal.game.slug}`}
              className="group block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-pink-500/50 transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                  {deal.game.coverImage ? (
                    <img
                      src={deal.game.coverImage}
                      alt={deal.game.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      ?
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate group-hover:text-pink-400 transition-colors">
                    {deal.game.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {deal.store.name} · {deal.platform} · {deal.region}
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-pink-400 font-bold text-lg">
                      {deal.finalPrice?.toFixed(2)} {deal.currency}
                    </span>
                    {deal.basePrice && deal.basePrice > (deal.finalPrice ?? 0) && (
                      <span className="text-gray-500 text-xs line-through">
                        {deal.basePrice.toFixed(2)} {deal.currency}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
