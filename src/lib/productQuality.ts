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

const romanNumberMap: Record<string, string> = {
  i: "1",
  ii: "2",
  iii: "3",
  iv: "4",
  v: "5",
  vi: "6",
  vii: "7",
  viii: "8",
  ix: "9",
  x: "10",
  xi: "11",
  xii: "12",
  xiii: "13",
  xiv: "14",
  xv: "15",
  xvi: "16",
  xvii: "17",
  xviii: "18",
  xix: "19",
  xx: "20",
};

const numberRomanMap = Object.fromEntries(
  Object.entries(romanNumberMap).map(([roman, number]) => [number, roman])
);

const searchStopWords = new Set(["a", "an", "and", "bundle", "cd", "edition", "for", "key", "of", "pc", "steam", "the"]);

export function buildSearchTerms(query: string) {
  const cleaned = cleanSearchText(query);
  const terms = new Set<string>();

  addSearchTerm(terms, query.trim());
  addSearchTerm(terms, cleaned);

  for (const token of cleaned.split(" ")) {
    if (!token || searchStopWords.has(token)) continue;

    addSearchTerm(terms, token);
    addSearchTerm(terms, canonicalSearchToken(token));

    const roman = numberRomanMap[token];
    if (roman) addSearchTerm(terms, roman);

    const number = romanNumberMap[token];
    if (number) addSearchTerm(terms, number);

    const singular = singularizeToken(token);
    addSearchTerm(terms, singular);
    addSearchTerm(terms, pluralizeToken(singular));
  }

  return Array.from(terms).filter((term) => term.length >= 2).slice(0, 16);
}

export function getSearchRank(name: string, query: string) {
  const nameTokens = getSearchTokens(name);
  const queryTokens = getSearchTokens(query);

  if (queryTokens.length === 0) return 0;

  const normalizedName = nameTokens.join(" ");
  const normalizedQuery = queryTokens.join(" ");

  if (normalizedName === normalizedQuery) return adjustSearchScore(100, nameTokens, queryTokens);
  if (normalizedName.startsWith(normalizedQuery)) return adjustSearchScore(90, nameTokens, queryTokens);
  if (normalizedName.includes(normalizedQuery)) return adjustSearchScore(82, nameTokens, queryTokens);

  const nameTokenSet = new Set(nameTokens);
  const requiredNumbers = queryTokens.filter((token) => /^\d+$/.test(token));
  if (requiredNumbers.some((token) => !nameTokenSet.has(token))) return 0;

  const matched = queryTokens.filter((token) => nameTokenSet.has(token));
  if (matched.length === 0) return 0;

  const coverage = matched.length / queryTokens.length;
  const requiredCoverage = queryTokens.length <= 2 ? 1 : 0.66;
  if (coverage < requiredCoverage) return 0;

  let score = Math.round(coverage * 65);
  if (nameTokens[0] === queryTokens[0]) score += 12;
  if (tokensAppearInOrder(nameTokens, queryTokens)) score += 12;
  if (nameTokenSet.has("definitive") && queryTokens.length <= 2) score += 3;

  return adjustSearchScore(score, nameTokens, queryTokens);
}

function cleanSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function addSearchTerm(terms: Set<string>, value: string | null | undefined) {
  const cleaned = cleanSearchText(value || "");
  if (cleaned.length >= 2) terms.add(cleaned);
}

function getSearchTokens(value: string) {
  return cleanSearchText(value)
    .split(" ")
    .map(canonicalSearchToken)
    .filter((token) => token && !searchStopWords.has(token));
}

function canonicalSearchToken(token: string) {
  return singularizeToken(romanNumberMap[token] || token);
}

function singularizeToken(token: string) {
  if (token.length <= 3 || /^\d+$/.test(token)) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

function pluralizeToken(token: string) {
  if (token.length <= 3 || /^\d+$/.test(token)) return token;
  if (token.endsWith("y")) return `${token.slice(0, -1)}ies`;
  if (token.endsWith("s")) return token;
  return `${token}s`;
}

function tokensAppearInOrder(nameTokens: string[], queryTokens: string[]) {
  let cursor = 0;
  for (const token of nameTokens) {
    if (token === queryTokens[cursor]) cursor++;
    if (cursor === queryTokens.length) return true;
  }
  return false;
}

function adjustSearchScore(score: number, nameTokens: string[], queryTokens: string[]) {
  const querySet = new Set(queryTokens);
  const addonTerms = ["addon", "dlc", "expansion", "pack", "pass"];
  const queryWantsAddon = addonTerms.some((term) => querySet.has(term));
  const nameLooksLikeAddon = addonTerms.some((term) => nameTokens.includes(term));

  if (nameLooksLikeAddon && !queryWantsAddon) return Math.max(score - 25, 0);
  return score;
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
