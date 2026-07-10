import { prisma } from "@/lib/prisma";
import { supplierCatalog, type SupplierCatalogEntry } from "@/lib/supplierCatalog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Key-Shops im Vergleich - Verifizierte Haendler",
  description:
    "Uebersicht aller Key-Shops, Marktplaetze und offiziellen Stores, die KeyHero fuer Game-Key-Preise vorbereitet oder aktiv vergleicht.",
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

  const storeBySlug = new Map(stores.map((store) => [store.slug, store]));
  const catalogSlugs = new Set(supplierCatalog.map((supplier) => supplier.slug));
  const supplierCards = supplierCatalog.map((supplier) => ({
    supplier,
    store: storeBySlug.get(supplier.slug),
  }));
  const extraStores = stores
    .filter((store) => !catalogSlugs.has(store.slug))
    .map((store) => ({
      supplier: storeToSupplier(store),
      store,
    }));
  const cards = [...supplierCards, ...extraStores];
  const activeOfferStores = cards.filter((card) => (card.store?._count?.offers || 0) > 0).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Key-Shops</h1>
      <p className="text-sm text-gray-400 mb-6">
        Zielabdeckung fuer bekannte Key-Lieferanten, Marktplaetze und offizielle Stores.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-2xl font-bold text-white">{cards.length}</div>
          <div className="text-xs text-gray-500">bekannte Quellen</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-2xl font-bold text-pink-400">{activeOfferStores}</div>
          <div className="text-xs text-gray-500">mit Angeboten</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-2xl font-bold text-blue-400">
            {supplierCatalog.filter((supplier) => supplier.feedEnv).length}
          </div>
          <div className="text-xs text-gray-500">Feeds vorbereitet</div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="border border-white/10 rounded-xl p-6 text-sm text-gray-400 text-center">
          Noch keine Shops in der Datenbank.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {cards.map(({ supplier, store }) => (
            <a
              key={supplier.slug}
              href={store ? `/store/${store.slug}` : supplier.website}
              target={store ? undefined : "_blank"}
              rel={store ? undefined : "noopener noreferrer nofollow"}
              className="group block bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:border-pink-500/50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-pink-600/20 border border-pink-500/30 flex items-center justify-center mx-auto mb-3 text-pink-400 font-bold text-lg">
                {supplier.name.charAt(0)}
              </div>
              <div className="text-white font-semibold text-sm group-hover:text-pink-400 transition-colors">
                {supplier.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {store?._count?.offers || 0} Angebote
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusClassName(supplier.integration)}`}>
                  {statusLabel(supplier.integration)}
                </span>
                {supplier.verified && (
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] text-green-400">
                    Verifiziert
                  </span>
                )}
              </div>
              {supplier.feedEnv && (
                <div className="mt-2 text-[10px] text-gray-600">
                  {supplier.feedEnv}
                </div>
              )}
              {supplier.rating && (
                <div className="text-xs text-yellow-400/70 mt-1">
                  {supplier.rating}/5
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function storeToSupplier(store: any): SupplierCatalogEntry {
  return {
    name: store.name,
    slug: store.slug,
    website: store.website || store.url || "#",
    channel: "official-store",
    integration: store._count?.offers > 0 ? "cheapshark" : "manual-review",
    priority: "medium",
    rating: store.rating || undefined,
    verified: Boolean(store.isVerified),
    description: store.description || "Dynamisch importierter Shop.",
  };
}

function statusLabel(status: SupplierCatalogEntry["integration"]) {
  switch (status) {
    case "active-api":
      return "API aktiv";
    case "cheapshark":
      return "Aggregator";
    case "affiliate-feed-ready":
      return "Feed bereit";
    case "needs-credentials":
      return "Zugang fehlt";
    case "manual-review":
      return "Review";
  }
}

function statusClassName(status: SupplierCatalogEntry["integration"]) {
  switch (status) {
    case "active-api":
      return "border-green-500/30 bg-green-500/10 text-green-400";
    case "cheapshark":
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    case "affiliate-feed-ready":
      return "border-pink-500/30 bg-pink-500/10 text-pink-400";
    case "needs-credentials":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    case "manual-review":
      return "border-white/15 bg-white/5 text-gray-400";
  }
}
