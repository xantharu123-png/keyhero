// @ts-nocheck
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[rgba(255,0,127,0.3)] bg-[rgba(5,0,20,0.7)] backdrop-blur-xl shadow-neonPurple mt-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-textDim md:grid-cols-3">
        <div className="space-y-2">
          <div className="font-hero text-lg font-semibold text-textBright neon-text">
            KEY<span className="text-neonBlue">HERO</span>
          </div>
          <p className="text-[12px] leading-relaxed text-textDim/80">
            KeyHero vergleicht digitale Game Keys weltweit und zeigt dir die
            günstigsten Preise für PC, Xbox und PlayStation. Kein eigener
            Verkauf – wir leiten dich nur weiter.
          </p>
        </div>

        <div>
          <div className="mb-3 font-hero text-[12px] tracking-wider text-neonPink">
            NAVIGATION
          </div>
          <ul className="space-y-2 text-[13px]">
            <li>
              <Link
                className="hover:text-neonBlue hover:drop-shadow-[0_0_6px_rgba(0,204,255,0.8)] transition"
                href="/"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-neonPink hover:drop-shadow-[0_0_6px_rgba(255,0,127,0.8)] transition"
                href="/#deals"
              >
                Deals
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-neonPurple hover:drop-shadow-[0_0_6px_rgba(170,0,255,0.8)] transition"
                href="/#shops"
              >
                Shops
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-hero text-[12px] tracking-wider text-neonPink">
            RECHTLICHES
          </div>
          <ul className="space-y-2 text-[13px]">
            <li>
              <Link
                href="/impressum"
                className="hover:text-neonYellow hover:drop-shadow-[0_0_6px_rgba(255,196,0,0.8)] transition"
              >
                Impressum & Kontakt
              </Link>
            </li>
            <li className="text-[11px] text-textDim/50 leading-relaxed">
              © {new Date().getFullYear()} KeyHero. Alle Rechte vorbehalten.
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
