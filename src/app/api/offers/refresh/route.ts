import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  // Später: Shop-APIs abfragen und Preise aktualisieren
  const updated = await prisma.offer.updateMany({
    data: {
      lastCheckedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Offers refreshed (dummy).",
    affectedRows: updated.count,
  });
}
