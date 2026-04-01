import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Game Key Deals – Die besten Preise heute",
  description:
    "Aktuelle Game-Key-Angebote für Steam, PlayStation, Xbox & Nintendo. Täglich aktualisierte Preise aus 20+ Shops für die DACH-Region.",
  alternates: { canonical: "https://keyhero.ch/deals" },
};

interface DealsPageProps {
  searchParams: { platform?: string; sort?: string };
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const platformFilter = searchParams.platform || "";
  const sortBy = searchParams.sort || "price";

  let deals: any[] = [];
  try {
    deals = await prisma.offer.findMany({
      take: 60,
      orderBy:
        sortBy === "newest"
          ? { createdAt: "desc" }
          : { finalPrice: "asc" },
      where: {
        finalPrice: { gt: 0 },
        ...(platformFilter
          ? { platform: { contains: platformFilter, mode: "insensitive" } }
          : {}),
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

  // Get unique platforms for filter
  const platforms = [...new Set(deals.map((d: any) => d.platform))].filter(Boolean).sort();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Game Key Deals</h1>
        <p className="text-sm text-gray-400">
          Live-Preise aus 20+ Shops. Alle Angaben in EUR, CHF wo verfügbar. Angaben ohne Gewähr.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Platform Filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/deals"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !platformFilter
                ? "bg-pink-600/20 border-pink-500/50 text-pink-400"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-pink-500/30"
            }`}
          >
            Alle
          </Link>
          {["PC", "Steam", "PlayStation", "Xbox", "Nintendo"].map((p) => (
            <Link
              key={p}
              href={`/deals?platform=${encodeURIComponent(p)}${sortBy !== "price" ? `&sort=${sortBy}` : ""}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                platformFilter === p
                  ? "bg-pink-600/20 border-pink-500/50 text-pink-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-pink-500/30"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-2 ml-auto">
          <Link
            href={`/deals${platformFilter ? `?platform=${platformFilter}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              sortBy === "price"
                ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-blue-500/30"
            }`}
          >
            Günstigste
          </Link>
          <Link
            href={`/deals?sort=newest${platformFilter ? `&platform=${platformFilter}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              sortBy === "newest"
                ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-blue-500/30"
            }`}
          >
            Neueste
          </Link>
        </div>
      </div>

      {!hasDeals && (
        <div className="border border-white/10 rounded-xl p-6 text-sm text-gray-400 text-center">
          {platformFilter
            ? `Keine Deals für "${platformFilter}" gefunden. `
            : "Noch keine Deals in der Datenbank. "}
          <Link href="/deals" className="text-pink-400 hover:underline">
            Alle Deals anzeigen
          </Link>
        </div>
      )}

      {hasDeals && (
        <>
          <div className="text-xs text-gray-500 mb-4">{deals.length} Angebote gefunden</div>
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
                        alt={`${deal.game.name} Key`}
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
                      {deal.store?.name || "Shop"} · {deal.platform} · {deal.region || "Global"}
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-pink-400 font-bold text-lg">
                        {deal.finalPrice?.toFixed(2)} {deal.currency || "€"}
                      </span>
                      {deal.basePrice && deal.basePrice > (deal.finalPrice ?? 0) && (
                        <span className="text-gray-500 text-xs line-through">
                          {deal.basePrice.toFixed(2)} {deal.currency || "€"}
                        </span>
                      )}
                    </div>
                    {deal.priceChf && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        ≈ CHF {deal.priceChf.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
