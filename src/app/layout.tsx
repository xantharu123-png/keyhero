// @ts-nocheck
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "KeyHero – Game Keys günstig kaufen",
  description:
    "KeyHero vergleicht Game Keys & digitale Spielepreise im Neon-Synthwave Style. Spare bei Steam, Xbox, PlayStation & mehr.",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="de" className="bg-bgDeep text-textBright">
      <body className="relative flex min-h-screen flex-col">
        {/* Glow hinter dem Header */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[30vh] header-glow blur-3xl" />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
