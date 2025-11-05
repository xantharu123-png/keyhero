param([switch]$AutoCommit)

Write-Host "KeyHero v2 update - only write when changed"

function Ensure-Dir($path) {
  $dir = Split-Path -Parent $path
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
}

function Update-IfChanged($path, [string]$content) {
  Ensure-Dir $path
  $existing = if (Test-Path $path) { Get-Content -Raw -Path $path } else { "" }
  if ($existing -ne $content) {
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host ("updated   " + $path)
    return $true
  } else {
    Write-Host ("unchanged " + $path)
    return $false
  }
}

# ================== CONTENT START ==================

# lib/prisma singleton (falls noch nicht vorhanden/abweichend)
$libPrisma = @'
// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
'@

# globals.css (dezentere Glows, bessere Lesbarkeit)
$globalsCss = @'
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600&family=Inter:wght@400;500&display=swap");

:root { color-scheme: dark; }
* { box-sizing: border-box; }

html { font-size: 17px; }
body {
  @apply bg-bgDeep text-textBright font-body min-h-screen antialiased;
  line-height: 1.6;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255,0,127,0.10) 0%, rgba(0,0,0,0) 65%),
    radial-gradient(circle at 80% 30%, rgba(0,204,255,0.06) 0%, rgba(0,0,0,0) 65%),
    radial-gradient(circle at 50% 80%, rgba(170,0,255,0.07) 0%, rgba(0,0,0,0) 65%),
    linear-gradient(160deg,#1a0037 0%,#0c001c 40%,#000010 80%);
  background-color: #0b0020;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}

body::after {
  content: "";
  position: fixed; left: 0; right: 0; bottom: 0; height: 24vh;
  background: repeating-linear-gradient(to right, rgba(255,0,127,0.16) 0 1px, transparent 1px 42px),
              repeating-linear-gradient(to top,   rgba(0,204,255,0.16) 0 1px, transparent 1px 42px);
  transform-origin: bottom;
  transform: perspective(600px) rotateX(60deg) scale(1.1);
  filter: drop-shadow(0 0 5px rgba(255,0,127,0.35)) drop-shadow(0 0 14px rgba(0,204,255,0.2));
  pointer-events: none; z-index: 0;
}

.header-glow {
  background: radial-gradient(circle at 50% 0%, rgba(255,0,127,0.18) 0%, rgba(0,0,0,0) 70%);
}

.neon-text {
  text-shadow: 0 0 3px rgba(255,0,127,0.5), 0 0 8px rgba(170,0,255,0.25);
}

.container-xl { max-width: 1280px; margin-left: auto; margin-right: auto; }
.neon-panel {
  border: 1px solid rgba(255,0,127,0.30);
  background: linear-gradient(180deg, rgba(10,0,30,0.6), rgba(8,0,24,0.5));
  backdrop-filter: blur(8px);
  box-shadow: 0 0 8px rgba(255,0,127,0.25), 0 0 18px rgba(0,204,255,0.15);
  border-radius: 0.75rem;
}

.neon-border-soft {
  border: 1px solid rgba(255,0,127,0.25);
  background-color: rgba(10,0,30,0.45);
  backdrop-filter: blur(6px);
  box-shadow: 0 0 6px rgba(255,0,127,0.25), 0 0 16px rgba(0,204,255,0.15);
  border-radius: 0.75rem;
}

.glow-button {
  background-image: linear-gradient(90deg, #ff007f 0%, #aa00ff 50%, #00ccff 100%);
  box-shadow: 0 0 6px rgba(255,0,127,0.4), 0 0 16px rgba(170,0,255,0.3), 0 0 24px rgba(0,204,255,0.2);
  color: #000; font-weight: 600; border-radius: 0.75rem; line-height: 1.2;
  font-family: "Orbitron", system-ui, sans-serif;
}
.glow-button:hover { filter: brightness(1.09); }
'@

# Header / Footer / Layout (mit Plausible, wenn ENV gesetzt)
$headerTsx = @'
// @ts-nocheck
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative z-20">
      <div className="sticky top-0 z-20 border-b border-[rgba(255,0,127,0.25)] bg-[rgba(10,0,30,0.6)] backdrop-blur-md">
        <div className="container-xl flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between md:justify-start md:gap-4">
            <Link href="/" className="font-hero text-xl font-semibold neon-text leading-none text-textBright">
              KEY<span className="text-neonBlue">HERO</span>
            </Link>
            <span className="rounded border border-[rgba(255,0,127,0.4)] bg-[rgba(255,0,127,0.15)] px-2 py-[2px] text-[10px] font-body text-neonPink">
              BETA
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
            <nav className="flex justify-center gap-6 text-[13px] font-medium text-textDim">
              <Link href="/" className="hover:text-neonBlue transition">Home</Link>
              <Link href="/deals" className="hover:text-neonPink transition">Deals</Link>
              <Link href="/shops" className="hover:text-neonYellow transition">Shops</Link>
              <Link href="/impressum" className="hover:text-neonPurple transition">Legal</Link>
            </nav>

            <div className="mx-auto w-full max-w-sm md:mx-0">
              <div className="neon-border-soft flex items-center gap-2 px-3 py-2 text-xs text-textDim">
                <input className="w-full bg-transparent text-textBright placeholder-textDim/60 outline-none text-[12px] font-body" placeholder="Suche Spiel ... z. B. GTA VI" />
                <span className="text-neonBlue text-[10px] font-hero tracking-wider">SEARCH</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
'@

$footerTsx = @'
// @ts-nocheck
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[rgba(255,0,127,0.25)] bg-[rgba(8,0,20,0.65)] backdrop-blur-md">
      <div className="container-xl px-4 py-8 text-[12px] text-textDim">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-textBright font-hero">KEY<span className="text-neonBlue">HERO</span></div>
          <nav className="flex gap-4">
            <Link href="/impressum" className="hover:text-neonPink transition">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-neonBlue transition">Datenschutz</Link>
            <Link href="/kontakt" className="hover:text-neonPurple transition">Kontakt</Link>
          </nav>
        </div>
        <div className="mt-3 text-[11px] text-textDim/70">
          © {new Date().getFullYear()} KeyHero. Kein Verkauf von Keys – Preisvergleich. Angaben ohne Gewähr.
        </div>
      </div>
    </footer>
  );
}
'@

