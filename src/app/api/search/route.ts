import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const games = await prisma.game.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 10,
      orderBy: { name: "asc" },
      include: {
        offers: {
          orderBy: { finalPrice: "asc" },
          take: 1,
          select: { finalPrice: true, currency: true },
        },
      },
    });

    const results = games.map((game) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      coverImage: game.coverImage,
      lowestPrice: game.offers[0]?.finalPrice ?? null,
      currency: game.offers[0]?.currency ?? "EUR",
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { results: [], error: "Search failed" },
      { status: 500 }
    );
  }
}
