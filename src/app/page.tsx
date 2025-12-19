import Link from "next/link";
import { prisma } from "@/lib/db"; // Importiere unseren neuen Helper

// Diese Funktion holt die Daten frisch aus der DB
async function getGames() {
  const games = await prisma.game.findMany({
    take: 6, // Zeige max 6 Spiele
    include: {
      offers: {
        orderBy: { finalPrice: 'asc' }, // Günstigster Preis zuerst
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' } // Neueste Spiele zuerst
  });
  return games;
}

export default async function HomePage() {
  const games = await getGames();

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-12 pb-16 text-center md:pt-20 md:pb-24">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 rounded-full blur-[80px] w-64 h-64 md:w-96 md:h-96 bg-[radial-gradient(circle_at_50%_30%,rgba(255,196,0,0.25)_0%,rgba(255,0,127,0)_70%)] opacity-50" />
        
        <h1 className="relative z-10 text-4xl md:text-6xl font-bold leading-tight mb-6">
          Game Keys vergleichen. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-600">
            Weniger zahlen.
          </span>
        </h1>
        
        <p className="relative z-10 mx-auto max-w-xl text-gray-400 text-lg mb-8">
          Finde die besten Preise für PC, PlayStation & Xbox. Wir vergleichen Shops wie MMOGA, Eneba & Co. für dich.
        </p>

        {/* Search Bar */}
        <div className="relative z-10 mx-auto max-w-xl bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-sm flex items-center gap-2">
          <input 
            className="w-full bg-transparent text-white placeholder-gray-500 outline-none px-4 py-3 text-base" 
            placeholder="Spiel suchen... z. B. 'FC 25'" 
          />
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Suchen
          </button>
        </div>
      </section>

      {/* Games Grid */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-pink-600 pl-4">Aktuelle Top-Deals</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {games.map((game) => {
            // Preis ermitteln (falls vorhanden)
            const lowestPrice = game.offers[0]?.finalPrice 
              ? `${game.offers[0].finalPrice.toFixed(2)} €` 
              : "Nicht verfügbar";

            return (
              <Link key={game.id} href={`/game/${game.slug}`} className="group block bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all hover:transform hover:-translate-y-1">
                {/* Bild-Bereich */}
                <div className="relative h-48 bg-gray-800 overflow-hidden">
                  {game.coverImage ? (
                    <img src={game.coverImage} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-600">Kein Bild</div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/80 text-xs font-bold px-2 py-1 rounded text-white border border-white/10">
                    {lowestPrice}
                  </div>
                </div>
                
                {/* Infos */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-100 group-hover:text-pink-500 transition-colors truncate">{game.name}</h3>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                    <span>{game.offers.length} Angebote</span>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded">Global</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}