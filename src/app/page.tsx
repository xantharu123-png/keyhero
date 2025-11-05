// @ts-nocheck
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative">
      <section className="relative z-10 container-xl px-4 pt-12 pb-16 text-center md:pt-16 md:pb-20">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 rounded-full blur-[60px] w-64 h-64 md:w-80 md:h-80 bg-[radial-gradient(circle_at_50%_30%,rgba(255,196,0,0.35)_0%,rgba(255,0,127,0)_70%)] opacity-40" />
        <h1 className="relative z-10 font-hero text-[2.1rem] md:text-[2.5rem] font-semibold leading-tight text-textBright">
          Game Keys vergleichen. <br /><span className="text-neonPink neon-text">Weniger zahlen.</span>
        </h1>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-textDim">
          KeyHero scannt Angebote fÃ¼r PC, Xbox und PlayStation von seriÃ¶sen Anbietern. Du kaufst nicht bei uns â€“ wir zeigen dir nur, wo es gerade am gÃ¼nstigsten ist.
        </p>
        <div className="relative z-10 mx-auto mt-8 max-w-xl neon-border-soft p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input className="w-full flex-1 bg-transparent text-textBright placeholder-textDim/60 outline-none text-sm font-body" placeholder="Spiel eingeben â€¦ z. B. 'Elden Ring'" />
            <Link className="glow-button text-[11px] px-4 py-2 whitespace-nowrap inline-block" href="/deals">Preis checken</Link>
          </div>
          <div className="mt-2 text-[10px] text-textDim/60 text-left font-hero tracking-wider">STEAM â€¢ XBOX â€¢ PLAYSTATION â€¢ GLOBAL KEYS</div>
        </div>
      </section>
    </div>
  );
}

{/* trigger deploy */}

