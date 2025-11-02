// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function GamePage({ params }: any) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    include: {
      offers: {
        orderBy: { finalPrice: "asc" },
        include: { store: true },
      },
    },
  });

  if (!game) return notFound();

  return (
    // ... Rest unverändert ...
  );
}
