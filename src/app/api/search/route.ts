import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { buildSearchTerms, getSearchRank, isGameKeyProduct } from "@/lib/productQuality";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const searchTerms = buildSearchTerms(q);

    if (searchTerms.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const games = await prisma.game.findMany({
      where: {
        OR: searchTerms.map((term) => ({
          name: {
            contains: term,
            mode: "insensitive" as const,
          },
        })),
      },
      take: 80,
      orderBy: { updatedAt: "desc" },
      include: {
        offers: {
          orderBy: { finalPrice: "asc" },
          take: 1,
          select: { finalPrice: true, currency: true },
        },
      },
    });

    const results = games
      .filter((game) => isGameKeyProduct(game.name))
      .map((game) => {
        const rank = getSearchRank(game.name, q);

        return {
          game,
          rank,
          lowestPrice: game.offers[0]?.finalPrice ?? null,
        };
      })
      .filter((result) => result.rank > 0)
      .sort((a, b) => {
        if (b.rank !== a.rank) return b.rank - a.rank;
        if (a.lowestPrice == null && b.lowestPrice != null) return 1;
        if (a.lowestPrice != null && b.lowestPrice == null) return -1;
        return (a.lowestPrice ?? Number.MAX_SAFE_INTEGER) - (b.lowestPrice ?? Number.MAX_SAFE_INTEGER);
      })
      .slice(0, 10)
      .map(({ game, lowestPrice }) => ({
        id: game.id,
        name: game.name,
        slug: game.slug,
        coverImage: game.coverImage,
        lowestPrice,
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
