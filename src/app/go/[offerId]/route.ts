// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, context: any) {
  const idParam = context?.params?.offerId;
  const idNum = Number(idParam);

  if (Number.isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid offer id" }, { status: 400 });
  }

  const offer = await prisma.offer.findUnique({
    where: { id: idNum },
  });

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  // Später: Klick-Tracking hier (z. B. prisma.clickLog.create(...))

  return NextResponse.redirect(offer.affiliateUrl);
}
