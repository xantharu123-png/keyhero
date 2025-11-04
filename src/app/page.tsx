// @ts-nocheck
import Link from "next/link";

export default function HomePage() {
  const topDeals = [
    { id: 1, title: "EA SPORTS FC 25", platform: "PC / EA App Key", price: "24.99 CHF", shop: "CDKeys", rating: "4.8/5" },
    { id: 2, title: "Call of Duty: Black Ops 6", platform: "Xbox Series Key", price: "39.90 CHF", shop: "Eneba", rating: "4.6/5" },
    { id: 3, title: "Elden Ring", platform: "Steam Key (Global)", price: "17.50 CHF", shop: "Instant Gaming", rating: "4.9/5" },
  ];

  return (
    <div className="relative">
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-16 text-center md:pt-16 md:pb-20">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 rounded-full blur-[60px] w-64 h-64 md:w-80 md:h-80 bg-[radial-gradient(circle_at_50%_30%,rgba(255,196,0,0.4)_0%,rgba(255,0,127,0)_70%)] opacity-40"></div>
        <h1 className="relative z-10 font-hero text-[1.9rem] md:text-[2.3rem] font-semibold leading-tight text-textBright drop-shadow-[0_0_10px_rgba(255,0,127,0.4)]">
          Game Keys vergleichen. <br /><span className="text-neonPink neon-text">Weniger zahlen.</span>
        </h1>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-textDim">
          KeyHero scannt Angebote fuer PC, Xbox und PlayStation von serioesen Anbietern. Du kaufst nicht bei uns - wir zeigen dir nur, wo es gerade am guenstigsten ist.
        </p>
        <div className="relative z-10 mx-auto mt-8 max-w-xl neon-border-soft p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input className="w-full flex-1 bg-transparent text-textBright placeholder-textDim/50 outline-none text-sm font-body" placeholder="Spiel eingeben ... z. B. 'Elden Ring'" />
            <button className="glow-button text-[11px] px-4 py-2 whitespace-nowrap">Preis checken</button>
          </div>
          <div className="mt-2 text-[10px] text-textDim/60 text-left font-hero tracking-wider">STEAM â€¢ XBOX â€¢ PLAYSTATION â€¢ GLOBAL KEYS</div>
        </div>
      </section>

      <section id="deals" className="relative z-10 mx-auto max-w-6xl px-4 pb-16 text-textBright">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-hero text-[0.8rem] tracking-wider text-neonBlue drop-shadow-[0_0_6px_rgba(0,204,255,0.6)]">TOP DEALS HEUTE</div>
            <div className="text-[12px] text-textDim/70 leading-relaxed max-w-md">Live aus unseren Daten. Preise in CHF. Angaben ohne Gewaehr.</div>
          </div>
          <Link href="#" className="text-[11px] font-hero tracking-wider text-textDim hover:text-neonPink hover:drop-shadow-[0_0_4px_rgba(255,0,127,0.8)] transition self-start md:self-auto">Alle Spiele -></Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {topDeals.map((deal) => (
            <div key={deal.id} className="neon-panel p-4 text-left text-[13px] leading-relaxed">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-hero text-textBright text-[14px] leading-tight">{deal.title}</div>
                  <div className="text-[11px] text-textDim/70">{deal.platform}</div>
                </div>
                <div className="text-right">
                  <div className="text-neonPink font-hero text-[15px] leading-none drop-shadow-[0_0_6px_rgba(255,0,127,0.6)]">{deal.price}</div>
                  <div className="text-[10px] text-textDim/70 leading-tight">bei {deal.shop}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-textDim/70">
                <div>{deal.rating} *</div>
                <Link href="#" className="glow-button text-[10px] px-3 py-2 leading-none font-hero tracking-wider">Zum Angebot -></Link>
              </div>

              <div className="mt-3 text-[10px] text-textDim/40 leading-relaxed">
                Kauf findet beim Haendler statt. Wir bekommen evtl. eine kleine Provision.
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="shops" className="relative z-10 mx-auto max-w-6xl px-4 pb-24 text-textBright">
        <div className="mb-4">
          <div className="font-hero text-[0.8rem] tracking-wider text-neonPurple drop-shadow-[0_0_6px_rgba(170,0,255,0.6)]">VERTRIEBSPARTNER & SHOPS</div>
          <div className="text-[12px] text-textDim/70 leading-relaxed max-w-md">Wir vergleichen nur Anbieter, die digitale Keys liefern. Keine physischen Boxen, nur Codes.</div>
        </div>
        <div className="grid gap-4 text-[12px] text-textDim/80 md:grid-cols-4">
          <div className="neon-border-soft p-4 text-center"><div className="text-textBright font-hero text-[13px]">CDKeys</div><div className="text-[10px] text-textDim/60 mt-1">Trusted Seller</div></div>
          <div className="neon-border-soft p-4 text-center"><div className="text-textBright font-hero text-[13px]">Eneba</div><div className="text-[10px] text-textDim/60 mt-1">Key Marketplace</div></div>
          <div className="neon-border-soft p-4 text-center"><div className="text-textBright font-hero text-[13px]">Instant Gaming</div><div className="text-[10px] text-textDim/60 mt-1">PC Keys</div></div>
          <div className="neon-border-soft p-4 text-center"><div className="text-textBright font-hero text-[13px]">G2A</div><div className="text-[10px] text-textDim/60 mt-1">Global Keys</div></div>
        </div>
        <div className="mt-6 text-[10px] text-textDim/40 leading-relaxed max-w-xl">Wir sind kein Verkaeufer. Wir listen Preise. Du kaufst beim Haendler. Unser Service bleibt fuer dich kostenlos.</div>
      </section>
    </div>
  );
}
