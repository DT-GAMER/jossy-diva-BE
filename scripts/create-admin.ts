import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

process.loadEnvFile?.();

function createPrismaAdapter() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  try {
    const { PrismaPg } = require('@prisma/adapter-pg');
    return new PrismaPg({ connectionString: databaseUrl });
  } catch {
    throw new Error(
      'Missing Prisma Postgres adapter. Install with: pnpm add @prisma/adapter-pg pg',
    );
  }
}

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

async function main() {
  const passwordHash = await bcrypt.hash('admin666612', 15);

  await prisma.user.upsert({
    where: { email: 'admin@jossydiva.com' },
    update: {},
    create: {
      name: 'Jossy Diva',
      email: 'admin@jossydiva.com',
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log('Admin user created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
