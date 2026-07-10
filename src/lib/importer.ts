import { prisma } from "@/lib/prisma";
import { isGameKeyProduct } from "@/lib/productQuality";

/**
 * CheapShark API - Free game deals aggregator
 * Docs: https://apidocs.cheapshark.com/
 *
 * Enhanced for DACH region:
 * - Converts USD prices to EUR and CHF
 * - Tracks price history for each offer
 * - Imports more games across multiple pages
 */

// Approximate conversion rates (update periodically or use an API)
const USD_TO_EUR = 0.92;
const USD_TO_CHF = 0.88;

type CheapSharkStoreInfo = { name: string; slug: string; url: string; active?: boolean };

const CHEAPSHARK_API_BASE = "https://www.cheapshark.com/api/1.0";

const CHEAPSHARK_STORE_URLS: Record<string, string> = {
  Steam: "https://store.steampowered.com",
  GamersGate: "https://www.gamersgate.com",
  GreenManGaming: "https://www.greenmangaming.com",
  Amazon: "https://www.amazon.com",
  GameStop: "https://www.gamestop.com",
  Direct2Drive: "https://www.direct2drive.com",
  GOG: "https://www.gog.com",
  Origin: "https://www.ea.com",
  "Humble Store": "https://www.humblebundle.com/store",
  Uplay: "https://store.ubisoft.com",
  Fanatical: "https://www.fanatical.com",
  WinGameStore: "https://www.wingamestore.com",
  GameBillet: "https://www.gamebillet.com",
  Voidu: "https://www.voidu.com",
  "Epic Games Store": "https://store.epicgames.com",
  Gamesplanet: "https://www.gamesplanet.com",
  Gamesload: "https://www.gamesload.com",
  IndieGala: "https://www.indiegala.com",
  DLGamer: "https://www.dlgamer.com",
  Noctre: "https://www.noctre.com",
  DreamGame: "https://www.dreamgame.com",
};

const CHEAPSHARK_STORE_SLUGS: Record<string, string> = {
  GreenManGaming: "greenmangaming",
  WinGameStore: "wingamestore",
  GameBillet: "gamebillet",
  "Epic Games Store": "epic",
  IndieGala: "indiegala",
  "Humble Store": "humble-store",
};

const CHEAPSHARK_STORES: Record<string, CheapSharkStoreInfo> = {
  "1": { name: "Steam", slug: "steam", url: "https://store.steampowered.com", active: true },
  "2": { name: "GamersGate", slug: "gamersgate", url: "https://www.gamersgate.com", active: true },
  "3": { name: "GreenManGaming", slug: "greenmangaming", url: "https://www.greenmangaming.com", active: true },
  "7": { name: "GOG", slug: "gog", url: "https://www.gog.com", active: true },
  "11": { name: "Humble Store", slug: "humble-store", url: "https://www.humblebundle.com/store", active: true },
  "13": { name: "Uplay", slug: "uplay", url: "https://store.ubisoft.com", active: true },
  "15": { name: "Fanatical", slug: "fanatical", url: "https://www.fanatical.com", active: true },
  "21": { name: "WinGameStore", slug: "wingamestore", url: "https://www.wingamestore.com", active: true },
  "23": { name: "GameBillet", slug: "gamebillet", url: "https://www.gamebillet.com", active: true },
  "25": { name: "Epic Games Store", slug: "epic", url: "https://store.epicgames.com", active: true },
  "27": { name: "Gamesplanet", slug: "gamesplanet", url: "https://www.gamesplanet.com", active: true },
  "28": { name: "Gamesload", slug: "gamesload", url: "https://www.gamesload.com", active: true },
  "30": { name: "IndieGala", slug: "indiegala", url: "https://www.indiegala.com", active: true },
  "35": { name: "DreamGame", slug: "dreamgame", url: "https://www.dreamgame.com", active: true },
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 200);
}

function slugifyStore(name: string): string {
  return CHEAPSHARK_STORE_SLUGS[name] || slugify(name);
}

async function getCheapSharkStoreMap(): Promise<Record<string, CheapSharkStoreInfo>> {
  try {
    const res = await fetch(`${CHEAPSHARK_API_BASE}/stores?format=json`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "KeyHero/1.0",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`CheapShark stores HTTP ${res.status}`);

    const stores: { storeID: string; storeName: string; isActive: number }[] = await res.json();
    return Object.fromEntries(
      stores
        .filter((store) => store.isActive === 1)
        .map((store) => [
          store.storeID,
          {
            name: store.storeName,
            slug: slugifyStore(store.storeName),
            url: CHEAPSHARK_STORE_URLS[store.storeName] || `https://www.cheapshark.com`,
            active: true,
          },
        ])
    );
  } catch (error) {
    console.error("CheapShark store list fallback:", error);
    return CHEAPSHARK_STORES;
  }
}

interface CheapSharkDeal {
  internalName: string;
  title: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  metacriticScore: string;
  steamAppID: string | null;
  thumb: string;
}

