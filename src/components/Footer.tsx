import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-pink-600/25 bg-[rgba(8,0,20,0.65)] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-400">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-lg">
              KEY<span className="text-blue-400">HERO</span>
              <span className="text-gray-600 text-xs">.ch</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Game-Key-Preisvergleich für Deutschland, Österreich &amp; die Schweiz.
              Preise in EUR und CHF.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <div className="text-white font-medium text-xs uppercase tracking-wider mb-3">Navigation</div>
            <nav className="flex flex-col gap-1.5">
              <Link href="/" className="hover:text-pink-400 transition text-xs">Home</Link>
              <Link href="/deals" className="hover:text-pink-400 transition text-xs">Deals</Link>
              <Link href="/shops" className="hover:text-pink-400 transition text-xs">Shops</Link>
            </nav>
          </div>

          {/* Plattformen */}
          <div className="space-y-2">
            <div className="text-white font-medium text-xs uppercase tracking-wider mb-3">Plattformen</div>
            <nav className="flex flex-col gap-1.5">
              <Link href="/deals?platform=Steam" className="hover:text-pink-400 transition text-xs">Steam</Link>
              <Link href="/deals?platform=PlayStation" className="hover:text-pink-400 transition text-xs">PlayStation</Link>
              <Link href="/deals?platform=Xbox" className="hover:text-pink-400 transition text-xs">Xbox</Link>
              <Link href="/deals?platform=Nintendo" className="hover:text-pink-400 transition text-xs">Nintendo</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <div className="text-white font-medium text-xs uppercase tracking-wider mb-3">Rechtliches</div>
            <nav className="flex flex-col gap-1.5">
              <Link href="/impressum" className="hover:text-pink-400 transition text-xs">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-pink-400 transition text-xs">Datenschutz</Link>
              <Link href="/kontakt" className="hover:text-pink-400 transition text-xs">Kontakt</Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} KeyHero. Kein Verkauf von Keys – unabhängiger Preisvergleich. Angaben ohne Gewähr.
          </div>
          <div className="text-xs text-gray-600">
            Wir erhalten ggf. eine Provision bei Kauf über unsere Links (Affiliate).
          </div>
        </div>
      </div>
    </footer>
  );
}
