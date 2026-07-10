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
