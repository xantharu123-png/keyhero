import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Key-Shops im Vergleich – Verifizierte Händler",
  description:
    "Übersicht aller Key-Shops die KeyHero vergleicht. Verifizierte Händler für sichere Game-Key-Käufe in der DACH-Region.",
  alternates: { canonical: "https://keyhero.ch/shops" },
};

export default async function ShopsPage() {
  let stores: any[] = [];
  try {
    stores = await prisma.store.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { offers: true } },
      },
    });
  } catch (e) {
    console.error("Stores fetch error:", e);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Key-Shops</h1>
      <p className="text-sm text-gray-400 mb-6">
        Wir vergleichen Preise aus seriösen und verifizierten Key-Shops für die DACH-Region.
      </p>

      {stores.length === 0 ? (
        <div className="border border-white/10 rounded-xl p-6 text-sm text-gray-400 text-center">
          Noch keine Shops in der Datenbank.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {stores.map((store: any) => (
            <Link
              key={store.id}
              href={`/store/${store.slug}`}
              className="group block bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:border-pink-500/50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-pink-600/20 border border-pink-500/30 flex items-center justify-center mx-auto mb-3 text-pink-400 font-bold text-lg">
                {store.name.charAt(0)}
              </div>
              <div className="text-white font-semibold text-sm group-hover:text-pink-400 transition-colors">
                {store.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {store._count.offers} Angebote
              </div>
              {store.isVerified && (
                <div className="text-xs text-green-400 mt-2 flex items-center justify-center gap-1">
                  <span>✓</span> Verifiziert
                </div>
              )}
              {store.rating && (
                <div className="text-xs text-yellow-400/70 mt-1">
                  {store.rating}/5
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