$layoutTsx = @'
// @ts-nocheck
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "KeyHero – Game Keys günstig kaufen",
  description: "KeyHero vergleicht Game Keys & digitale Spielepreise im Neon-Synthwave Style. Spare bei Steam, Xbox, PlayStation & mehr.",
  keywords: ["Game Keys", "Preisvergleich", "Steam Key", "Xbox", "PlayStation"],
  metadataBase: new URL("https://keyhero.ch"),
  openGraph: {
    title: "KeyHero – Game Keys günstig kaufen",
    description: "Preisvergleich für Steam, Xbox, PlayStation",
    url: "https://keyhero.ch",
    type: "website",
  }
};

export default function RootLayout({ children }: any) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="de" className="bg-bgDeep text-textBright">
      <head>
        {plausibleDomain ? (
          <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js"></script>
        ) : null}
      </head>
      <body className="relative flex min-h-screen flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[26vh] header-glow blur-3xl" />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
'@

# Home bleibt kompakt
$homePage = @'
// @ts-nocheck
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative">
      <section className="relative z-10 container-xl px-4 pt-12 pb-16 text-center md:pt-16 md:pb-20">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 rounded-full blur-[60px] w-64 h-64 md:w-80 md:h-80 bg-[radial-gradient(circle_at_50%_30%,rgba(255,196,0,0.35)_0%,rgba(255,0,127,0)_70%)] opacity-40" />
        <h1 className="relative z-10 font-hero text-[2.1rem] md:text-[2.5rem] font-semibold leading-tight text-textBright">
          Game Keys vergleichen. <br /><span className="text-neonPink neon-text">Weniger zahlen.</span>
        </h1>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-textDim">
          KeyHero scannt Angebote für PC, Xbox und PlayStation von seriösen Anbietern. Du kaufst nicht bei uns – wir zeigen dir nur, wo es gerade am günstigsten ist.
        </p>
        <div className="relative z-10 mx-auto mt-8 max-w-xl neon-border-soft p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input className="w-full flex-1 bg-transparent text-textBright placeholder-textDim/60 outline-none text-sm font-body" placeholder="Spiel eingeben … z. B. 'Elden Ring'" />
            <Link className="glow-button text-[11px] px-4 py-2 whitespace-nowrap inline-block" href="/deals">Preis checken</Link>
          </div>
          <div className="mt-2 text-[10px] text-textDim/60 text-left font-hero tracking-wider">STEAM • XBOX • PLAYSTATION • GLOBAL KEYS</div>
        </div>
      </section>
    </div>
  );
}
'@

