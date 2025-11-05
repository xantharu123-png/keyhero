param([switch]$AutoCommit)

Write-Host "KeyHero import setup - only write when changed"

function Ensure-Dir($path) {
  $dir = Split-Path -Parent $path
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
}
function Update-IfChanged($path, [string]$content) {
  Ensure-Dir $path
  $existing = if (Test-Path $path) { Get-Content -Raw -Path $path } else { "" }
  if ($existing -ne $content) { Set-Content -Path $path -Value $content -Encoding UTF8; Write-Host ("updated   " + $path); return $true }
  Write-Host ("unchanged " + $path); return $false
}

# ---------- Files ----------

# 1) Import-Helper: erstellt Tabelle Offer (falls fehlt) + Unique-Index und schreibt Demo-Angebote
$importerTs = @'
// @ts-nocheck
import { prisma } from "@/lib/prisma";

/**
 * Stellt sicher, dass Tabelle und Index existieren.
 * Schreibt Demo-Angebote (Mock). Später hier die echten Quellen anschliessen.
 */
export async function runOfferImport() {
  // Tabelle und Index anlegen, falls sie fehlen (Postgres / Supabase)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Offer" (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      platform TEXT,
      shop TEXT,
      priceChf DOUBLE PRECISION,
      rating DOUBLE PRECISION,
      url TEXT,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Offer_title_platform_shop_key"
    ON "Offer"(title, platform, shop);
  `);

  // Demo-Daten (hier später echte Feeds/API-Ergebnisse einspielen)
  const offers = [
    { title: "EA SPORTS FC 25", platform: "PC / EA App",     shop: "CDKeys",         priceChf: 24.99, rating: 4.8, url: "https://www.cdkeys.com/" },
    { title: "Elden Ring",      platform: "Steam (Global)",  shop: "Instant Gaming", priceChf: 17.50, rating: 4.9, url: "https://www.instant-gaming.com/" },
    { title: "Black Ops 6",     platform: "Xbox Series",     shop: "Eneba",          priceChf: 39.90, rating: 4.6, url: "https://www.eneba.com/" },
    { title: "Forza Horizon 5", platform: "PC / Steam",      shop: "G2A",            priceChf: 12.90, rating: 4.5, url: "https://www.g2a.com/" },
    { title: "Baldur's Gate 3", platform: "PC / Steam",      shop: "CDKeys",         priceChf: 34.90, rating: 4.9, url: "https://www.cdkeys.com/" }
  ];

  let inserted = 0;
  for (const o of offers) {
    // Upsert per SQL (funktioniert auch ohne Prisma-Model-Definition)
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "Offer"(title, platform, shop, priceChf, rating, url, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (title, platform, shop)
      DO UPDATE SET priceChf = EXCLUDED.priceChf,
                    rating = EXCLUDED.rating,
                    url = EXCLUDED.url,
                    "updatedAt" = NOW();
      `,
      o.title, o.platform, o.shop, o.priceChf, o.rating, o.url
    );
    inserted++;
  }

  return { ok: true, count: inserted };
}
'@

# 2) API-Route: GET /api/import/offers -> ruft runOfferImport auf
$apiRouteTs = @'
// @ts-nocheck
import { NextResponse } from "next/server";
import { runOfferImport } from "@/lib/importer";

export const revalidate = 0;

export async function GET() {
  try {
    const res = await runOfferImport();
    return NextResponse.json({ success: true, ...res }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? "import failed" }, { status: 500 });
  }
}
'@

# 3) vercel.json: Cron (stündlich) auf die Route
$vercelJson = @'
{
  "crons": [
    { "path": "/api/import/offers", "schedule": "0 * * * *" }
  ]
}
'@

# 4) Prisma-Model Offer (optional; falls du es in Prisma sichtbar haben möchtest)
#    Du kannst es in schema.prisma eintragen und "npx prisma db push" ausführen.
$schemaOfferComment = @'
# Optionaler Prisma-Model-Block fuer Offer (falls noch nicht vorhanden):
#
# model Offer {
#   id        Int      @id @default(autoincrement())
#   title     String
#   platform  String?
#   shop      String?
#   priceChf  Float?
#   rating    Float?
#   url       String?
#   updatedAt DateTime @updatedAt
# }
'@

# ---------- Write files ----------
$changed = $false
$changed = (Update-IfChanged "src/lib/importer.ts" $importerTs) -or $changed
$changed = (Update-IfChanged "src/app/api/import/offers/route.ts" $apiRouteTs) -or $changed
$changed = (Update-IfChanged "vercel.json" $vercelJson) -or $changed
$changed = (Update-IfChanged "prisma/OFFER_NOTE.txt" $schemaOfferComment) -or $changed

if ($AutoCommit -and $changed) {
  Write-Host "Committing..."
  git add src/lib/importer.ts src/app/api/import/offers/route.ts vercel.json prisma/OFFER_NOTE.txt | Out-Null
  $msg = "chore(import): api + cron + importer"
  git commit -m $msg | Out-Null
  git push
  Write-Host "Pushed"
} elseif ($AutoCommit -and -not $changed) {
  Write-Host "No changes to commit."
}

Write-Host "Done."
