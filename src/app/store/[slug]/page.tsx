import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney, isGameKeyProduct } from "@/lib/productQuality";

type StorePageProps = {
  params: {
    slug: string;
  };
};

export default async function StorePage({ params }: StorePageProps) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    include: {
      offers: {
        where: {
          finalPrice: { gt: 0 },
        },
        include: {
          game: true,
        },
        orderBy: { finalPrice: "asc" },
        take: 30,
      },
    },
  });

  if (!store) return notFound();

  const offers = store.offers.filter((offer) => isGameKeyProduct(offer.game.name)).slice(0, 12);

  return (
    <div className="container-xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="neon-panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-hero text-[11px] uppercase tracking-[0.22em] text-neonBlue">Händlerprofil</p>
              <h1 className="mt-2 text-3xl font-bold text-textBright">{store.name}</h1>
              <div className="mt-2 text-sm text-textDim">
                {store.rating ? `${store.rating.toFixed(1)}/5` : "Rating offen"} ·{" "}
                {store.isVerified ? "verifiziert" : "nicht verifiziert"}
              </div>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white/10 font-hero text-lg text-textBright">
              {store.name.slice(0, 1)}
            </div>
          </div>

          {store.description ? <p className="mt-5 text-sm leading-relaxed text-textDim">{store.description}</p> : null}

          <div className="mt-5 border-t border-white/10 pt-5 text-sm text-textDim">
            <div className="text-[11px] uppercase tracking-[0.16em] text-textDim/70">Zahlungen</div>
            <div className="mt-2 text-textBright">
              {store.paymentMethods.length > 0 ? store.paymentMethods.join(", ") : "Noch keine Angaben"}
            </div>
          </div>

          {store.website ? (
            <div className="mt-5 text-sm text-textDim">
              <div className="text-[11px] uppercase tracking-[0.16em] text-textDim/70">Website</div>
              <a href={store.website} target="_blank" rel="nofollow noopener" className="mt-2 block break-all text-neonBlue">
                {store.website}
              </a>
            </div>
          ) : null}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-hero text-[11px] uppercase tracking-[0.22em] text-neonPink">Günstigste Listings</p>
              <h2 className="mt-1 text-2xl font-bold text-textBright">Aktuelle Angebote</h2>
            </div>
          </div>

          {offers.length === 0 ? (
            <div className="neon-border-soft p-5 text-sm text-textDim">Keine gültigen Game-Key-Angebote für diesen Shop gefunden.</div>
          ) : (
            <div className="grid gap-3">
              {offers.map((offer) => (
                <Link
                  key={offer.id}
                  href={`/game/${offer.game.slug}`}
                  className="neon-border-soft grid gap-3 p-4 transition hover:border-neonPink/50 md:grid-cols-[1fr_140px]"
                >
                  <div>
                    <div className="font-semibold text-textBright">{offer.game.name}</div>
                    <div className="mt-1 text-xs text-textDim">
                      {offer.platform} · {offer.region || "Global"} · {offer.edition || "Standard"}
                    </div>
                  </div>
                  <div className="font-hero text-neonYellow md:text-right">
                    {formatMoney(offer.finalPrice, offer.currency ?? "EUR")}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
