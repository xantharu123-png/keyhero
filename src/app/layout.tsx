import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "KeyHero – Game Keys Preisvergleich für Deutschland, Österreich & Schweiz",
    template: "%s | KeyHero",
  },
  description:
    "KeyHero vergleicht Game-Key-Preise aus über 20 Shops. Finde die günstigsten Keys für Steam, PlayStation, Xbox & Nintendo in EUR und CHF. Sicher kaufen in der DACH-Region.",
  keywords: [
    "Game Keys kaufen",
    "Preisvergleich Game Keys",
    "Steam Key günstig",
    "Xbox Key kaufen",
    "PlayStation Key Preisvergleich",
    "Nintendo Key",
    "CD Key Vergleich",
    "Game Key Schweiz",
    "Game Key Deutschland",
    "Game Key Österreich",
    "MMOGA Alternative",
    "Eneba Preisvergleich",
    "digitale Spiele günstig",
  ],
  metadataBase: new URL("https://keyhero.ch"),
  alternates: {
    canonical: "https://keyhero.ch",
  },
  openGraph: {
    title: "KeyHero – Game Keys günstig kaufen | DACH Preisvergleich",
    description:
      "Vergleiche Game-Key-Preise aus 20+ Shops. Die besten Deals für Steam, Xbox, PlayStation & Nintendo – in EUR und CHF.",
    url: "https://keyhero.ch",
    siteName: "KeyHero",
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KeyHero – Game Keys Preisvergleich",
    description: "Die günstigsten Game Keys für die DACH-Region.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({ children }: any) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="de-CH" className="bg-[#0a0a0a] text-white">
      <head>
        {plausibleDomain ? (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          ></script>
        ) : null}
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "KeyHero",
              url: "https://keyhero.ch",
              description:
                "Game-Key-Preisvergleich für Deutschland, Österreich und die Schweiz",
              areaServed: [
                { "@type": "Country", name: "Germany" },
                { "@type": "Country", name: "Austria" },
                { "@type": "Country", name: "Switzerland" },
              ],
            }),
          }}
        />
      </head>
      <body className="relative flex min-h-screen flex-col bg-[#0a0a0a]">
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
