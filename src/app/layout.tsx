import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "KeyHero - Game Keys günstig kaufen",
  description:
    "KeyHero vergleicht Game Keys & digitale Spielepreise. Spare bei Steam, Xbox, PlayStation & mehr.",
  keywords: ["Game Keys", "Preisvergleich", "Steam Key", "Xbox", "PlayStation"],
  metadataBase: new URL("https://keyhero.ch"),
  openGraph: {
    title: "KeyHero - Game Keys günstig kaufen",
    description: "Preisvergleich für Steam, Xbox, PlayStation",
    url: "https://keyhero.ch",
    type: "website",
  },
};

export default function RootLayout({ children }: any) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="de" className="bg-[#0a0a0a] text-white">
      <head>
        {plausibleDomain ? (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          ></script>
        ) : null}
      </head>
      <body className="relative flex min-h-screen flex-col bg-[#0a0a0a]">
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
