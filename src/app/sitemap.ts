// @ts-nocheck
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://keyhero.ch";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/deals`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/shops`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/impressum`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/datenschutz`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/kontakt`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic game pages
  let gamePages: MetadataRoute.Sitemap = [];
  try {
    const games = await prisma.game.findMany({
      select: { slug: true, updatedAt: true },
    });
    gamePages = games.map((game) => ({
      url: `${base}/game/${game.slug}`,
      lastModified: game.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error("Sitemap: could not fetch games", e);
  }

  // Dynamic store pages
  let storePages: MetadataRoute.Sitemap = [];
  try {
    const stores = await prisma.store.findMany({
      select: { slug: true, updatedAt: true },
    });
    storePages = stores.map((store) => ({
      url: `${base}/store/${store.slug}`,
      lastModified: store.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error("Sitemap: could not fetch stores", e);
  }

  return [...staticPages, ...gamePages, ...storePages];
}
