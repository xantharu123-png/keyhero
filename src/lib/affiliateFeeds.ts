import { prisma } from "@/lib/prisma";
import { isGameKeyProduct } from "@/lib/productQuality";
import { getConfiguredSupplierFeedEnvs, getSupplierBySlug, syncSupplierCatalog } from "@/lib/supplierCatalog";

type FieldMap = {
  name?: string | string[];
  price?: string | string[];
  basePrice?: string | string[];
  currency?: string | string[];
  url?: string | string[];
  image?: string | string[];
  platform?: string | string[];
  region?: string | string[];
  edition?: string | string[];
};

type AffiliateFeedConfig = {
  storeSlug: string;
  url: string;
  format?: "csv" | "json";
  delimiter?: string;
  currency?: string;
  platform?: string;
  region?: string;
  limit?: number;
  fieldMap?: FieldMap;
};

type FeedProduct = {
  name: string;
  finalPrice: number;
  basePrice?: number | null;
  currency: string;
  url: string;
  image?: string | null;
  platform: string;
  region: string;
  edition: string;
};

const DEFAULT_LIMIT = 500;
const EUR_TO_CHF = 0.95;
const USD_TO_CHF = 0.88;

const defaultFieldAliases: Required<FieldMap> = {
  name: ["name", "title", "product", "product_name", "productName", "product_title", "merchant_product_name"],
  price: ["price", "salePrice", "sale_price", "finalPrice", "final_price", "current_price", "price_eur"],
  basePrice: ["basePrice", "normalPrice", "normal_price", "old_price", "retail_price", "list_price", "rrp"],
  currency: ["currency", "price_currency", "currency_code"],
  url: ["url", "link", "deeplink", "deep_link", "affiliate_url", "tracking_url", "aw_deep_link"],
  image: ["image", "image_url", "imageUrl", "picture", "thumbnail", "thumb", "cover", "coverImage"],
  platform: ["platform", "system", "drm", "activation", "activation_platform"],
  region: ["region", "territory", "country", "activation_region"],
  edition: ["edition", "version", "product_edition"],
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 200);
}

function getConfiguredFeeds(): AffiliateFeedConfig[] {
  const feeds: AffiliateFeedConfig[] = [];
  const rawConfig = process.env.AFFILIATE_FEEDS;

  if (rawConfig) {
    try {
      const parsed = JSON.parse(rawConfig);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item?.storeSlug && item?.url) feeds.push(item);
        }
      }
    } catch (error) {
      console.error("AFFILIATE_FEEDS JSON parse failed:", error);
    }
  }

  for (const supplier of getConfiguredSupplierFeedEnvs()) {
    const url = supplier.feedEnv ? process.env[supplier.feedEnv] : undefined;
    if (url) {
      feeds.push({
        storeSlug: supplier.slug,
        url,
      });
    }
  }

  const seen = new Set<string>();
  return feeds.filter((feed) => {
    const key = `${feed.storeSlug}:${feed.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function runAffiliateFeedImport(): Promise<{
  ok: boolean;
  configuredFeeds: number;
  stores: number;
  games: number;
  offers: number;
  priceHistory: number;
  skipped: number;
  errors: number;
}> {
  const feeds = getConfiguredFeeds();
  const results = {
    ok: true,
    configuredFeeds: feeds.length,
    stores: 0,
    games: 0,
    offers: 0,
    priceHistory: 0,
    skipped: 0,
    errors: 0,
  };

  await syncSupplierCatalog();

  for (const feed of feeds) {
    try {
      const imported = await importAffiliateFeed(feed);
      results.stores += imported.stores;
      results.games += imported.games;
      results.offers += imported.offers;
      results.priceHistory += imported.priceHistory;
      results.skipped += imported.skipped;
      results.errors += imported.errors;
    } catch (error) {
      console.error(`Affiliate feed failed for ${feed.storeSlug}:`, error);
      results.ok = false;
      results.errors++;
    }
  }

  return results;
}

async function importAffiliateFeed(feed: AffiliateFeedConfig) {
  const results = { stores: 0, games: 0, offers: 0, priceHistory: 0, skipped: 0, errors: 0 };
  const supplier = getSupplierBySlug(feed.storeSlug);

  if (!supplier) {
    throw new Error(`Unknown supplier slug: ${feed.storeSlug}`);
  }

  const store = await prisma.store.upsert({
    where: { slug: supplier.slug },
    update: {
      name: supplier.name,
      url: supplier.website,
      website: supplier.website,
      isVerified: supplier.verified,
      rating: supplier.rating,
      description: supplier.description,
    },
    create: {
      name: supplier.name,
      slug: supplier.slug,
      url: supplier.website,
      website: supplier.website,
      isVerified: supplier.verified,
      rating: supplier.rating,
      paymentMethods: [],
      description: supplier.description,
    },
  });
  results.stores++;

  const response = await fetch(feed.url, {
    headers: {
      Accept: "application/json,text/csv,text/plain,*/*",
      "User-Agent": "KeyHero/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Feed HTTP ${response.status}`);
  }

  const body = await response.text();
  const rows = parseFeedRows(body, feed);
  const limit = feed.limit || parsePositiveInt(process.env.AFFILIATE_FEED_LIMIT) || DEFAULT_LIMIT;

  for (const row of rows.slice(0, limit)) {
    const product = mapFeedProduct(row, feed);
    if (!product || !isGameKeyProduct(product.name) || !isGameKeyProduct(product.platform)) {
      results.skipped++;
      continue;
    }

    try {
      const imported = await upsertFeedProduct(product, store.id);
      if (imported.game) results.games++;
      if (imported.offer) results.offers++;
      if (imported.priceHistory) results.priceHistory++;
    } catch (error) {
      console.error(`Affiliate product import failed for ${product.name}:`, error);
      results.errors++;
    }
  }

  return results;
}

function parseFeedRows(body: string, feed: AffiliateFeedConfig): Record<string, unknown>[] {
  const format = feed.format || inferFormat(body, feed.url);
  if (format === "json") {
    const parsed = JSON.parse(body);
    const rows = Array.isArray(parsed)
      ? parsed
      : parsed.products || parsed.items || parsed.results || parsed.data || [];
    return Array.isArray(rows) ? rows : [];
  }

  return parseCsv(body, feed.delimiter || ",");
}

function inferFormat(body: string, url: string): "csv" | "json" {
  const trimmed = body.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (url.toLowerCase().includes(".json")) return "json";
  return "csv";
}

function parseCsv(body: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    const next = body[i + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      i++;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      if (row.some((value) => value.trim().length > 0)) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim().length > 0)) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) => {
    const item: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      item[header] = values[index]?.trim() ?? "";
    });
    return item;
  });
}

function mapFeedProduct(row: Record<string, unknown>, feed: AffiliateFeedConfig): FeedProduct | null {
  const name = readString(row, feed.fieldMap?.name, defaultFieldAliases.name);
  const price = parsePrice(readString(row, feed.fieldMap?.price, defaultFieldAliases.price));
  const url = readString(row, feed.fieldMap?.url, defaultFieldAliases.url);

  if (!name || !price || price <= 0 || !url) return null;

  const currency =
    readString(row, feed.fieldMap?.currency, defaultFieldAliases.currency) ||
    feed.currency ||
    "EUR";

  return {
    name,
    finalPrice: price,
    basePrice: parsePrice(readString(row, feed.fieldMap?.basePrice, defaultFieldAliases.basePrice)),
    currency: currency.toUpperCase(),
    url,
    image: readString(row, feed.fieldMap?.image, defaultFieldAliases.image) || null,
    platform: readString(row, feed.fieldMap?.platform, defaultFieldAliases.platform) || feed.platform || "PC",
    region: readString(row, feed.fieldMap?.region, defaultFieldAliases.region) || feed.region || "Global",
    edition: readString(row, feed.fieldMap?.edition, defaultFieldAliases.edition) || "Standard",
  };
}

function readString(
  row: Record<string, unknown>,
  configured: string | string[] | undefined,
  aliases: string | string[]
) {
  const keys = [...toArray(configured), ...toArray(aliases)];

  for (const key of keys) {
    const exact = readPath(row, key);
    if (exact != null && String(exact).trim()) return String(exact).trim();

    const normalizedKey = normalizeKey(key);
    const matchingKey = Object.keys(row).find((candidate) => normalizeKey(candidate) === normalizedKey);
    if (matchingKey) {
      const value = row[matchingKey];
      if (value != null && String(value).trim()) return String(value).trim();
    }
  }

  return "";
}

function readPath(row: Record<string, unknown>, path: string) {
  const parts = path.split(".");
  let value: unknown = row;

  for (const part of parts) {
    if (!value || typeof value !== "object") return undefined;
    value = (value as Record<string, unknown>)[part];
  }

  return value;
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parsePrice(value: string) {
  if (!value) return null;
  let normalized = value.replace(/[^\d,.-]/g, "").trim();
  if (!normalized) return null;

  if (normalized.includes(",") && normalized.lastIndexOf(",") > normalized.lastIndexOf(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = normalized.replace(/,/g, "");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? +parsed.toFixed(2) : null;
}

function parsePositiveInt(value: string | undefined) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function upsertFeedProduct(product: FeedProduct, storeId: number) {
  const result = { game: false, offer: false, priceHistory: false };
  const slug = slugify(product.name);
  const priceChf = convertToChf(product.finalPrice, product.currency);

  const game = await prisma.game.upsert({
    where: { slug },
    update: {
      coverImage: product.image || undefined,
    },
    create: {
      name: product.name,
      slug,
      description: `Vergleiche die besten Preise fuer ${product.name}.`,
      coverImage: product.image || null,
    },
  });
  result.game = true;

  const existingOffer = await prisma.offer.findFirst({
    where: {
      gameId: game.id,
      storeId,
      platform: product.platform,
    },
  });

  let offerId: number;
  const data = {
    title: product.name,
    platform: product.platform,
    region: product.region,
    edition: product.edition,
    finalPrice: product.finalPrice,
    basePrice: product.basePrice || product.finalPrice,
    currency: product.currency,
    priceChf,
    affiliateUrl: product.url,
    url: product.url,
    lastCheckedAt: new Date(),
  };

  if (existingOffer) {
    await prisma.offer.update({
      where: { id: existingOffer.id },
      data,
    });
    offerId = existingOffer.id;
  } else {
    const offer = await prisma.offer.create({
      data: {
        ...data,
        gameId: game.id,
        storeId,
      },
    });
    offerId = offer.id;
  }
  result.offer = true;

  try {
    await prisma.priceHistory.create({
      data: {
        offerId,
        price: product.finalPrice,
        currency: product.currency,
      },
    });
    result.priceHistory = true;
  } catch {
    // Price history is useful but non-critical for feed imports.
  }

  return result;
}

function convertToChf(price: number, currency: string) {
  if (currency === "CHF") return price;
  if (currency === "USD") return +(price * USD_TO_CHF).toFixed(2);
  return +(price * EUR_TO_CHF).toFixed(2);
}
