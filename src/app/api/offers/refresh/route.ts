import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [games, stores, offers] = await Promise.all([prisma.game.count(), prisma.store.count(), prisma.offer.count()]);

  return NextResponse.json({
    ok: true,
    counts: {
      games,
      stores,
      offers,
    },
  });
}
