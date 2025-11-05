param([switch]$AutoCommit)

Write-Host "KeyHero mini update – only write when changed" -ForegroundColor Cyan

function Ensure-Dir($path) {
  $dir = Split-Path -Parent $path
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
}

function Update-IfChanged($path, [string]$content) {
  Ensure-Dir $path
  $existing = if (Test-Path $path) { Get-Content $path -Raw } else { "" }
  if ($existing -ne $content) {
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host ("✔ updated  " + $path) -ForegroundColor Green
    return $true
  } else {
    Write-Host ("• unchanged " + $path) -ForegroundColor DarkGray
    return $false
  }
}

# ================== CONTENT START ==================

$globalsCss = @'
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600&family=Inter:wght@400;500&display=swap");

:root { color-scheme: dark; }
* { box-sizing: border-box; }

body {
  @apply bg-bgDeep text-textBright font-body min-h-screen antialiased;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255,0,127,0.12) 0%, rgba(0,0,0,0) 70%),
    radial-gradient(circle at 80% 30%, rgba(0,204,255,0.07) 0%, rgba(0,0,0,0) 70%),
    radial-gradient(circle at 50% 80%, rgba(170,0,255,0.09) 0%, rgba(0,0,0,0) 70%),
    linear-gradient(160deg,#1a0037 0%,#0c001c 40%,#000010 80%);
  background-color: #0b0020;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}

body::after {
  content: "";
  position: fixed; left: 0; right: 0; bottom: 0; height: 28vh;
  background: repeating-linear-gradient(to right, rgba(255,0,127,0.18) 0 1px, transparent 1px 40px),
              repeating-linear-gradient(to top,   rgba(0,204,255,0.18) 0 1px, transparent 1px 40px);
  background-color: rgba(11,0,32,0,0);
  transform-origin: bottom;
  transform: perspective(600px) rotateX(60deg) scale(1.15);
  filter: drop-shadow(0 0 6px rgba(255,0,127,0.4)) drop-shadow(0 0 18px rgba(0,204,255,0.25));
  pointer-events: none; z-index: 0;
}

.header-glow { background: radial-gradient(circle at 50% 0%, rgba(255,0,127,0.22) 0%, rgba(0,0,0,0) 70%); }

.neon-text {
  text-shadow: 0 0 4px rgba(255,0,127,0.6), 0 0 10px rgba(255,0,127,0.4), 0 0 16px rgba(170,0,255,0.3);
}

.neon-panel {
  border: 1px solid rgba(255,0,127,0.4);
  background: radial-gradient(circle at 0% 0%, rgba(255,0,127,0.08) 0%, rgba(0,0,0,0) 70%),
              radial-gradient(circle at 100% 100%, rgba(0,204,255,0.06) 0%, rgba(0,0,0,0) 70%);
  background-color: rgba(10,0,30,0.5);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 8px rgba(255,0,127,0.4), 0 0 24px rgba(0,204,255,0.2);
  border-radius: 0.75rem;
}

.neon-border-soft {
  border: 1px solid rgba(255,0,127,0.3);
  background-color: rgba(10,0,30,0.45);
  backdrop-filter: blur(6px);
  box-shadow: 0 0 6px rgba(255,0,127,0.35), 0 0 20px rgba(0,204,255,0.2);
  border-radius: 0.75rem;
}

.glow-button {
  background-image: linear-gradient(90deg, #ff007f 0%, #aa00ff 50%, #00ccff 100%);
  box-shadow: 0 0 6px rgba(255,0,127,0.5), 0 0 16px rgba(170,0,255,0.4), 0 0 24px rgba(0,204,255,0.3);
  color: #000; font-weight: 600; border-radius: 0.75rem; line-height: 1.2;
  font-family: "Orbitron", system-ui, sans-serif;
}
.glow-button:hover { filter: brightness(1.12); }
'@

$headerTsx = @'
// @ts-nocheck
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative z-20">
      <div className="sticky top-0 z-20 border-b border-[rgba(255,0,127,0.3)] bg-[rgba(10,0,30,0.6)] backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between md:justify-start md:gap-4">
            <Link href="/" className="font-hero text-xl font-semibold neon-text leading-none text-textBright">
              KEY<span className="text-neonBlue">HERO</span>
            </Link>
            <span className="rounded border border-[rgba(255,0,127,0.5)] bg-[rgba(255,0,127,0.15)] px-2 py-[2px] text-[10px] font-body font-medium text-neonPink shadow-[0_0_8px_rgba(255,0,127,0.5)]">
              BETA
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
            <nav className="flex justify-center gap-6 text-[13px] font-medium text-textDim">
              <Link href="/" className="hover:text-neonBlue transition-[color,filter] hover:drop-shadow-[0_0_4px_rgba(0,204,255,0.8)]">Home</Link>
              <Link href="/#deals" className="hover:text-neonPink transition-[color,filter] hover:drop-shadow-[0_0_4px_rgba(255,0,127,0.8)]">Deals</Link>
              <Link href="/#shops" className="hover:text-neonYellow transition-[color,filter] hover:drop-shadow-[0_0_4px_rgba(255,196,0,0.8)]">Shops</Link>
              <Link href="/impressum" className="hover:text-neonPurple transition-[color,filter] hover:drop-shadow-[0_0_4px_rgba(170,0,255,0.8)]">Legal</Link>
            </nav>

            <div className="mx-auto w-full max-w-sm md:mx-0">
              <div className="neon-border-soft flex items-center gap-2 px-3 py-2 text-xs text-textDim">
                <input className="w-full bg-transparent text-textBright placeholder-textDim/50 outline-none text-[12px] font-body" placeholder="Suche Spiel … z. B. GTA VI" />
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
    <footer className="relative z-10 border-t border-[rgba(255,0,127,0.25)] bg-[rgba(8,0,20,0.7)] backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-8 text-[12px] text-textDim">
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
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="de" className="bg-bgDeep text-textBright">
      <body className="relative flex min-h-screen flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[30vh] header-glow blur-3xl" />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
'@

$pageTsx = @'
// @ts-nocheck
import Link from "next/link";

export default function HomePage() {
  const topDeals = [
    { id: 1, title: "EA SPORTS FC 25", platform: "PC / EA App Key", price: "24.99 CHF", shop: "CDKeys", rating: "4.8/5" },
    { id: 2, title: "Call of Duty: Black Ops 6", platform: "Xbox Series Key", price: "39.90 CHF", shop: "Eneba", rating: "4.6/5" },
    { id: 3, title: "Elden Ring", platform: "Steam Key (Global)", price: "17.50 CHF", shop: "Instant Gaming", rating: "4.9/5" },
  ];

  return (
    <div className="relative">
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-16 text-center md:pt-16 md:pb-20">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 rounded-full blur-[60px] w-64 h-64 md:w-80 md:h-80 bg-[radial-gradient(circle_at_50%_30%,rgba(255,196,0,0.4)_0%,rgba(255,0,127,0)_70%)] opacity-40" />
        <h1 className="relative z-10 font-hero text-[1.9rem] md:text-[2.3rem] font-semibold leading-tight text-textBright drop-shadow-[0_0_10px_rgba(255,0,127,0.4)]">
          Game Keys vergleichen. <br /><span className="text-neonPink neon-text">Weniger zahlen.</span>
        </h1>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-textDim">
          KeyHero scannt Angebote für PC, Xbox und PlayStation von seriösen Anbietern. Du kaufst nicht bei uns – wir zeigen dir nur, wo es gerade am günstigsten ist.
        </p>
        <div className="relative z-10 mx-auto mt-8 max-w-xl neon-border-soft p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input className="w-full flex-1 bg-transparent text-textBright placeholder-textDim/50 outline-none text-sm font-body" placeholder="Spiel eingeben … z. B. 'Elden Ring'" />
            <button className="glow-button text-[11px] px-4 py-2 whitespace-nowrap">Preis checken</button>
          </div>
          <div className="mt-2 text-[10px] text-textDim/60 text-left font-hero tracking-wider">STEAM • XBOX • PLAYSTATION • GLOBAL KEYS</div>
        </div>
      </section>

      <section id="deals" className="relative z-10 mx-auto max-w-6xl px-4 pb-16 text-textBright">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-hero text-[0.8rem] tracking-wider text-neonBlue drop-shadow-[0_0_6px_rgba(0,204,255,0.6)]">🔥 TOP DEALS HEUTE</div>
            <div className="text-[12px] text-textDim/70 leading-relaxed max-w-md">Live aus unseren Daten. Preise in CHF. Angaben ohne Gewähr.</div>
          </div>
          <Link href="#" className="text-[11px] font-hero tracking-wider text-textDim hover:text-neonPink hover:drop-shadow-[0_0_4px_rgba(255,0,127,0.8)] transition self-start md:self-auto">Alle Spiele →</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {topDeals.map((deal) => (
            <div key={deal.id} className="neon-panel p-4 text-left text-[13px] leading-relaxed">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-hero text-textBright text-[14px] leading-tight">{deal.title}</div>
                  <div className="text-[11px] text-textDim/70">{deal.platform}</div>
                </div>
                <div className="text-right">
                  <div className="text-neonPink font-hero text-[15px] leading-none drop-shadow-[0_0_6px_rgba(255,0,127,0.6)]">{deal.price}</div>
                  <div className="text-[10px] text-textDim/70 leading-tight">bei {deal.shop}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-textDim/70">
                <div>{deal.rating} ⭐</div>
                <Link href="#" className="glow-button text-[10px] px-3 py-2 leading-none font-hero tracking-wider">Zum Angebot →</Link>
              </div>

              <div className="mt-3 text-[10px] text-textDim/40 leading-relaxed">
                Kauf findet beim Händler statt. Wir bekommen evtl. eine kleine Provision.
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="shops" className="relative z-10 mx-auto max-w-6xl px-4 pb-24 text-textBright">
        <div className="mb-4">
          <div className="font-hero text-[0.8rem] tracking-wider text-neonPurple drop-shadow-[0_0_6px_rgba(170,0,255,0.6)]">VERTRIEBSPARTNER & SHOPS</div>
          <div className="text-[12px] text-textDim/70 leading-relaxed max-w-md">Wir vergleichen nur Anbieter, die digitale Keys liefern. Keine physischen Boxen, nur Codes.</div>
        </div>
        <div className="grid gap-4 text-[12px] text-textDim/80 md:grid-cols-4">
          <div className="neon-border-soft p-4 text-center"><div className="text-textBright font-hero text-[13px]">CDKeys</div><div className="text-[10px] text-textDim/60 mt-1">Trusted Seller</div></div>
          <div className="neon-border-soft p-4 text-center"><div className="text-textBright font-hero text-[13px]">Eneba</div><div className="text-[10px] text-textDim/60 mt-1">Key Marketplace</div></div>
          <div className="neon-border-soft p-4 text-center"><div className="text-textBright font-hero text-[13px]">Instant Gaming</div><div className="text-[10px] text-textDim/60 mt-1">PC Keys</div></div>
          <div className="neon-border-soft p-4 text-center"><div className="text-textBright font-hero text-[13px]">G2A</div><div className="text-[10px] text-textDim/60 mt-1">Global Keys</div></div>
        </div>
        <div className="mt-6 text-[10px] text-textDim/40 leading-relaxed max-w-xl">Wir sind kein Verkäufer. Wir listen Preise. Du kaufst beim Händler. Unser Service bleibt für dich kostenlos.</div>
      </section>
    </div>
  );
}
'@

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

# ================== CONTENT END ==================

$changed = $false
$changed = (Update-IfChanged "src/app/globals.css" $globalsCss) -or $changed
$changed = (Update-IfChanged "src/components/Header.tsx" $headerTsx) -or $changed
$changed = (Update-IfChanged "src/components/Footer.tsx" $footerTsx) -or $changed
$changed = (Update-IfChanged "src/app/layout.tsx" $layoutTsx) -or $changed
$changed = (Update-IfChanged "src/app/page.tsx" $pageTsx) -or $changed
$changed = (Update-IfChanged "tailwind.config.js" $tailwind) -or $changed
$changed = (Update-IfChanged "postcss.config.js" $postcss) -or $changed

if ($AutoCommit -and $changed) {
  Write-Host "Changes detected – committing..." -ForegroundColor Yellow
  git add src/app/globals.css src/components/Header.tsx src/components/Footer.tsx src/app/layout.tsx src/app/page.tsx tailwind.config.js postcss.config.js | Out-Null
  $msg = "ui: mini update (layout/header/footer/globals/tailwind/postcss) $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  git commit -m $msg | Out-Null
  git push
  Write-Host "Pushed ✔" -ForegroundColor Green
} elseif ($AutoCommit -and -not $changed) {
  Write-Host "No changes to commit." -ForegroundColor DarkGray
}

Write-Host "Done." -ForegroundColor Cyan
