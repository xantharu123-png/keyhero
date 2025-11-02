import "./globals.css";

export const metadata = {
  title: "KeyHero – Game Key Preisvergleich",
  description:
    "KeyHero vergleicht digitale Game Keys in Echtzeit. Wir zeigen dir den günstigsten Händler. Wir selbst verkaufen keine Keys.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-slate-800 bg-card/50 backdrop-blur p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="text-white font-semibold text-lg">
              keyhero<span className="text-accent">.ch</span>
            </div>
            <nav className="text-xs text-textDim flex gap-4">
              <a className="hover:text-accent" href="/">
                Deals
              </a>
              <a className="hover:text-accent" href="/store/eneba">
                Shops
              </a>
              <a className="hover:text-accent" href="#">
                Impressum
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-800 text-[10px] text-textDim p-4 text-center">
          Wir listen Angebote externer Händler und erhalten ggf. eine Provision.
          Alle Käufe finden beim Händler statt, nicht bei KeyHero.
        </footer>
      </body>
    </html>
  );
}
