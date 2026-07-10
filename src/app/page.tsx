import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/SearchBar";
import { getTopDealScore, isTopDealCandidate } from "@/lib/productQuality";

export const dynamic = "force-dynamic";

async function getTopDeals() {
  const offers = await prisma.offer.findMany({
    take: 300,
    where: {
      finalPrice: { gt: 0 },
    },
    include: {
      game: true,
      store: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const seenGames = new Set<number>();

  return offers
    .filter(isTopDealCandidate)
    .sort((a, b) => getTopDealScore(b) - getTopDealScore(a))
    .filter((offer) => {
      if (seenGames.has(offer.gameId)) return false;
      seenGames.add(offer.gameId);
      return true;
    })
    .slice(0, 9);
}

async function getStats() {
  const [gameCount, storeCount, offerCount] = await Promise.all([
    prisma.game.count(),
    prisma.store.count(),
    prisma.offer.count(),
  ]);
  return { gameCount, storeCount, offerCount };
}

export default async function HomePage() {
  const [topDeals, stats] = await Promise.all([getTopDeals(), getStats()]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-12 pb-16 text-center md:pt-20 md:pb-24">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 rounded-full blur-[80px] w-64 h-64 md:w-96 md:h-96 bg-[radial-gradient(circle_at_50%_30%,rgba(255,196,0,0.25)_0%,rgba(255,0,127,0)_70%)] opacity-50" />

        <h1 className="relative z-10 text-4xl md:text-6xl font-bold leading-tight mb-6">
          Game Keys vergleichen. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-600">
            Weniger zahlen.
          </span>
        </h1>

        <p className="relative z-10 mx-auto max-w-xl text-gray-400 text-lg mb-8">
          Der Preisvergleich für Game Keys in Deutschland, Österreich &amp; der Schweiz.
          Über 20 Shops – Preise in EUR und CHF.
        </p>

        {/* Search */}
        <div className="relative z-40 mx-auto max-w-xl">
          <SearchBar variant="hero" placeholder="Spiel suchen... z.B. 'FC 25'" />
        </div>

        {/* Trust Badges */}
        <div className="relative z-0 mt-8 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {stats.gameCount}+ Spiele
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {stats.storeCount} verifizierte Shops
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            {stats.offerCount}+ Preise verglichen
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            EUR &amp; CHF
          </div>
        </div>
      </section>

      {/* Platform Quick Filter */}
      <section className="container mx-auto px-4 pb-6">
        <div className="flex flex-wrap justify-center gap-3">
          {["PC / Steam", "PlayStation", "Xbox", "Nintendo"].map((platform) => (
            <Link
              key={platform}
              href={`/deals?platform=${encodeURIComponent(platform)}`}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:border-pink-500/50 hover:text-pink-400 transition-all"
            >
              {platform}
            </Link>
          ))}
        </div>
      </section>

      {/* Games Grid */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-pink-600 pl-4">
          Aktuelle Top-Deals
        </h2>

        {topDeals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Noch keine Spiele in der Datenbank.</p>
            <p className="text-sm">
              Führe den Importer aus, um Spiele und Preise zu laden.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {topDeals.map((offer: any) => {
              const game = offer.game;
              const lowestPrice = offer.finalPrice
                ? `${offer.finalPrice.toFixed(2)} €`
                : "N/A";

              return (
                <Link
                  key={offer.id}
                  href={`/game/${game.slug}`}
                  className="group block bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all hover:transform hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gray-900 overflow-hidden">
                    {game.coverImage ? (
                      <img
                        src={game.coverImage}
                        alt={`${game.name} Game Key`}
                        className="w-full h-full object-contain p-3 group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-600">
                        Kein Bild
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/80 text-xs font-bold px-2 py-1 rounded text-pink-400 border border-pink-500/30">
                      {lowestPrice}
                    </div>
                    {offer?.store?.name && (
                      <div className="absolute bottom-2 left-2 bg-black/80 text-[10px] px-2 py-0.5 rounded text-gray-300 border border-white/10">
                        via {offer.store.name}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-100 group-hover:text-pink-500 transition-colors truncate">
                      {game.name}
                    </h3>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                      <span>{offer.platform || "Game Key"}</span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded">
                        DACH
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Link */}
        {topDeals.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-pink-600/20 border border-pink-500/30 text-pink-400 font-medium hover:bg-pink-600/30 transition-all"
            >
              Alle Deals anzeigen →
            </Link>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">So funktioniert KeyHero</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Spiel suchen",
              text: "Gib den Namen deines Spiels ein und finde sofort alle verfügbaren Angebote.",
            },
            {
              step: "2",
              title: "Preise vergleichen",
              text: "Vergleiche Preise aus über 20 seriösen Key-Shops. Alle Preise in EUR, mit CHF-Umrechnung.",
            },
            {
              step: "3",
              title: "Günstig kaufen",
              text: "Klicke auf \"Zum Shop\" und kaufe direkt beim Händler deiner Wahl. Sicher und schnell.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-pink-600/20 border border-pink-500/30 flex items-center justify-center mx-auto mb-3 text-pink-400 font-bold text-lg">
                {item.step}
              </div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEO-Text */}
      <section className="container mx-auto px-4 pb-16 max-w-3xl">
        <h2 className="text-lg font-semibold text-white mb-3">Game Keys Preisvergleich für die DACH-Region</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          KeyHero ist dein Preisvergleich für digitale Game Keys in Deutschland, Österreich und der Schweiz.
          Wir durchsuchen über 20 Key-Shops wie MMOGA, Eneba, Kinguin, G2A und weitere, um dir immer den
          besten Preis zu zeigen. Ob Steam-Key, PlayStation Store, Xbox oder Nintendo eShop – bei KeyHero
          findest du den günstigsten Preis in Euro (EUR) und Schweizer Franken (CHF). Wir sind kein Shop,
          sondern ein unabhängiger Preisvergleich. Alle Käufe erfolgen direkt beim jeweiligen Händler.
        </p>
      </section>
    </div>
  );
}
