// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function StorePage({ params }: any) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
  });

  if (!store) return notFound();

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="bg-card rounded-2xl ring-1 ring-slate-700 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-semibold">{store.name}</h1>
            <div className="text-textDim text-sm">
              ⭐ {store.rating ?? "–"}/5 •{" "}
              {store.isVerified ? "Verifiziert" : "Unverifiziert"}
            </div>
          </div>
          <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-400">
            LOGO
          </div>
        </div>

        {store.description && (
          <p className="text-textDim text-sm leading-relaxed">
            {store.description}
          </p>
        )}

        <div className="text-xs text-textDim">
          Akzeptierte Zahlungen:
          <div className="text-white mt-1 text-sm">
            {store.paymentMethods.join(", ")}
          </div>
        </div>

        {store.website && (
          <div className="text-xs text-textDim">
            Offizielle Seite:
            <div className="text-accent break-all">{store.website}</div>
          </div>
        )}

        <div className="text-[10px] text-textDim pt-4 border-t border-slate-700">
          Hinweis: Wir sind kein Verkäufer. Käufe erfolgen beim Händler. Wir
          erhalten ggf. eine Provision.
        </div>
      </div>
    </div>
  );
}
