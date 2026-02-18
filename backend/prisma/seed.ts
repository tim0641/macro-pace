import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      profile: {
        create: {
          weightKg: 75.0,
        },
      },
    },
  });

  console.log('✅ User créé:', user.email);

  // Créer quelques aliments de base
  const foods = [
    {
      name: 'Poulet grillé',
      brand: null,
      kcal100g: 165,
      protein100g: 31,
      carbs100g: 0,
      fat100g: 3.6,
    },
    {
      name: 'Riz blanc cuit',
      brand: null,
      kcal100g: 130,
      protein100g: 2.7,
      carbs100g: 28,
      fat100g: 0.3,
    },
    {
      name: 'Brocoli cuit',
      brand: null,
      kcal100g: 35,
      protein100g: 2.8,
      carbs100g: 7,
      fat100g: 0.4,
    },
    {
      name: 'Banane',
      brand: null,
      kcal100g: 89,
      protein100g: 1.1,
      carbs100g: 23,
      fat100g: 0.3,
    },
    {
      name: 'Œuf entier',
      brand: null,
      kcal100g: 155,
      protein100g: 13,
      carbs100g: 1.1,
      fat100g: 11,
    },
  ];

  for (const food of foods) {
    const existing = await prisma.food.findFirst({
      where: { name: food.name },
    });
    if (!existing) {
      await prisma.food.create({ data: food });
    }
  }

  console.log(`✅ ${foods.length} aliments créés`);

  console.log('🎉 Seeding terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
