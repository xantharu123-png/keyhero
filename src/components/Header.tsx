// @ts-nocheck
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative z-20">
      <div className="sticky top-0 z-20 border-b border-[rgba(255,0,127,0.3)] bg-[rgba(10,0,30,0.6)] backdrop-blur-md shadow-neonPurple">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* Logo / Brand */}
          <Link href="/" className="font-hero text-xl font-semibold neon-text">
            KEY<span className="text-neonBlue">HERO</span>
            <span className="ml-2 rounded bg-[rgba(255,0,127,0.2)] px-2 py-[2px] text-[10px] font-body font-medium text-neonPink border border-[rgba(255,0,127,0.5)] shadow-neonPink">
              BETA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden gap-6 text-sm font-medium text-textDim md:flex">
            <Link
              href="/"
              className="hover:text-neonBlue hover:drop-shadow-[0_0_6px_rgba(0,204,255,0.8)] transition"
            >
              Home
            </Link>
            <Link
              href="/#deals"
              className="hover:text-neonPink hover:drop-shadow-[0_0_6px_rgba(255,0,127,0.8)] transition"
            >
              Deals
            </Link>
            <Link
              href="/#shops"
              className="hover:text-neonYellow hover:drop-shadow-[0_0_6px_rgba(255,196,0,0.8)] transition"
            >
              Shops
            </Link>
            <Link
              href="/impressum"
              className="hover:text-neonPurple hover:drop-shadow-[0_0_6px_rgba(170,0,255,0.8)] transition"
            >
              Legal
            </Link>
          </nav>

          {/* Suche rechts */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2 rounded-lg border border-[rgba(255,0,127,0.4)] bg-[rgba(10,0,30,0.5)] px-3 py-2 text-xs text-textDim shadow-neonPurple focus-within:shadow-neonBlue">
              <input
                className="bg-transparent text-textBright placeholder-textDim/50 outline-none w-40"
                placeholder="Suche z. B. GTA VI"
              />
              <span className="text-neonBlue text-[10px] font-hero tracking-wider">
                SEARCH
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
