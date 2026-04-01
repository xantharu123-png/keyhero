const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starte Seeding...')

  // 1. Aufräumen
  await prisma.priceHistory.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.gamePlatform.deleteMany()
  await prisma.game.deleteMany()
  await prisma.store.deleteMany()

  console.log('🗑️  Alte Daten bereinigt.')

  // 2. Shops erstellen
  const mmoga = await prisma.store.create({
    data: {
      name: 'MMOGA',
      slug: 'mmoga',
      url: 'https://www.mmoga.de',
      website: 'https://www.mmoga.de',
      logoUrl: '/logos/mmoga.png',
      isVerified: true,
      rating: 4.8,
      paymentMethods: ['Paypal', 'Sofort', 'Kreditkarte'],
      description: 'Einer der größten Key-Seller.'
    }
  })

  const eneba = await prisma.store.create({
    data: {
      name: 'Eneba',
      slug: 'eneba',
      url: 'https://www.eneba.com',
      website: 'https://www.eneba.com',
      logoUrl: '/logos/eneba.png',
      isVerified: true,
      rating: 4.6,
      paymentMethods: ['Paypal', 'Kreditkarte', 'Crypto'],
      description: 'Marktplatz für digitale Spiele.'
    }
  })

  // 3. Spiele erstellen
  const fc25 = await prisma.game.create({
    data: {
      name: 'EA Sports FC 25',
      slug: 'fc-25',
      description: 'Das beliebteste Fußballspiel.',
      releaseDate: new Date('2024-09-27T00:00:00Z'),
      pegi: 3,
      coverImage: 'https://image.api.playstation.com/vulcan/ap/disc/25/CUSA40326_00/1.png'
    }
  })

  const gta5 = await prisma.game.create({
    data: {
      name: 'Grand Theft Auto V',
      slug: 'gta-5',
      description: 'Open World Klassiker.',
      releaseDate: new Date('2013-09-17T00:00:00Z'),
      pegi: 18,
      coverImage: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png'
    }
  })

  // 4. Angebote verknüpfen
  // FC 25 bei MMOGA
  await prisma.offer.create({
    data: {
      gameId: fc25.id,
      storeId: mmoga.id,
      platform: 'Origin / EA App',
      region: 'Global',
      edition: 'Standard',
      finalPrice: 49.99,
      currency: 'EUR',
      priceChf: 47.50,
      affiliateUrl: 'https://www.mmoga.de/Steam-Games/EA-Sports-FC-25.html?ref=KeyHero',
      lastCheckedAt: new Date(),
      url: 'https://www.mmoga.de/Steam-Games/EA-Sports-FC-25.html'
    }
  })

  // FC 25 bei Eneba
  await prisma.offer.create({
    data: {
      gameId: fc25.id,
      storeId: eneba.id,
      platform: 'Origin / EA App',
      region: 'Europe',
      edition: 'Standard',
      finalPrice: 44.25,
      currency: 'EUR',
      priceChf: 42.10,
      affiliateUrl: 'https://www.eneba.com/origin-ea-sports-fc-25-pc-key-europe?af_id=KeyHero',
      lastCheckedAt: new Date(),
      url: 'https://www.eneba.com/origin-ea-sports-fc-25-pc-key-europe'
    }
  })

  // GTA 5 bei MMOGA
  await prisma.offer.create({
    data: {
      gameId: gta5.id,
      storeId: mmoga.id,
      platform: 'Rockstar Social Club',
      region: 'Global',
      finalPrice: 14.99,
      currency: 'EUR',
      affiliateUrl: 'https://www.mmoga.de/Steam-Games/GTA-5-Grand-Theft-Auto-V.html?ref=KeyHero',
      lastCheckedAt: new Date()
    }
  })

  console.log('✅ Seeding erfolgreich beendet!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })