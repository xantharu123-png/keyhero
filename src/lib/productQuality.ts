import type { Prisma } from "@prisma/client";

export const excludedProductTerms = [
  "gift card",
  "gift cards",
  "giftcard",
  "gift voucher",
  "voucher",
  "wallet",
  "top up",
  "top-up",
  "points",
  "coins",
  "account",
  "subscription",
  "membership",
  "software",
  "antivirus",
  "riot access",
  "access code",
  "prepaid",
  "balance",
  "currency",
  "funds",
  "credit",
  "onlyfans",
  "rewarble",
  "astropay",
  "psn card",
  "steam wallet",
  "xbox live gift",
  "google play gift",
  "itunes gift",
  "apple gift",
  "roblox",
  "v-bucks",
  "minecoins",
  "shark card",
  "game pass",
  "ea play",
  "ubisoft+",
];

const excludedProductPatterns = [
  /\b(?:fc|fifa|riot|cod|call of duty|valorant)\s+points?\b/,
  /\b(?:gift|prepaid|wallet|cash|debit)\s+cards?\b/,
  /\b(?:gift|wallet|access)\s+codes?\b/,
  /\b(?:top|re)[ -]?up\b/,
  /\b(?:playstation|psn|xbox|nintendo|steam)\s+(?:wallet|gift|prepaid|points?)\b/,
  /\b(?:psn|playstation network|xbox live|nintendo eshop|google play|itunes|apple)\b.*\b(?:cards?|wallet|gift|prepaid|voucher|balance|credit|top[ -]?up|[0-9]+\s*(?:eur|euro|usd|gbp|chf))\b/,
  /\b[0-9]+\s*(?:eur|euro|usd|gbp|chf)\b.*\b(?:psn|playstation network|xbox live|nintendo eshop|google play|itunes|apple)\b/,
];

type ProductText = string | null | undefined;

function normalizeProductText(value: ProductText) {
  return (value || "")
    .toLowerCase()
    .replace(/[_/|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasExcludedProductTerm(value: ProductText) {
  const normalized = normalizeProductText(value);
  if (!normalized) return true;

  return (
    excludedProductTerms.some((term) => normalized.includes(term)) ||
    excludedProductPatterns.some((pattern) => pattern.test(normalized))
  );
}

export function isGameKeyProduct(name: ProductText) {
  return !hasExcludedProductTerm(name);
}

type TopDealInput = {
  finalPrice?: number | null;
  basePrice?: number | null;
  platform?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  game?: {
    name?: string | null;
    releaseDate?: Date | string | null;
  } | null;
};

const MIN_TOP_DEAL_PRICE = 1;
const MAX_TOP_DEAL_AGE_YEARS = 12;

export function isTopDealCandidate(offer: TopDealInput) {
  if (!isGameKeyProduct(offer.game?.name)) return false;
  if (hasExcludedProductTerm(offer.platform)) return false;

  const price = offer.finalPrice;
  if (typeof price !== "number" || !Number.isFinite(price) || price < MIN_TOP_DEAL_PRICE) {
    return false;
  }

  const platform = normalizeProductText(offer.platform);
  if (platform === "other" || platform === "unknown") return false;

  const releaseDate = toDate(offer.game?.releaseDate);
  if (releaseDate) {
    const currentYear = new Date().getFullYear();
    if (releaseDate.getFullYear() < currentYear - MAX_TOP_DEAL_AGE_YEARS) {
      return false;
    }
  }

  return true;
}

export function getTopDealScore(offer: TopDealInput) {
  const price = typeof offer.finalPrice === "number" ? offer.finalPrice : 0;
  const basePrice = typeof offer.basePrice === "number" ? offer.basePrice : 0;
  const platform = normalizeProductText(offer.platform);
  let score = 0;

  if (basePrice > price && price > 0) {
    const discount = (basePrice - price) / basePrice;
    score += Math.min(discount * 60, 35);
  }

  if (price >= 5 && price <= 45) score += 15;
  else if (price >= MIN_TOP_DEAL_PRICE && price < 5) score += 6;
  else if (price > 70) score -= 5;

  const releaseDate = toDate(offer.game?.releaseDate);
  if (releaseDate) {
    const age = new Date().getFullYear() - releaseDate.getFullYear();
    if (age <= 1) score += 25;
    else if (age <= 3) score += 20;
    else if (age <= 6) score += 14;
    else if (age <= 9) score += 8;
    else score += 2;
  }

  const updatedAt = toDate(offer.updatedAt || offer.createdAt);
  if (updatedAt) {
    const ageDays = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 2) score += 18;
    else if (ageDays <= 14) score += 12;
    else if (ageDays <= 45) score += 6;
  }

  if (["pc", "steam", "playstation", "xbox", "nintendo"].some((name) => platform.includes(name))) {
    score += 8;
  }

  return score;
}

export function formatMoney(value: number | null | undefined, currency = "EUR") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Preis folgt";

  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCheckedAt(value: Date | null | undefined) {
  if (!value) return "Preiszeitpunkt offen";

  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function getSearchRank(name: string, query: string) {
  const normalizedName = name.toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return 0;
  if (normalizedName === normalizedQuery) return 5;
  if (normalizedName.startsWith(normalizedQuery)) return 4;

  const boundaryMatch = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedQuery)}`).test(normalizedName);
  if (boundaryMatch) return 3;

  return normalizedName.includes(normalizedQuery) ? 1 : 0;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export type OfferWithGameStore = Prisma.OfferGetPayload<{
  include: {
    game: true;
    store: true;
  };
}>;
