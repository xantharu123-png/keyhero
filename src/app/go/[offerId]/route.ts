import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// WICHTIG: Hier steht jetzt { params: { offerId: string } }, weil dein Ordner [offerId] heißt
export async function GET(request: Request, { params }: { params: { offerId: string } }) {
  
  // 1. ID in eine Zahl umwandeln (da deine DB "Int" benutzt)
  const offerId = parseInt(params.offerId);

  if (isNaN(offerId)) {
    return new Response("Invalid ID", { status: 400 });
  }

  // 2. Das Angebot in der Datenbank suchen
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
  });

  // 3. Wenn nicht gefunden, Fehler anzeigen
  if (!offer) {
    return new Response("Offer not found", { status: 404 });
  }

  // 4. Weiterleiten zum Affiliate Link (oder normalen Link als Fallback)
  return redirect(offer.affiliateUrl || offer.url || "/");
}