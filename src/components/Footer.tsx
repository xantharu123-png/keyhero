import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-pink-600/25 bg-[rgba(8,0,20,0.65)] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-400">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-white font-semibold">
            KEY<span className="text-blue-400">HERO</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/impressum" className="hover:text-pink-400 transition">
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="hover:text-blue-400 transition"
            >
              Datenschutz
            </Link>
            <Link href="/kontakt" className="hover:text-purple-400 transition">
              Kontakt
            </Link>
          </nav>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} KeyHero. Kein Verkauf von Keys -
          Preisvergleich. Angaben ohne Gewähr.
        </div>
      </div>
    </footer>
  );
}
