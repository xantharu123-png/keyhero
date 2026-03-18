// @ts-nocheck
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="relative z-20">
      <div className="sticky top-0 z-20 border-b border-pink-600/25 bg-[rgba(10,0,30,0.6)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between md:justify-start md:gap-4">
            <Link href="/" className="text-xl font-semibold leading-none text-white">
              KEY<span className="text-blue-400">HERO</span>
            </Link>
            <span className="rounded border border-pink-600/40 bg-pink-600/15 px-2 py-[2px] text-[10px] text-pink-400">
              BETA
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
            <nav className="flex justify-center gap-6 text-sm font-medium text-gray-400">
              <Link href="/" className="hover:text-blue-400 transition">Home</Link>
              <Link href="/deals" className="hover:text-pink-400 transition">Deals</Link>
              <Link href="/shops" className="hover:text-yellow-400 transition">Shops</Link>
              <Link href="/impressum" className="hover:text-purple-400 transition">Legal</Link>
            </nav>

            <div className="mx-auto w-full max-w-sm md:mx-0">
              <SearchBar variant="header" placeholder="Suche Spiel... z.B. GTA VI" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
