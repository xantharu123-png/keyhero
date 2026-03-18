import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Shops - KeyHero",
  description: "Verglichene Händler",
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
      <h1 className="text-2xl font-bold text-white mb-2">Shops</h1>
      <p className="text-sm text-gray-400 mb-6">
        Wir vergleichen seriöse Anbieter für digitale Keys.
      </p>

      {stores.length === 0 ? (
        <div className="border border-white/10 rounded-xl p-6 text-sm text-gray-400 text-center">
          Noch keine Shops in der Datenbank. Führe den Importer aus um Daten zu
          laden.
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
                <div className="text-xs text-green-400 mt-2">Verifiziert</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
