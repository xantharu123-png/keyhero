// @ts-nocheck
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[rgba(255,0,127,0.25)] bg-[rgba(8,0,20,0.7)] backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-8 text-[12px] text-textDim">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-textBright font-hero">KEY<span className="text-neonBlue">HERO</span></div>
          <nav className="flex gap-4">
            <Link href="/impressum" className="hover:text-neonPink transition">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-neonBlue transition">Datenschutz</Link>
            <Link href="/kontakt" className="hover:text-neonPurple transition">Kontakt</Link>
          </nav>
        </div>
        <div className="mt-3 text-[11px] text-textDim/70">
          Â© {new Date().getFullYear()} KeyHero. Kein Verkauf von Keys - Preisvergleich. Angaben ohne Gewaehr.
        </div>
      </div>
    </footer>
  );
}
