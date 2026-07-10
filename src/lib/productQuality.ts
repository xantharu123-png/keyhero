import type { Prisma } from "@prisma/client";

export const excludedProductTerms = [
  "gift card",
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
];

export function isGameKeyProduct(name: string) {
  const normalized = name.toLowerCase();
  return !excludedProductTerms.some((term) => normalized.includes(term));
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

export type OfferWithGameStore = Prisma.OfferGetPayload<{
  include: {
    game: true;
    store: true;
  };
}>;
