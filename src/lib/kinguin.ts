import { prisma } from "@/lib/prisma";
import { isGameKeyProduct } from "@/lib/productQuality";

/**
 * Kinguin eCommerce API Importer
 * Docs: https://github.com/kinguinltdhk/Kinguin-eCommerce-API
 *
 * - Fetches products with live prices directly from Kinguin
 * - Prices are already in EUR (perfect for DACH)
 * - Tracks price history
 * - Supports 50'000+ products
 */

const KINGUIN_API_BASE = "https://gateway.kinguin.net/esa/api/v1";
const USD_TO_CHF = 0.88;
const EUR_TO_CHF = 0.95;

interface KinguinProduct {
  kinguinId: number;
  name: string;
  platform: string;
  releaseDate: string | null;
  price: number; // EUR, cheapest offer
  totalQty: number;
  qty: number;
  genres: string[];
  developers: string[];
  publishers: string[];
  regionalLimitations: string | null;
  images: {
    screenshots?: { url: string; thumbnail: string }[];
    cover?: { url: string; thumbnail: string };
  };
  offers: {
    offerId: string;
    price: number;
    qty: number;
    merchantName: string;
  }[];
}

interface KinguinResponse {
  results: KinguinProduct[];
  item_count: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 200);
}

/**
 * Map Kinguin platform names to our standard names
 */
function normalizePlatform(platform: string): string {
  const map: Record<string, string> = {
    Steam: "PC",
    "Epic Games": "PC",
    GOG: "PC",
    Origin: "PC",
    Uplay: "PC",
    "Xbox One": "Xbox",
    "Xbox Series X|S": "Xbox",
    PlayStation: "PlayStation",
    "PlayStation 4": "PlayStation",
    "PlayStation 5": "PlayStation",
    Nintendo: "Nintendo",
    "Nintendo Switch": "Nintendo",
  };
  return map[platform] || platform;
}

/**
 * Fetch products from Kinguin API
 */
