// @ts-nocheck
import { prisma } from "@/lib/prisma";

/**
 * Stellt sicher, dass Tabelle und Index existieren.
 * Schreibt Demo-Angebote (Mock). SpÃ¤ter hier die echten Quellen anschliessen.
 */
export async function runOfferImport() {
  // Tabelle und Index anlegen, falls sie fehlen (Postgres / Supabase)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Offer" (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      platform TEXT,
      shop TEXT,
      priceChf DOUBLE PRECISION,
      rating DOUBLE PRECISION,
      url TEXT,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Offer_title_platform_shop_key"
    ON "Offer"(title, platform, shop);
  `);

  // Demo-Daten (hier spÃ¤ter echte Feeds/API-Ergebnisse einspielen)
  const offers = [
    { title: "EA SPORTS FC 25", platform: "PC / EA App",     shop: "CDKeys",         priceChf: 24.99, rating: 4.8, url: "https://www.cdkeys.com/" },
    { title: "Elden Ring",      platform: "Steam (Global)",  shop: "Instant Gaming", priceChf: 17.50, rating: 4.9, url: "https://www.instant-gaming.com/" },
    { title: "Black Ops 6",     platform: "Xbox Series",     shop: "Eneba",          priceChf: 39.90, rating: 4.6, url: "https://www.eneba.com/" },
    { title: "Forza Horizon 5", platform: "PC / Steam",      shop: "G2A",            priceChf: 12.90, rating: 4.5, url: "https://www.g2a.com/" },
    { title: "Baldur's Gate 3", platform: "PC / Steam",      shop: "CDKeys",         priceChf: 34.90, rating: 4.9, url: "https://www.cdkeys.com/" }
  ];

  let inserted = 0;
  for (const o of offers) {
    // Upsert per SQL (funktioniert auch ohne Prisma-Model-Definition)
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "Offer"(title, platform, shop, priceChf, rating, url, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (title, platform, shop)
      DO UPDATE SET priceChf = EXCLUDED.priceChf,
                    rating = EXCLUDED.rating,
                    url = EXCLUDED.url,
                    "updatedAt" = NOW();
      `,
      o.title, o.platform, o.shop, o.priceChf, o.rating, o.url
    );
    inserted++;
  }

  return { ok: true, count: inserted };
}
