# KeyHero supplier coverage

KeyHero now supports three supplier lanes:

1. Active direct API
   - Kinguin via `KINGUIN_API_KEY`

2. Aggregated official PC stores
   - CheapShark via public API
   - Stores are fetched from `https://www.cheapshark.com/api/1.0/stores?format=json`

3. Affiliate/product feeds
   - Generic CSV/JSON importer via `AFFILIATE_FEEDS`
   - Per-supplier feed URL env vars:
     - `ENEBA_FEED_URL`
     - `G2A_FEED_URL`
     - `GAMIVO_FEED_URL`
     - `MMOGA_FEED_URL`
     - `LOADED_FEED_URL`
     - `INSTANT_GAMING_FEED_URL`
     - `HRKGAME_FEED_URL`
     - `K4G_FEED_URL`
     - `DRIFFLE_FEED_URL`
     - `ROYALCDKEYS_FEED_URL`
     - `CJS_CD_KEYS_FEED_URL`
     - `SCDKEY_FEED_URL`
     - `MICROSOFT_XBOX_FEED_URL`
     - `PLAYSTATION_FEED_URL`
     - `NINTENDO_FEED_URL`

## AFFILIATE_FEEDS format

Use this when a network feed needs custom field names:

```json
[
  {
    "storeSlug": "eneba",
    "url": "https://example.com/eneba-feed.csv",
    "format": "csv",
    "currency": "EUR",
    "platform": "PC",
    "fieldMap": {
      "name": ["product_name", "title"],
      "price": ["price", "sale_price"],
      "basePrice": ["old_price", "rrp"],
      "currency": "currency",
      "url": ["deep_link", "affiliate_url"],
      "image": ["image_url", "cover"],
      "platform": "platform",
      "region": "region"
    }
  }
]
```

Optional:

- `AFFILIATE_FEED_LIMIT=500`

Import endpoint:

- `/api/import/offers?source=suppliers` only syncs known suppliers.
- `/api/import/offers?source=feeds` imports configured affiliate feeds.
- `/api/import/offers?source=all` runs supplier sync, Kinguin, CheapShark, and configured feeds.

Do not scrape price-comparison competitors. Prefer official APIs, affiliate product feeds, or direct partner exports.

## Affiliate-Tracking & Sicherheit (Stand 2026-07-24)

Neue Environment-Variablen:

- `IMPORT_SECRET` — schuetzt `/api/import/offers` und `/api/stats/clicks`.
  Lokal in `.env.local` gesetzt; in Vercel unter Project Settings →
  Environment Variables ebenfalls eintragen.
- `CRON_SECRET` — in Vercel setzen. Vercel Cron sendet dann automatisch
  `Authorization: Bearer <CRON_SECRET>` und der stuendliche Import
  (`vercel.json`) laeuft trotz aktivem IMPORT_SECRET weiter.
- `KINGUIN_AFFILIATE_QUERY` — Tracking-Parameter fuer Kinguin-Links,
  z. B. `r=deine-id` aus dem Kinguin-Affiliate-Dashboard. Ohne diese
  Variable werden nackte Produkt-URLs gebaut → keine Provision.

## Klick-Tracking

- Jeder Redirect ueber `/go/<offerId>` schreibt einen Eintrag in die
  `Click`-Tabelle (offerId, storeId, gameId, subId, Referer-Host, User-Agent;
  keine IP, kein Cookie → DSGVO-schonend).
- Kampagnen-Tracking: `/go/123?subid=deals-seite` haengt die SubID ans
  Affiliate-Ziel an (AWIN-Shops: `clickref`, Admitad-Shops: `subid`,
  Mapping in `src/lib/clickTracking.ts`).
- Auswertung: `/api/stats/clicks?key=<IMPORT_SECRET>&days=30` liefert
  Klicks pro Shop, Top-Spiele und SubID-Aufschluesselung.
- Verkaeufe/Provisionen sieht man im Dashboard des jeweiligen Netzwerks;
  dort nach clickref/subid filtern, um Klicks mit Sales zu matchen.
