import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Stores
  const mmoga = await prisma.store.upsert({
    where: { slug: "mmoga" },
    update: {},
    create: {
      name: "MMOGA",
      slug: "mmoga",
      logoUrl: "/stores/mmoga.png",
      rating: 4.4,
      isVerified: true,
      description: "Game Keys & Ingame Currency",
      website: "https://www.mmoga.net",
      paymentMethods: ["PayPal", "Kreditkarte", "Klarna"],
    },
  });

  const eneba = await prisma.store.upsert({
    where: { slug: "eneba" },
    update: {},
    create: {
      name: "Eneba",
      slug: "eneba",
      logoUrl: "/stores/eneba.png",
      rating: 4.6,
      isVerified: true,
      description: "Digital game marketplace",
      website: "https://www.eneba.com",
      paymentMethods: ["PayPal", "Kreditkarte", "Apple Pay"],
    },
  });

  // Game
  const fc25 = await prisma.game.upsert({
    where: { slug: "ea-sports-fc-25" },
    update: {},
    create: {
      name: "EA Sports FC 25",
      slug: "ea-sports-fc-25",
      description:
        "EA Sports FC 25 ist der Nachfolger der FIFA-Reihe mit verbesserter KI, Clubs-Modus und Ultimate Team.",
      coverImage: "/games/fc25.jpg",
      pegi: 3,
      platforms: {
        create: [
          { platform: "PC / Steam" },
          { platform: "Xbox Series" },
          { platform: "PS5" },
        ],
      },
    },
  });

  // Offers
  await prisma.offer.createMany({
    data: [
      {
        gameId: fc25.id,
        storeId: mmoga.id,
        edition: "Standard",
        region: "GLOBAL",
        platform: "Steam",
        basePrice: 38.99,
        currency: "EUR",
        feeEstimate: 1.0,
        finalPrice: 39.99,
        affiliateUrl:
          "https://www.mmoga.net/fc25?affid=DEIN_AFFILIATE",
      },
      {
        gameId: fc25.id,
        storeId: eneba.id,
        edition: "Standard",
        region: "EU",
        platform: "Steam",
        basePrice: 36.49,
        currency: "EUR",
        feeEstimate: 1.5,
        finalPrice: 37.99,
        affiliateUrl:
          "https://www.eneba.com/fc25?af_id=DEIN_AFFILIATE",
      },
    ],
  });
}

main()
  .then(async () => {
    console.log("Seed done.");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