/**
 * Fetches deals from CheapShark and imports them into the database.
 * Prices are converted to EUR (primary) and CHF for the DACH region.
 *
 * @param pageSize - Number of deals per page (max 60)
 * @param pageCount - Number of pages to fetch
 */
export async function runOfferImport(pageSize = 60, pageCount = 5) {
  const results = { games: 0, offers: 0, stores: 0, priceHistory: 0, errors: 0 };
  const cheapSharkStores = await getCheapSharkStoreMap();

  // Fetch multiple pages of deals
  const allDeals: CheapSharkDeal[] = [];

  for (let page = 0; page < pageCount; page++) {
    try {
      const url = `${CHEAPSHARK_API_BASE}/deals?format=json&pageSize=${pageSize}&pageNumber=${page}&sortBy=Deal%20Rating&onSale=1`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "KeyHero/1.0",
        },
        next: { revalidate: 0 },
      });
      if (!res.ok) {
        console.error(`CheapShark API error page ${page}: ${res.status}`);
        results.errors++;
        continue;
      }
      const deals: CheapSharkDeal[] = await res.json();
      allDeals.push(...deals);
    } catch (err) {
      console.error(`Fetch error page ${page}:`, err);
      results.errors++;
    }
  }

  console.log(`Fetched ${allDeals.length} deals from CheapShark`);

  // Ensure stores exist
  const storeCache = new Map<string, number>();
  for (const deal of allDeals) {
    if (!isGameKeyProduct(deal.title)) continue;

    const storeInfo = cheapSharkStores[deal.storeID];
    if (!storeInfo || storeCache.has(deal.storeID)) continue;

    const store = await prisma.store.upsert({
      where: { slug: storeInfo.slug },
      update: {},
      create: {
        name: storeInfo.name,
        slug: storeInfo.slug,
        url: storeInfo.url,
        website: storeInfo.url,
        isVerified: true,
        rating: 4.5,
        paymentMethods: ["PayPal", "Kreditkarte", "Sofortüberweisung"],
        description: `${storeInfo.name} – Digitaler Game-Store. Liefert Keys für die DACH-Region.`,
      },
    });
    storeCache.set(deal.storeID, store.id);
    results.stores++;
  }

  // Resolve store IDs we didn't create this run
  for (const deal of allDeals) {
    if (!isGameKeyProduct(deal.title)) continue;

    if (!storeCache.has(deal.storeID)) {
      const storeInfo = cheapSharkStores[deal.storeID];
      if (!storeInfo) continue;
      const store = await prisma.store.findUnique({ where: { slug: storeInfo.slug } });
      if (store) storeCache.set(deal.storeID, store.id);
    }
  }

  // Group deals by game title
  const gameDeals = new Map<string, CheapSharkDeal[]>();
  for (const deal of allDeals) {
    if (!isGameKeyProduct(deal.title)) continue;

    const key = deal.title;
    if (!gameDeals.has(key)) gameDeals.set(key, []);
    gameDeals.get(key)!.push(deal);
  }

  // Upsert games and their offers
  for (const [title, deals] of gameDeals) {
    const slug = slugify(title);
    const firstDeal = deals[0];

    // Build cover image from Steam if available
    let coverImage: string | null = null;
    if (firstDeal.steamAppID) {
      coverImage = `https://cdn.akamai.steamstatic.com/steam/apps/${firstDeal.steamAppID}/header.jpg`;
    } else if (firstDeal.thumb) {
      coverImage = firstDeal.thumb;
    }

    try {
      const game = await prisma.game.upsert({
        where: { slug },
        update: {
          coverImage: coverImage || undefined,
        },
        create: {
          name: title,
          slug,
          description: `Vergleiche die besten Preise für ${title}. Finde den günstigsten Key bei über 20 Shops – Preise in EUR und CHF für Deutschland, Österreich und die Schweiz.`,
          coverImage,
        },
      });
      results.games++;

      // Upsert offers for this game
      for (const deal of deals) {
        const storeId = storeCache.get(deal.storeID);
        if (!storeId) continue;

        const salePriceUsd = parseFloat(deal.salePrice);
        const normalPriceUsd = parseFloat(deal.normalPrice);

        // Convert to EUR (primary currency for DACH)
        const salePriceEur = +(salePriceUsd * USD_TO_EUR).toFixed(2);
        const normalPriceEur = +(normalPriceUsd * USD_TO_EUR).toFixed(2);
        const salePriceChf = +(salePriceUsd * USD_TO_CHF).toFixed(2);

        // Check if offer exists for this game+store+platform combo
        const existingOffer = await prisma.offer.findFirst({
          where: {
            gameId: game.id,
            storeId: storeId,
            platform: "PC",
          },
        });

        let offerId: number;

        if (existingOffer) {
          await prisma.offer.update({
            where: { id: existingOffer.id },
            data: {
              finalPrice: salePriceEur,
              basePrice: normalPriceEur,
              currency: "EUR",
              priceChf: salePriceChf,
              affiliateUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
              lastCheckedAt: new Date(),
            },
          });
          offerId = existingOffer.id;
        } else {
          const newOffer = await prisma.offer.create({
            data: {
              gameId: game.id,
              storeId: storeId,
              platform: "PC",
              region: "Global",
              edition: "Standard",
              finalPrice: salePriceEur,
              basePrice: normalPriceEur,
              currency: "EUR",
              priceChf: salePriceChf,
              affiliateUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
              url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
              lastCheckedAt: new Date(),
            },
          });
          offerId = newOffer.id;
        }

        // Track price history
        try {
          await prisma.priceHistory.create({
            data: {
              offerId,
              price: salePriceEur,
              currency: "EUR",
            },
          });
          results.priceHistory++;
        } catch (e) {
          // Non-critical, continue
        }

        results.offers++;
      }
    } catch (err) {
      console.error(`Error importing ${title}:`, err);
      results.errors++;
    }
  }

  console.log("Import complete:", results);
  return { ok: true, ...results };
}

