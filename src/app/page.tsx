// @ts-nocheck
import Link from "next/link";

export default function HomePage() {
  // Platzhalter-Daten bis wir echte DB-Infos reinziehen
  const topDeals = [
    {
      id: 1,
      title: "EA SPORTS FC 25",
      platform: "PC / EA App Key",
      bestPrice: "24.99 CHF",
      shop: "CDKeys",
      rating: "4.8/5",
    },
    {
      id: 2,
      title: "Call of Duty: Black Ops 6",
      platform: "Xbox Series Key",
      bestPrice: "39.90 CHF",
      shop: "Eneba",
      rating: "4.6/5",
    },
    {
      id: 3,
      title: "Elden Ring",
      platform: "Steam Key (Global)",
      bestPrice: "17.50 CHF",
      shop: "Instant Gaming",
      rating: "4.9/5",
    },
  ];

  return (
    <div className="relative">
      {/* HERO SECTION */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        {/* künstliche Sonne / Glow */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-64 rounded-full bg-synthSun opacity-40 blur-[40px] md:h-80 md:w-80 md:blur-[60px]" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <h1 className="font-hero text-3xl font-semibold leading-tight text-textBright drop-shadow-[0_0_12px_rgba(255,0,127,0.6)] md:text-4xl">
            Finde deinen{" "}
            <span className="text-neonPink neon-text">Game-Key</span> <br />
            zum besten Preis
          </h1>

          <p className="max-w-xl text-[13px] leading-relaxed text-textDim">
            KeyHero vergleicht Preise für digitale Spielekeys (PC, Xbox,
            PlayStation) aus vielen Shops weltweit. Kein eigener Verkauf –
            einfach der beste Deal für dich.
          </p>
        </div>

        {/* Suchbox */}
        <div className="relative z-10 w-full max-w-xl neon-border rounded-xl p-4 shadow-neonBlue">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              className="w-full flex-1 bg-transparent text-textBright placeholder-textDim/50 outline-none text-sm font-body"
              placeholder="Suche nach einem Spiel … z. B. 'GTA VI'"
            />
            <button className="glow-button text-xs px-4 py-2 whitespace-nowrap">
              Suchen
            </button>
          </div>
          <div className="mt-2 text-[10px] text-textDim/60 text-left font-hero tracking-wider">
            STEAM / XBOX / PLAYSTATION / PC / GLOBAL KEYS
          </div>
        </div>
      </section>

      {/* TOP DEALS */}
      <section
        id="deals"
        className="relative z-10 mx-auto max-w-6xl px-4 pb-20 text-textBright"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-hero text-lg tracking-wider text-neonBlue drop-shadow-[0_0_8px_rgba(0,204,255,0.8)]">
            🔥 TOP DEALS HEUTE
          </h2>
          <Link
            href="#"
            className="text-[11px] font-hero tracking-wider text-textDim hover:text-neonPink hover:drop-shadow-[0_0_6px_rgba(255,0,127,0.8)] transition"
          >
            Alle Deals →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {topDeals.map((deal) => (
            <div
              key={deal.id}
              className="neon-border card-hover rounded-xl border border-[rgba(255,0,127,0.4)] p-4 text-left shadow-neonPurple"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-hero text-textBright text-[14px] leading-tight">
                    {deal.title}
                  </div>
                  <div className="text-[11px] text-textDim/70">
                    {deal.platform}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neonPink font-hero text-sm leading-none drop-shadow-[0_0_6px_rgba(255,0,127,0.8)]">
                    {deal.bestPrice}
                  </div>
                  <div className="text-[10px] text-textDim/70 leading-tight">
                    bei {deal.shop}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-textDim/70">
                <div>{deal.rating} ⭐</div>
                <Link
                  href="#"
                  className="glow-button text-[10px] px-3 py-2 leading-none font-hero tracking-wider"
                >
                  Zum Angebot →
                </Link>
              </div>

              <div className="mt-3 text-[9px] text-textDim/40 leading-relaxed">
                Affiliate-Link. Kauf beim Händler. Preise ohne Gewähr.
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHOPS / PARTNER */}
      <section
        id="shops"
        className="relative z-10 mx-auto max-w-6xl px-4 pb-24 text-textBright"
      >
        <h2 className="mb-6 font-hero text-lg tracking-wider text-neonPurple drop-shadow-[0_0_8px_rgba(170,0,255,0.8)]">
          VERTRIEBSPARTNER & SHOPS
        </h2>

        <div className="grid gap-4 text-[12px] text-textDim/80 md:grid-cols-4">
          <div className="rounded-lg border border-[rgba(255,0,127,0.4)] bg-cardGrad p-4 text-center shadow-neonPink">
            CDKeys
            <div className="text-[10px] text-textDim/50">Trusted Seller</div>
          </div>
          <div className="rounded-lg border border-[rgba(0,204,255,0.4)] bg-cardGrad p-4 text-center shadow-neonBlue">
            Eneba
            <div className="text-[10px] text-textDim/50">Key Marketplace</div>
          </div>
          <div className="rounded-lg border border-[rgba(170,0,255,0.4)] bg-cardGrad p-4 text-center shadow-neonPurple">
            Instant Gaming
            <div className="text-[10px] text-textDim/50">PC Keys</div>
          </div>
          <div className="rounded-lg border border-[rgba(255,196,0,0.4)] bg-cardGrad p-4 text-center shadow-[0_0_10px_rgba(255,196,0,0.8),0_0_30px_rgba(255,196,0,0.4)]">
            G2A
            <div className="text-[10px] text-textDim/50">Global Keys</div>
          </div>
        </div>

        <div className="mt-6 text-[10px] text-textDim/40 leading-relaxed max-w-xl">
          Wir listen Händler weltweit. Wir verkaufen selbst keine Keys. Alle
          Käufe passieren beim jeweiligen Anbieter. Wir zeigen dir nur den
          günstigsten Preis, den wir gerade gefunden haben.
        </div>
      </section>
    </div>
  );
}
