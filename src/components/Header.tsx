// @ts-nocheck
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative z-20">
      <div className="sticky top-0 z-20 border-b border-[rgba(255,0,127,0.3)] bg-[rgba(10,0,30,0.6)] backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between md:justify-start md:gap-4">
            <Link href="/" className="font-hero text-xl font-semibold neon-text leading-none text-textBright">
              KEY<span className="text-neonBlue">HERO</span>
            </Link>
            <span className="rounded border border-[rgba(255,0,127,0.5)] bg-[rgba(255,0,127,0.15)] px-2 py-[2px] text-[10px] font-body font-medium text-neonPink shadow-[0_0_8px_rgba(255,0,127,0.5)]">
              BETA
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
            <nav className="flex justify-center gap-6 text-[13px] font-medium text-textDim">
              <Link href="/" className="hover:text-neonBlue transition-[color,filter] hover:drop-shadow-[0_0_4px_rgba(0,204,255,0.8)]">Home</Link>
              <Link href="/#deals" className="hover:text-neonPink transition-[color,filter] hover:drop-shadow-[0_0_4px_rgba(255,0,127,0.8)]">Deals</Link>
              <Link href="/#shops" className="hover:text-neonYellow transition-[color,filter] hover:drop-shadow-[0_0_4px_rgba(255,196,0,0.8)]">Shops</Link>
              <Link href="/impressum" className="hover:text-neonPurple transition-[color,filter] hover:drop-shadow-[0_0_4px_rgba(170,0,255,0.8)]">Legal</Link>
            </nav>

            <div className="mx-auto w-full max-w-sm md:mx-0">
              <div className="neon-border-soft flex items-center gap-2 px-3 py-2 text-xs text-textDim">
                <input className="w-full bg-transparent text-textBright placeholder-textDim/50 outline-none text-[12px] font-body" placeholder="Suche Spiel ... z. B. GTA VI" />
                <span className="text-neonBlue text-[10px] font-hero tracking-wider">SEARCH</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