async function fetchKinguinProducts(
  page: number = 1,
  limit: number = 100,
  sortBy: string = "updatedAt",
  sortType: string = "desc"
): Promise<KinguinResponse> {
  const apiKey = process.env.KINGUIN_API_KEY;
  if (!apiKey) throw new Error("KINGUIN_API_KEY not configured");

  const url = `${KINGUIN_API_BASE}/products?page=${page}&limit=${limit}&sortBy=${sortBy}&sortType=${sortType}`;

  const res = await fetch(url, {
    headers: {
      "X-Api-Key": apiKey,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kinguin API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Search products on Kinguin by name
 */
async function searchKinguinProducts(
  query: string,
  limit: number = 50
): Promise<KinguinResponse> {
  const apiKey = process.env.KINGUIN_API_KEY;
  if (!apiKey) throw new Error("KINGUIN_API_KEY not configured");

  const url = `${KINGUIN_API_BASE}/products?name=${encodeURIComponent(query)}&limit=${limit}`;

  const res = await fetch(url, {
    headers: {
      "X-Api-Key": apiKey,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kinguin search error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Ensure Kinguin store exists in our DB
 */
async function ensureKinguinStore(): Promise<number> {
  const store = await prisma.store.upsert({
    where: { slug: "kinguin" },
    update: {},
    create: {
      name: "Kinguin",
      slug: "kinguin",
      url: "https://www.kinguin.net",
      website: "https://www.kinguin.net",
      isVerified: true,
      rating: 4.3,
      paymentMethods: ["PayPal", "Kreditkarte", "Sofortüberweisung", "Paysafecard", "Klarna"],
      description:
        "Kinguin – Einer der grössten Marktplätze für digitale Game Keys. Über 50'000 Produkte verfügbar.",
    },
  });
  return store.id;
}

/**
 * Import a single Kinguin product into the database
 */
async function importProduct(
  product: KinguinProduct,
  storeId: number
): Promise<{ game: boolean; offer: boolean; history: boolean }> {
  const result = { game: false, offer: false, history: false };

  if (!product.price || product.price <= 0 || product.qty <= 0) {
    return result; // Skip out-of-stock or free items
  }

  if (!isGameKeyProduct(product.name)) {
    return result;
  }

  const slug = slugify(product.name);
  const coverImage = product.images?.cover?.url || product.images?.cover?.thumbnail || null;
  const platform = normalizePlatform(product.platform);
  const priceEur = +(product.price / 100).toFixed(2); // Kinguin prices are in cents
  const priceChf = +(priceEur * EUR_TO_CHF).toFixed(2);

  try {
    // Upsert game
    const game = await prisma.game.upsert({
      where: { slug },
      update: {
        coverImage: coverImage || undefined,
      },
      create: {
        name: product.name,
        slug,
        description: `Vergleiche die besten Preise für ${product.name}. Finde den günstigsten Key bei KeyHero – Preise in EUR und CHF für die DACH-Region.`,
        coverImage,
        releaseDate: product.releaseDate ? new Date(product.releaseDate) : null,
      },
    });
    result.game = true;

    // Build affiliate URL
    const affiliateUrl = `https://www.kinguin.net/category/${product.kinguinId}`;

    // Upsert offer
    const existingOffer = await prisma.offer.findFirst({
      where: {
        gameId: game.id,
        storeId,
        platform,
      },
    });

    let offerId: number;

    if (existingOffer) {
      await prisma.offer.update({
        where: { id: existingOffer.id },
        data: {
          finalPrice: priceEur,
          basePrice: priceEur,
          currency: "EUR",
          priceChf,
          affiliateUrl,
          url: affiliateUrl,
          region: product.regionalLimitations || "Global",
          lastCheckedAt: new Date(),
        },
      });
      offerId = existingOffer.id;
    } else {
      const newOffer = await prisma.offer.create({
        data: {
          gameId: game.id,
          storeId,
          platform,
          region: product.regionalLimitations || "Global",
          edition: "Standard",
          finalPrice: priceEur,
          basePrice: priceEur,
          currency: "EUR",
          priceChf,
          affiliateUrl,
          url: affiliateUrl,
          lastCheckedAt: new Date(),
        },
      });
      offerId = newOffer.id;
    }
    result.offer = true;

    // Track price history
    try {
      await prisma.priceHistory.create({
        data: {
          offerId,
          price: priceEur,
          currency: "EUR",
        },
      });
      result.history = true;
    } catch {
      // Non-critical
    }
  } catch (err) {
    console.error(`Kinguin import error for "${product.name}":`, err);
  }

  return result;
}

/**
 * Main import function: fetches multiple pages from Kinguin and imports
 */
export async function runKinguinImport(pages: number = 5): Promise<{
  ok: boolean;
  games: number;
  offers: number;
  priceHistory: number;
  totalProducts: number;
  errors: number;
}> {
  const results = { ok: true, games: 0, offers: 0, priceHistory: 0, totalProducts: 0, errors: 0 };

  try {
    const storeId = await ensureKinguinStore();

    for (let page = 1; page <= pages; page++) {
      try {
        const data = await fetchKinguinProducts(page, 100);
        results.totalProducts = data.item_count;

        console.log(`Kinguin page ${page}: ${data.results.length} products (total: ${data.item_count})`);

        for (const product of data.results) {
          try {
            const r = await importProduct(product, storeId);
            if (r.game) results.games++;
            if (r.offer) results.offers++;
            if (r.history) results.priceHistory++;
          } catch {
            results.errors++;
          }
        }
      } catch (err) {
        console.error(`Kinguin page ${page} error:`, err);
        results.errors++;
      }
    }
  } catch (err) {
    console.error("Kinguin import failed:", err);
    results.ok = false;
    results.errors++;
  }

  console.log("Kinguin import complete:", results);
  return results;
}

/**
 * Search and import specific games from Kinguin
 */
export async function searchAndImportKinguin(query: string): Promise<{
  ok: boolean;
  message: string;
  count: number;
}> {
  try {
    const storeId = await ensureKinguinStore();
    const data = await searchKinguinProducts(query);

    if (data.results.length === 0) {
      return { ok: true, message: `Keine Produkte für "${query}" gefunden`, count: 0 };
    }

    let imported = 0;
    for (const product of data.results) {
      const r = await importProduct(product, storeId);
      if (r.offer) imported++;
    }

    return {
      ok: true,
      message: `${imported} Produkte für "${query}" importiert`,
      count: imported,
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || "Import fehlgeschlagen", count: 0 };
  }
}
