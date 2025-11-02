import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: { slug: string };
};

export default async function GamePage({ params }: Props) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    include: {
      offers: {
        orderBy: { finalPrice: "asc" },
        include: { store: true },
      },
    },
  });

  if (!game) return notFound();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover */}
        <div className="w-full md:w-64 shrink-0">
          <div className="rounded-2xl bg-card aspect-[3/4] flex items-center justify-center text-slate-400 text-xs">
            COVER
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <h1 className="text-white text-2xl font-semibold">{game.name}</h1>
          <p className="text-textDim text-sm leading-relaxed">
            {game.description}
          </p>

          {game.pegi && (
            <div className="text-xs text-textDim">
              PEGI {game.pegi} • Digitaler Key • Sofortlieferung vom Händler
            </div>
          )}
        </div>
      </div>

      {/* Angebote */}
      <section className="bg-card rounded-2xl ring-1 ring-slate-700 overflow-hidden">
        <div className="px-4 py-3 text-white font-medium text-sm flex">
          <div className="w-32">Händler</div>
          <div className="hidden md:block flex-1">
            Edition / Region / Plattform
          </div>
          <div className="w-28 text-right">Endpreis</div>
          <div className="w-28"></div>
        </div>

        {game.offers.map((offer) => (
          <div
            key={offer.id}
            className="px-4 py-4 border-t border-slate-700 text-sm flex items-center"
          >
            {/* Händler */}
            <div className="w-32 text-white font-semibold leading-tight">
              <Link
                href={`/store/${offer.store.slug}`}
                className="hover:text-accent"
              >
                {offer.store.name}
              </Link>
              <div className="text-xs text-textDim">
                ⭐ {offer.store.rating ?? "–"}/5
              </div>
            </div>

            {/* Details */}
            <div className="hidden md:block flex-1 text-textDim leading-tight">
              <div className="text-white text-sm font-medium">
                {offer.edition} Edition
              </div>
              <div className="text-xs">
                Region: {offer.region} • Plattform: {offer.platform}
              </div>
            </div>

            {/* Preis */}
            <div className="w-28 text-right text-white font-semibold text-lg tabular-nums">
              {offer.finalPrice.toFixed(2)} {offer.currency}
            </div>

            {/* Button */}
            <div className="w-28 text-right">
              <Link
                href={`/go/${offer.id}`}
                className="bg-accent text-black font-semibold text-xs px-3 py-2 rounded-xl hover:brightness-110 inline-block text-center"
              >
                Zum Shop →
              </Link>
              <div className="text-[10px] text-textDim mt-1">Affiliate-Link</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
