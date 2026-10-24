/**
 * SubID / ClickRef-Tracking für Affiliate-Redirects.
 *
 * Fast alle Netzwerke erlauben einen freien Klick-Referenz-Parameter,
 * der später in deren Conversion-Reports auftaucht. AWIN nutzt `clickref`
 * (unser Default), Admitad üblicherweise `subid`.
 *
 * Nutzung: /go/123?subid=deals-seite  →  Parameter wird ans Affiliate-Ziel
 * angehängt, der Klick landet in der Click-Tabelle.
 */

const SUBID_PARAM_BY_STORE: Record<string, string> = {
  // AWIN-Netzwerk
  fanatical: "clickref",
  greenmangaming: "clickref",
  gamesplanet: "clickref",
  mmoga: "clickref",
  "loaded-cdkeys": "clickref",
  "cjs-cd-keys": "clickref",
  // Admitad-Netzwerk
  gamivo: "subid",
  k4g: "subid",
  hrkgame: "subid",
};

const DEFAULT_SUBID_PARAM = "clickref";

/** Erlaubt nur [a-z0-9_-], max. 64 Zeichen – sicher für Query-Strings. */
export function sanitizeSubId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "").substring(0, 64);
  return cleaned || null;
}

/** Hängt die SubID mit dem passenden Parameternamen an die Ziel-URL. */
export function appendSubId(targetUrl: string, storeSlug: string, subId: string): string {
  try {
    const url = new URL(targetUrl);
    const param = SUBID_PARAM_BY_STORE[storeSlug] || DEFAULT_SUBID_PARAM;
    url.searchParams.set(param, subId);
    return url.toString();
  } catch {
    return targetUrl; // Im Zweifel unverändert weiterleiten
  }
}