/**
 * Search CheapShark for a specific game and import results
 */
export async function searchAndImport(query: string) {
  const cheapSharkStores = await getCheapSharkStoreMap();
  const url = `${CHEAPSHARK_API_BASE}/deals?format=json&title=${encodeURIComponent(query)}&pageSize=30&sortBy=Price`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "KeyHero/1.0",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`CheapShark search failed: ${res.status}`);

  const deals: CheapSharkDeal[] = await res.json();
  const gameDeals = deals.filter((deal) => isGameKeyProduct(deal.title));
  if (gameDeals.length === 0) return { ok: true, message: "Keine Deals gefunden", count: 0 };

  // Import the found deals using the same logic
  const storeCache = new Map<string, number>();

  for (const deal of gameDeals) {
    const storeInfo = cheapSharkStores[deal.storeID];
    if (!storeInfo || storeCache.has(deal.storeID)) continue;

    const store = await prisma.store.upsert({
      where: { slug: storeInfo.slug },
      update: {},
      create: {
        name: storeInfo.name,
        slug: storeInfo.slug,
        url: storeInfo.url,
        website: storeInfo.url,
        isVerified: true,
        rating: 4.5,
        paymentMethods: ["PayPal", "Kreditkarte"],
        description: `${storeInfo.name} – Digitaler Game-Store.`,
      },
    });
    storeCache.set(deal.storeID, store.id);
  }

  // Resolve existing stores
  for (const deal of gameDeals) {
    if (!storeCache.has(deal.storeID)) {
      const storeInfo = cheapSharkStores[deal.storeID];
      if (!storeInfo) continue;
      const store = await prisma.store.findUnique({ where: { slug: storeInfo.slug } });
      if (store) storeCache.set(deal.storeID, store.id);
    }
  }

  let imported = 0;
  for (const deal of gameDeals) {
    const storeId = storeCache.get(deal.storeID);
    if (!storeId) continue;

    const slug = slugify(deal.title);
    let coverImage: string | null = null;
    if (deal.steamAppID) {
      coverImage = `https://cdn.akamai.steamstatic.com/steam/apps/${deal.steamAppID}/header.jpg`;
    } else if (deal.thumb) {
      coverImage = deal.thumb;
    }

    try {
      const game = await prisma.game.upsert({
        where: { slug },
        update: { coverImage: coverImage || undefined },
        create: {
          name: deal.title,
          slug,
          description: `Vergleiche die besten Preise für ${deal.title}.`,
          coverImage,
        },
      });

      const salePriceEur = +(parseFloat(deal.salePrice) * USD_TO_EUR).toFixed(2);
      const normalPriceEur = +(parseFloat(deal.normalPrice) * USD_TO_EUR).toFixed(2);
      const salePriceChf = +(parseFloat(deal.salePrice) * USD_TO_CHF).toFixed(2);

      const existing = await prisma.offer.findFirst({
        where: { gameId: game.id, storeId, platform: "PC" },
      });

      if (existing) {
        await prisma.offer.update({
          where: { id: existing.id },
          data: {
            finalPrice: salePriceEur,
            basePrice: normalPriceEur,
            currency: "EUR",
            priceChf: salePriceChf,
            affiliateUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
            lastCheckedAt: new Date(),
          },
        });
      } else {
        await prisma.offer.create({
          data: {
            gameId: game.id,
            storeId,
            platform: "PC",
            region: "Global",
            edition: "Standard",
            finalPrice: salePriceEur,
            basePrice: normalPriceEur,
            currency: "EUR",
            priceChf: salePriceChf,
            affiliateUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
            url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
            lastCheckedAt: new Date(),
          },
        });
      }
      imported++;
    } catch (e) {
      console.error(`Error importing ${deal.title}:`, e);
    }
  }

  return { ok: true, message: `${imported} Deals importiert für "${query}"`, count: imported };
}
