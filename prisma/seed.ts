import { db } from '../src/lib/db'

async function seed() {
  // Seed products
  const products = [
    {
      name: 'Ayam Geprek Sambal Ijo Original',
      description: 'Ayam geprek dengan sambal ijo khas Aceh yang segar dan pedas. Dibuat dari ayam pilihan yang digoreng renyah kemudian digeprek dan disiram sambal ijo homemade. Rasa gurih dan pedas yang pas membuat menu ini menjadi favorit pelanggan kami.',
      price: 18000,
      image: '/images/products/geprek-original.png',
      category: 'Makanan',
      available: true,
    },
    {
      name: 'Ayam Geprek Sambal Ijo Extra Pedas',
      description: 'Versi lebih pedas dari menu favorit kami! Ayam geprek dengan double sambal ijo dan taburan cabai rawit segar. Cocok untuk pecinta kuliner pedas yang ingin merasakan sensasi pedas yang menggugah selera dengan cita rasa khas Aceh.',
      price: 20000,
      image: '/images/products/geprek-pedas.png',
      category: 'Makanan',
      available: true,
    },
    {
      name: 'Ayam Geprek Sambal Ijo Keju',
      description: 'Perpaduan sempurna antara ayam geprek sambal ijo dengan lelehan keju yang menggoda. Keju yang meleleh di atas ayam geprek memberikan rasa gurih dan creamy yang berpadu harmonis dengan pedasnya sambal ijo khas Aceh.',
      price: 22000,
      image: '/images/products/geprek-keju.png',
      category: 'Makanan',
      available: true,
    },
    {
      name: 'Ayam Geprek Sambal Ijo Mozarella',
      description: 'Menu premium dengan keju mozarella yang bisa di-pull membuat pengalaman makan semakin seru. Ayam geprek renyah disiram sambal ijo dan ditaburi keju mozarella leleh. Pilihan tepat untuk pecinta keju sejati.',
      price: 25000,
      image: '/images/products/geprek-mozarella.png',
      category: 'Makanan',
      available: true,
    },
    {
      name: 'Nasi Ayam Geprek Komplit',
      description: 'Paket lengkap nasi ayam geprek sambal ijo dengan lauk pendamping. Tersedia nasi putih hangat, ayam geprek sambal ijo, tumis kangkung, lalapan segar, dan sambal tambahan. Menu paling laris yang mengenyangkan dan cocok untuk makan siang maupun makan malam.',
      price: 28000,
      image: '/images/products/nasi-komplit.png',
      category: 'Paket',
      available: true,
    },
    {
      name: 'Ayam Geprek Sambal Ijo + Telur',
      description: 'Kombinasi ayam geprek sambal ijo dengan telur dadar goreng yang empuk dan gurih. Menu ini menawarkan tambahan protein yang sempurna untuk mengawali aktivitas harian Anda. Rasa sambal ijo yang khas semakin nikmat dipadukan dengan telur.',
      price: 22000,
      image: '/images/products/geprek-telur.png',
      category: 'Makanan',
      available: true,
    },
    {
      name: 'Es Teh Manis',
      description: 'Minuman segar berupa teh manis dingin yang sempurna menemani hidangan ayam geprek Anda. Dibuat dari teh pilihan dengan takaran gula yang pas, disajikan dengan es batu segar. Menjadi pelengkap ideal untuk menyeimbangkan pedasnya sambal ijo.',
      price: 5000,
      image: '/images/products/es-teh.png',
      category: 'Minuman',
      available: true,
    },
    {
      name: 'Es Jeruk Segar',
      description: 'Jus jeruk segar yang diperas langsung dari buah jeruk pilihan. Disajikan dingin dengan es batu dan sedikit gula alami. Kaya vitamin C dan sangat menyegarkan terutama setelah menikmati hidangan pedas ayam geprek sambal ijo kami.',
      price: 7000,
      image: '/images/products/es-jeruk.png',
      category: 'Minuman',
      available: true,
    },
  ]

  for (const product of products) {
    await db.product.create({ data: product })
    console.log(`✓ Seeded: ${product.name}`)
  }

  // Seed admin user
  const adminExists = await db.user.findUnique({ where: { email: 'admin@geprek.com' } })
  if (!adminExists) {
    await db.user.create({
      data: {
        name: 'Admin Geprek',
        email: 'admin@geprek.com',
        password: 'admin123',
        phone: '081234567890',
        role: 'admin',
      },
    })
    console.log('✓ Seeded: Admin user')
  }

  console.log('\n✅ Seeding completed!')
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0))