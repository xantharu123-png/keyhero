import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const games = await prisma.game.findMany({
    take: 8,
    include: {
      offers: {
        orderBy: { finalPrice: "asc" },
        take: 1,
        include: { store: true },
      },
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            Beste Game Deals heute
          </h1>
          <p className="text-textDim text-sm">
            Preise vergleichen. Sicher kaufen. Wir verdienen ggf. Provision 💙
          </p>
        </div>

        <div className="w-full md:w-80">
          <input
            className="w-full rounded-xl bg-card text-white px-4 py-3 text-sm outline-none ring-1 ring-slate-600 placeholder-slate-500"
            placeholder="Suche nach Spiel, z. B. 'FC 25'…"
          />
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game) => {
          const best = game.offers[0];
          return (
            <Link
              key={game.id}
              href={`/game/${game.slug}`}
              className="bg-card rounded-2xl p-4 ring-1 ring-slate-700 hover:ring-accent transition"
            >
              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-800 mb-3 flex items-center justify-center text-xs text-slate-400">
                COVER
              </div>

              <div className="text-white font-medium leading-tight line-clamp-2">
                {game.name}
              </div>

              {best ? (
                <div className="mt-2 text-sm text-textDim">
                  ab{" "}
                  <span className="text-white font-semibold">
                    {best.finalPrice.toFixed(2)} {best.currency}
                  </span>{" "}
                  bei {best.store.name}
                </div>
              ) : (
                <div className="mt-2 text-sm text-textDim">
                  Keine Angebote
                </div>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
