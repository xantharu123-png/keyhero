// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

/* ─── Dynamic SEO Metadata ─── */
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    include: { offers: { orderBy: { finalPrice: "asc" }, take: 1 } },
  });

  if (!game) return { title: "Spiel nicht gefunden" };

  const lowest = game.offers[0]?.finalPrice;
  const priceText = lowest ? `ab ${lowest.toFixed(2)} €` : "";

  return {
    title: `${game.name} Key kaufen ${priceText} – Preisvergleich`,
    description: `${game.name} Key günstig kaufen. Preise aus 20+ Shops vergleichen. ${priceText ? `Bester Preis: ${priceText}.` : ""} Sicher kaufen für PC, PlayStation & Xbox in der DACH-Region.`,
    alternates: {
      canonical: `https://keyhero.ch/game/${game.slug}`,
    },
    openGraph: {
      title: `${game.name} – Günstigster Key ${priceText}`,
      description: `Vergleiche ${game.name} Key-Preise aus über 20 Shops. Beste Deals für die DACH-Region.`,
      url: `https://keyhero.ch/game/${game.slug}`,
      ...(game.coverImage ? { images: [{ url: game.coverImage, alt: game.name }] } : {}),
    },
  };
}

/* ─── Page Component ─── */
export default async function GamePage({ params }: any) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    include: {
      offers: {
        orderBy: { finalPrice: "asc" },
        include: {
          store: true,
          priceHistory: {
            orderBy: { checkedAt: "desc" },
            take: 30,
          },
        },
      },
    },
  });

  if (!game) return notFound();

  const lowestPrice = game.offers[0]?.finalPrice;
  const highestPrice = game.offers.length > 1
    ? game.offers[game.offers.length - 1]?.finalPrice
    : null;

  /* JSON-LD Product Schema */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${game.name} – Game Key`,
    description: game.description || `${game.name} als digitaler Game Key`,
    ...(game.coverImage ? { image: game.coverImage } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      ...(lowestPrice ? { lowPrice: lowestPrice.toFixed(2) } : {}),
      ...(highestPrice ? { highPrice: highestPrice.toFixed(2) } : {}),
      offerCount: game.offers.length,
      availability: game.offers.length > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-pink-400 transition">Home</Link>
        <span>›</span>
        <Link href="/deals" className="hover:text-pink-400 transition">Deals</Link>
        <span>›</span>
        <span className="text-gray-300">{game.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover */}
        <div className="w-full md:w-64 shrink-0">
          <div className="rounded-2xl bg-card aspect-[3/4] overflow-hidden shadow-lg border border-slate-700 relative">
            {game.coverImage ? (
              <img
                src={game.coverImage}
                alt={`${game.name} Cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Kein Bild
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <h1 className="text-white text-3xl font-bold tracking-tight">{game.name}</h1>

          <p className="text-textDim text-base leading-relaxed max-w-2xl">
            {game.description || `Vergleiche die besten Preise für ${game.name} und spare beim Kauf deines Game Keys.`}
          </p>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap gap-2">
            {game.pegi && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-gray-300">
                PEGI {game.pegi}
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-gray-300">
              Digitaler Key
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-gray-300">
              Sofortlieferung
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-xs text-blue-400">
              DACH-Region
            </span>
          </div>

          {/* Best Price Highlight */}
          {lowestPrice && (
            <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 rounded-xl p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Bester Preis</div>
              <div className="text-3xl font-bold text-pink-400 mt-1">
                {lowestPrice.toFixed(2)} €
              </div>
              <div className="text-xs text-gray-500 mt-1">
                aus {game.offers.length} {game.offers.length === 1 ? "Angebot" : "Angeboten"} verglichen
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price History Mini-Chart (CSS only) */}
      {game.offers[0]?.priceHistory && game.offers[0].priceHistory.length > 1 && (
        <section className="bg-white/5 rounded-2xl ring-1 ring-slate-700 p-6">
          <h2 className="text-white font-semibold text-lg mb-4">Preisverlauf (günstigstes Angebot)</h2>
          <PriceHistoryChart history={game.offers[0].priceHistory} />
        </section>
      )}

      {/* Preisvergleich Tabelle */}
      <section className="bg-card rounded-2xl ring-1 ring-slate-700 overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-800/50 text-textDim font-medium text-xs uppercase tracking-wider flex border-b border-slate-700">
          <div className="w-40">Händler</div>
          <div className="hidden md:block flex-1">Details</div>
          <div className="w-32 text-right">Preis</div>
          <div className="w-32"></div>
        </div>

        {game.offers.length > 0 ? (
          game.offers.map((offer: any, idx: number) => (
            <div
              key={offer.id}
              className={`px-4 py-4 border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors flex items-center group ${idx === 0 ? "bg-pink-500/5" : ""}`}
            >
              {/* Händler */}
              <div className="w-40 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {offer.store.name.substring(0, 1)}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm leading-tight">
                    {offer.store.name}
                  </div>
                  {offer.store.isVerified && (
                    <div className="text-[10px] text-green-400 flex items-center gap-1">
                      ✓ Verifiziert
                    </div>
                  )}
                </div>
                {idx === 0 && (
                  <span className="ml-1 text-[9px] bg-pink-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase">
                    Best
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="hidden md:block flex-1 text-textDim leading-tight">
                <div className="text-white text-sm font-medium flex items-center gap-2">
                  <span className="bg-slate-700 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {offer.edition || "Standard"}
                  </span>
                  <span>{offer.platform}</span>
                </div>
                <div className="text-xs mt-1">
                  Region: {offer.region || "Global"}
                </div>
              </div>

              {/* Preis */}
              <div className="w-32 text-right">
                <div className="text-accent font-bold text-lg tabular-nums">
                  {offer.finalPrice?.toFixed(2)} {offer.currency || "€"}
                </div>
                {offer.priceChf && (
                  <div className="text-[10px] text-textDim">
                    ≈ CHF {offer.priceChf.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Kaufen Button */}
              <div className="w-32 text-right pl-4">
                <Link
                  href={`/go/${offer.id}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="bg-accent hover:bg-accent/90 text-black font-bold text-xs px-4 py-2.5 rounded-lg inline-block text-center w-full transition-all transform hover:scale-105"
                >
                  Zum Shop →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-textDim">
            Keine Angebote für dieses Spiel gefunden.
          </div>
        )}
      </section>

      {/* SEO-Text */}
      <section className="text-sm text-gray-500 leading-relaxed max-w-3xl">
        <h2 className="text-white font-semibold text-lg mb-2">{game.name} Key günstig kaufen</h2>
        <p>
          Bei KeyHero findest du den besten Preis für {game.name} als digitalen Game Key.
          Wir vergleichen Angebote aus über 20 seriösen Shops – darunter MMOGA, Eneba, Kinguin und mehr.
          Alle Preise werden in Euro (EUR) angezeigt, mit Umrechnung in Schweizer Franken (CHF) wo verfügbar.
          So findest du immer den günstigsten Key für Deutschland, Österreich und die Schweiz.
        </p>
      </section>
    </div>
  );
}

/* ─── Price History Chart Component (SVG) ─── */
function PriceHistoryChart({ history }: { history: { price: number; checkedAt: Date }[] }) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
  );

  if (sorted.length < 2) return null;

  const prices = sorted.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const width = 600;
  const height = 120;
  const padY = 10;

  const points = sorted
    .map((h, i) => {
      const x = (i / (sorted.length - 1)) * width;
      const y = padY + ((max - h.price) / range) * (height - 2 * padY);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" preserveAspectRatio="none">
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(236,72,153)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(236,72,153)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#priceGrad)" />
        <polyline points={points} fill="none" stroke="rgb(236,72,153)" strokeWidth="2" />
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{new Date(sorted[0].checkedAt).toLocaleDateString("de-CH")}</span>
        <span className="text-pink-400 font-medium">
          Tiefstpreis: {min.toFixed(2)} € · Aktuell: {prices[prices.length - 1].toFixed(2)} €
        </span>
        <span>{new Date(sorted[sorted.length - 1].checkedAt).toLocaleDateString("de-CH")}</span>
      </div>
    </div>
  );
}
