const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.platformCredential.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platform.deleteMany();

  // Create platforms
  const platforms = await Promise.all([
    prisma.platform.create({
      data: {
        name: 'netflix',
        displayName: 'Netflix',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Netflix_logo.svg',
        baseUrl: 'https://www.netflix.com',
        isActive: true,
      },
    }),
    prisma.platform.create({
      data: {
        name: 'disneyplus',
        displayName: 'Disney+',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
        baseUrl: 'https://www.disneyplus.com',
        isActive: true,
      },
    }),
    prisma.platform.create({
      data: {
        name: 'amazonprime',
        displayName: 'Prime Video',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
        baseUrl: 'https://www.primevideo.com',
        isActive: true,
      },
    }),
    prisma.platform.create({
      data: {
        name: 'hbo',
        displayName: 'HBO Max',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/HBO_logo.svg',
        baseUrl: 'https://www.hbomax.com',
        isActive: true,
      },
    }),
    prisma.platform.create({
      data: {
        name: 'apple',
        displayName: 'Apple TV+',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV%2B_logo.svg',
        baseUrl: 'https://www.apple.com/tv',
        isActive: true,
      },
    }),
    prisma.platform.create({
      data: {
        name: 'canalplus',
        displayName: 'Canal+',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Canal%2B_logo.svg',
        baseUrl: 'https://www.canalplus.com',
        isActive: true,
      },
    }),
    prisma.platform.create({
      data: {
        name: 'salto',
        displayName: 'Salto',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Salto_logo.svg',
        baseUrl: 'https://www.salto.fr',
        isActive: true,
      },
    }),
    prisma.platform.create({
      data: {
        name: 'mycanal',
        displayName: 'myCanal',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Canal%2B_logo.svg',
        baseUrl: 'https://www.mycanal.fr',
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${platforms.length} platforms`);

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@streammanage.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log(`Created demo user: ${demoUser.email}`);

  // Create credentials and subscriptions for demo user
  await prisma.platformCredential.create({
    data: {
      userId: demoUser.id,
      platformId: platforms[0].id,
      username: 'demo@email.com',
      password: await bcrypt.hash('demopassword', 10),
      isConnected: true,
      lastSync: new Date(),
    },
  });

  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      platformId: platforms[0].id,
      status: 'ACTIVE',
      startDate: new Date(),
      price: 11.99,
      currency: 'EUR',
      autoRenew: true,
    },
  });

  await prisma.platformCredential.create({
    data: {
      userId: demoUser.id,
      platformId: platforms[1].id,
      username: 'demo@email.com',
      password: await bcrypt.hash('demopassword', 10),
      isConnected: true,
      lastSync: new Date(),
    },
  });

  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      platformId: platforms[1].id,
      status: 'ACTIVE',
      startDate: new Date(),
      price: 8.99,
      currency: 'EUR',
      autoRenew: true,
    },
  });

  // Create another user with different subscriptions
  const hashedPassword2 = await bcrypt.hash('password123', 10);
  
  const user2 = await prisma.user.create({
    data: {
      email: 'user2@streammanage.com',
      password: hashedPassword2,
      name: 'Test User 2',
    },
  });

  await prisma.platformCredential.create({
    data: {
      userId: user2.id,
      platformId: platforms[2].id,
      username: 'test@email.com',
      password: await bcrypt.hash('testpassword', 10),
      isConnected: true,
      lastSync: new Date(),
    },
  });

  await prisma.subscription.create({
    data: {
      userId: user2.id,
      platformId: platforms[2].id,
      status: 'CANCELLED',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(),
      price: 5.99,
      currency: 'EUR',
      autoRenew: false,
    },
  });

  console.log(`Created ${platforms.length} platforms, 2 users with sample data`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
