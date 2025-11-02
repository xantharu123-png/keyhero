import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { offerId: string } }
) {
  const idNum = Number(params.offerId);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid offer id" }, { status: 400 });
  }

  const offer = await prisma.offer.findUnique({
    where: { id: idNum },
  });

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  // TODO: Klick-Tracking (z. B. prisma.clickLog.create(...))

  return NextResponse.redirect(offer.affiliateUrl);
}