# /deals – liest 24 Offers aus DB (falls vorhanden), sonst Hinweis
$dealsPage = @'
// @ts-nocheck
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Deals – KeyHero", description: "Aktuelle Game-Key-Angebote" };

export default async function DealsPage() {
  let deals: any[] = [];
  try {
    deals = await prisma.offer.findMany({
      take: 24,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        platform: true,
        shop: true,
        priceChf: true,
        rating: true,
        url: true,
      },
    });
  } catch (e) {
    // prisma oder Tabelle nicht vorhanden
  }

  const hasDeals = Array.isArray(deals) && deals.length > 0;

  return (
    <div className="container-xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-hero text-[1.4rem] text-textBright">Deals</h1>
        <p className="text-[13px] text-textDim/75">Live-Preise in CHF. Angaben ohne Gewähr.</p>
      </div>

      {!hasDeals && (
        <div className="neon-border-soft p-4 text-[13px] text-textDim">
          Noch keine Daten in der DB gefunden. Du kannst später die erste Import-Routine ausführen oder die Tabelle
          <code className="ml-2"> Offer </code> mit Testdaten füllen.
        </div>
      )}

      {hasDeals && (
        <div className="grid gap-4 md:grid-cols-3">
          {deals.map((d) => (
            <div key={d.id} className="neon-panel p-4 text-[13px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-hero text-textBright text-[14px] leading-tight">{d.title}</div>
                  <div className="text-[11px] text-textDim/70">{d.platform}</div>
                </div>
                <div className="text-right">
                  <div className="text-neonPink font-hero text-[15px] leading-none">{d.priceChf?.toFixed?.(2) ?? d.priceChf ?? "-" } CHF</div>
                  <div className="text-[10px] text-textDim/70 leading-tight">bei {d.shop}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-[11px] text-textDim/70">{d.rating ? `${d.rating}/5` : "–"}</div>
                {d.url ? (
                  <a href={d.url} target="_blank" className="glow-button text-[10px] px-3 py-2 leading-none font-hero tracking-wider">Zum Angebot</a>
                ) : (
                  <span className="text-[10px] text-textDim/50">kein Link</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
'@

# /shops – einfache Übersicht
$shopsPage = @'
// @ts-nocheck
export const metadata = { title: "Shops – KeyHero", description: "Verglichene Händler" };

const SHOPS = [
  { name: "CDKeys", note: "Trusted Seller" },
  { name: "Eneba", note: "Key Marketplace" },
  { name: "Instant Gaming", note: "PC Keys" },
  { name: "G2A", note: "Global Keys" },
];

export default function ShopsPage() {
  return (
    <div className="container-xl px-4 py-10">
      <h1 className="font-hero text-[1.4rem] text-textBright mb-2">Shops</h1>
      <p className="text-[13px] text-textDim/75 mb-6">Wir vergleichen seriöse Anbieter für digitale Keys.</p>
      <div className="grid gap-4 md:grid-cols-4">
        {SHOPS.map((s) => (
          <div key={s.name} className="neon-border-soft p-4 text-center text-[12px]">
            <div className="text-textBright font-hero text-[13px]">{s.name}</div>
            <div className="text-[10px] text-textDim/70 mt-1">{s.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
'@

# Impressum / Datenschutz / Kontakt – Basis-CH
$impressum = @'
// @ts-nocheck
export const metadata = { title: "Impressum – KeyHero" };

export default function Page() {
  return (
    <div className="container-xl px-4 py-10 text-[13px] text-textDim">
      <h1 className="font-hero text-textBright text-[1.4rem] mb-3">Impressum</h1>
      <p><b>Betreiber:</b> KeyHero (Privatprojekt)</p>
      <p><b>Adresse:</b> Schweiz</p>
      <p><b>Kontakt:</b> siehe Kontaktseite</p>
      <p className="mt-4 text-textDim/70">Keine Gewähr für Richtigkeit, Vollständigkeit und Aktualität der Inhalte. Kein Verkauf, nur Preisvergleich.</p>
    </div>
  );
}
'@

$datenschutz = @'
// @ts-nocheck
export const metadata = { title: "Datenschutz – KeyHero" };

export default function Page() {
  return (
    <div className="container-xl px-4 py-10 text-[13px] text-textDim">
      <h1 className="font-hero text-textBright text-[1.4rem] mb-3">Datenschutz</h1>
      <p>Wir verarbeiten so wenig personenbezogene Daten wie möglich. Zugriffsdaten (Server-Logs) werden zur Sicherstellung des Betriebs verarbeitet.</p>
      <p className="mt-2">Analytics: Wenn aktiviert, nutzen wir Plausible Analytics (EU, ohne Cookies, DSGVO-konform).</p>
      <p className="mt-2">Bei Fragen kontaktieren Sie uns über die Kontaktseite.</p>
    </div>
  );
}
'@

$kontakt = @'
// @ts-nocheck
export const metadata = { title: "Kontakt – KeyHero" };

export default function Page() {
  return (
    <div className="container-xl px-4 py-10 text-[13px] text-textDim">
      <h1 className="font-hero text-textBright text-[1.4rem] mb-3">Kontakt</h1>
      <p>Schreiben Sie uns eine Nachricht: kontakt@keyhero.ch</p>
      <p className="mt-2">Wir antworten in der Regel zeitnah.</p>
    </div>
  );
}
'@

# tailwind / postcss
$tailwind = @'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgDeep: "#0b0020",
        textBright: "#f3f6ff",
        textDim: "#b9b9d0",
        neonPink: "#ff007f",
        neonBlue: "#00ccff",
        neonPurple: "#aa00ff",
        neonYellow: "#ffc400",
      },
      fontFamily: {
        hero: ["Orbitron", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
'@

$postcss = @'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
'@

# sitemap / robots nach Next App Router
$sitemap = @'
// @ts-nocheck
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://keyhero.ch";
  return [
    { url: base + "/", changeFrequency: "daily", priority: 0.9 },
    { url: base + "/deals", changeFrequency: "hourly", priority: 0.8 },
    { url: base + "/shops", changeFrequency: "weekly", priority: 0.6 },
    { url: base + "/impressum", changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/datenschutz", changeFrequency: "yearly", priority: 0.3 },
    { url: base + "/kontakt", changeFrequency: "yearly", priority: 0.3 },
  ];
}
'@

$robots = @'
// @ts-nocheck
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://keyhero.ch/sitemap.xml",
  };
}
'@

# ================== CONTENT END ==================

$changed = $false
$changed = (Update-IfChanged "src/lib/prisma.ts" $libPrisma) -or $changed
$changed = (Update-IfChanged "src/app/globals.css" $globalsCss) -or $changed
$changed = (Update-IfChanged "src/components/Header.tsx" $headerTsx) -or $changed
$changed = (Update-IfChanged "src/components/Footer.tsx" $footerTsx) -or $changed
$changed = (Update-IfChanged "src/app/layout.tsx" $layoutTsx) -or $changed
$changed = (Update-IfChanged "src/app/page.tsx" $homePage) -or $changed

$changed = (Update-IfChanged "src/app/deals/page.tsx" $dealsPage) -or $changed
$changed = (Update-IfChanged "src/app/shops/page.tsx" $shopsPage) -or $changed
$changed = (Update-IfChanged "src/app/impressum/page.tsx" $impressum) -or $changed
$changed = (Update-IfChanged "src/app/datenschutz/page.tsx" $datenschutz) -or $changed
$changed = (Update-IfChanged "src/app/kontakt/page.tsx" $kontakt) -or $changed

$changed = (Update-IfChanged "tailwind.config.js" $tailwind) -or $changed
$changed = (Update-IfChanged "postcss.config.js" $postcss) -or $changed
$changed = (Update-IfChanged "src/app/sitemap.ts" $sitemap) -or $changed
$changed = (Update-IfChanged "src/app/robots.ts" $robots) -or $changed

if ($AutoCommit -and $changed) {
  Write-Host "Changes detected - committing..."
  git add src/lib/prisma.ts src/app/globals.css src/components/Header.tsx src/components/Footer.tsx src/app/layout.tsx src/app/page.tsx `
          src/app/deals/page.tsx src/app/shops/page.tsx src/app/impressum/page.tsx src/app/datenschutz/page.tsx src/app/kontakt/page.tsx `
          tailwind.config.js postcss.config.js src/app/sitemap.ts src/app/robots.ts | Out-Null
  $msg = "site v2: design + pages + seo + plausible + deals page " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
  git commit -m $msg | Out-Null
  git push
  Write-Host "Pushed"
} elseif ($AutoCommit -and -not $changed) {
  Write-Host "No changes to commit."
}

Write-Host "Done."
