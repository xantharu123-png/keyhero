-- Einmalige Korrektur der Kinguin-Preise (NUR EINMAL AUSFUEHREN!)
--
-- Bis zum Fix in src/lib/kinguin.ts wurde der Kinguin-Preis (bereits EUR)
-- faelschlich durch 100 geteilt. Diese Korrektur multipliziert alle
-- Kinguin-Werte, die VOR dem Live-Gang des Fixes geschrieben wurden, mit 100.
--
-- CUTOFF: Zeitpunkt (UTC), ab dem der gefixte Code auf Vercel live ist.
-- Zeilen danach stammen vom korrekten Import und bleiben unberuehrt.
-- Erst ausfuehren, wenn der Fix deployed ist, sonst schreibt der alte
-- Cron danach wieder falsche Werte.
--
-- Genauigkeit: Die alten Werte wurden nach dem /100 auf Cent gerundet
-- (28.49 -> 0.28). Korrigierte Preise weichen daher um bis zu +-0,50 EUR ab,
-- bis der naechste Import das Angebot ueberschreibt. Angebote mit 0.00
-- (Originalpreis < 0,50 EUR) bleiben 0 und werden auf der Seite ausgeblendet.

BEGIN;

UPDATE "Offer" o
SET "finalPrice" = ROUND((o."finalPrice" * 100)::numeric, 2),
    "basePrice"  = ROUND((o."basePrice" * 100)::numeric, 2),
    "priceChf"   = ROUND((o."finalPrice" * 100 * 0.95)::numeric, 2)
FROM "Store" s
WHERE s.id = o."storeId"
  AND s.slug = 'kinguin'
  AND o."lastCheckedAt" < TIMESTAMP '2026-10-24 00:00:00'; -- CUTOFF anpassen

UPDATE "PriceHistory" ph
SET price = ROUND((ph.price * 100)::numeric, 2)
FROM "Offer" o
JOIN "Store" s ON s.id = o."storeId"
WHERE o.id = ph."offerId"
  AND s.slug = 'kinguin'
  AND ph."checkedAt" < TIMESTAMP '2026-10-24 00:00:00'; -- CUTOFF anpassen

COMMIT;
