import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Klick-Statistiken für die Affiliate-Redirects.
 * Aufruf: /api/stats/clicks?key=IMPORT_SECRET&days=30
 *
 * Zeigt, welche Shops/Spiele geklickt werden. Die echten Verkäufe/Provisionen
 * sieht man im Dashboard des jeweiligen Netzwerks (AWIN, Eneba, ...) –
 * dort nach dem clickref/subid-Parameter filtern.
 */
export async function GET(request: NextRequest) {
  const importSecret = process.env.IMPORT_SECRET;
  if (importSecret && request.nextUrl.searchParams.get("key") !== importSecret) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const daysParam = parseInt(request.nextUrl.searchParams.get("days") || "30", 10);
  const days = Math.min(Math.max(daysParam || 30, 1), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [total, byStore, byGame, bySubId] = await Promise.all([
    prisma.click.count({ where: { createdAt: { gte: since } } }),
    prisma.click.groupBy({
      by: ["storeId"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { storeId: "desc" } },
      take: 20,
    }),
    prisma.click.groupBy({
      by: ["gameId"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { gameId: "desc" } },
      take: 20,
    }),
    prisma.click.groupBy({
      by: ["subId"],
      where: { createdAt: { gte: since }, subId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { subId: "desc" } },
      take: 20,
    }),
  ]);

  const storeIds = byStore.map((r) => r.storeId).filter((id): id is number => id != null);
  const gameIds = byGame.map((r) => r.gameId).filter((id): id is number => id != null);

  const [stores, games] = await Promise.all([
    prisma.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, name: true } }),
    prisma.game.findMany({ where: { id: { in: gameIds } }, select: { id: true, name: true } }),
  ]);

  return NextResponse.json({
    success: true,
    period: { days, since: since.toISOString() },
    totalClicks: total,
    byStore: byStore.map((row) => ({
      store: stores.find((s) => s.id === row.storeId)?.name || row.storeId || "unbekannt",
      clicks: row._count._all,
    })),
    topGames: byGame.map((row) => ({
      game: games.find((g) => g.id === row.gameId)?.name || row.gameId || "unbekannt",
      clicks: row._count._all,
    })),
    bySubId: bySubId.map((row) => ({
      subId: row.subId,
      clicks: row._count._all,
    })),
  });
}
