// @ts-nocheck
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "KeyHero â€“ Game Keys gÃ¼nstig kaufen",
  description: "KeyHero vergleicht Game Keys & digitale Spielepreise im Neon-Synthwave Style. Spare bei Steam, Xbox, PlayStation & mehr.",
  keywords: ["Game Keys", "Preisvergleich", "Steam Key", "Xbox", "PlayStation"],
  metadataBase: new URL("https://keyhero.ch"),
  openGraph: {
    title: "KeyHero â€“ Game Keys gÃ¼nstig kaufen",
    description: "Preisvergleich fÃ¼r Steam, Xbox, PlayStation",
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
