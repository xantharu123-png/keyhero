import { prisma } from "@/lib/prisma";
import { appendSubId, sanitizeSubId } from "@/lib/clickTracking";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// WICHTIG: Hier steht jetzt { params: { offerId: string } }, weil dein Ordner [offerId] heißt
export async function GET(request: Request, { params }: { params: { offerId: string } }) {
  // 1. ID in eine Zahl umwandeln (da deine DB "Int" benutzt)
  const offerId = parseInt(params.offerId);

  if (isNaN(offerId)) {
    return new Response("Invalid ID", { status: 400 });
  }

  // 2. Das Angebot inkl. Shop in der Datenbank suchen
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { store: true },
  });

  // 3. Wenn nicht gefunden, Fehler anzeigen
  if (!offer) {
    return new Response("Offer not found", { status: 404 });
  }

  const target = offer.affiliateUrl || offer.url;
  if (!target) {
    return redirect("/");
  }

  // 4. Optionale SubID für Kampagnen-Tracking: /go/123?subid=deals-seite
  const subId = sanitizeSubId(new URL(request.url).searchParams.get("subid"));

  // 5. Klick loggen (DSGVO-schonend: keine IP, kein Cookie – Fehler blockiert den Redirect nie)
  try {
    const refererHeader = request.headers.get("referer");
    const refererHost = refererHeader ? new URL(refererHeader).hostname : null;
    await prisma.click.create({
      data: {
        offerId: offer.id,
        storeId: offer.storeId,
        gameId: offer.gameId,
        subId,
        referer: refererHost,
        userAgent: request.headers.get("user-agent")?.substring(0, 200) || null,
      },
    });
  } catch (err) {
    console.error("Click logging failed:", err);
  }

  // 6. Weiterleiten zum Affiliate Link (SubID wird ans Ziel angehängt)
  const finalUrl = subId ? appendSubId(target, offer.store?.slug || "", subId) : target;
  return redirect(finalUrl);
}
