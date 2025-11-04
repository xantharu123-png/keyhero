// @ts-nocheck
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Deals â€“ KeyHero", description: "Aktuelle Game-Key-Angebote" };

export default async function DealsPage() {
  let deals: any[] = [];
  try {
    deals = await prisma.offer.findMany({
      take: 24,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        platform: true,
        shop: true,
        priceChf: true,
        rating: true,
        url: true,
      },
    });
  } catch (e) {
    // prisma oder Tabelle nicht vorhanden
  }

  const hasDeals = Array.isArray(deals) && deals.length > 0;

  return (
    <div className="container-xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-hero text-[1.4rem] text-textBright">Deals</h1>
        <p className="text-[13px] text-textDim/75">Live-Preise in CHF. Angaben ohne GewÃ¤hr.</p>
      </div>

      {!hasDeals && (
        <div className="neon-border-soft p-4 text-[13px] text-textDim">
          Noch keine Daten in der DB gefunden. Du kannst spÃ¤ter die erste Import-Routine ausfÃ¼hren oder die Tabelle
          <code className="ml-2"> Offer </code> mit Testdaten fÃ¼llen.
        </div>
      )}

      {hasDeals && (
        <div className="grid gap-4 md:grid-cols-3">
          {deals.map((d) => (
            <div key={d.id} className="neon-panel p-4 text-[13px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-hero text-textBright text-[14px] leading-tight">{d.title}</div>
                  <div className="text-[11px] text-textDim/70">{d.platform}</div>
                </div>
                <div className="text-right">
                  <div className="text-neonPink font-hero text-[15px] leading-none">{d.priceChf?.toFixed?.(2) ?? d.priceChf ?? "-" } CHF</div>
                  <div className="text-[10px] text-textDim/70 leading-tight">bei {d.shop}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-[11px] text-textDim/70">{d.rating ? `${d.rating}/5` : "â€“"}</div>
                {d.url ? (
                  <a href={d.url} target="_blank" className="glow-button text-[10px] px-3 py-2 leading-none font-hero tracking-wider">Zum Angebot</a>
                ) : (
                  <span className="text-[10px] text-textDim/50">kein Link</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
