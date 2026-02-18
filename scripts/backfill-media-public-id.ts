import { PrismaClient } from '@prisma/client';

function createPrismaAdapter() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const { PrismaPg } = require('@prisma/adapter-pg');
  return new PrismaPg({ connectionString: databaseUrl });
}

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

function extractPublicId(url: string): string | null {
  const cleanUrl = url.split('?')[0];
  const marker = '/upload/';
  const index = cleanUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }

  const afterUpload = cleanUrl.slice(index + marker.length);
  const segments = afterUpload.split('/');

  if (segments[0]?.startsWith('v') && /^\d+$/.test(segments[0].slice(1))) {
    segments.shift();
  }

  const path = segments.join('/');
  if (!path) {
    return null;
  }

  return path.replace(/\.[^.]+$/, '');
}

async function main() {
  const mediaList = await prisma.productMedia.findMany({
    where: {
      OR: [{ publicId: '' }],
    },
    select: {
      id: true,
      url: true,
    },
  });

  if (!mediaList.length) {
    console.log('No media rows need backfill.');
    return;
  }

  let updated = 0;
  for (const media of mediaList) {
    const publicId = extractPublicId(media.url);
    if (!publicId) {
      console.warn(`Could not parse publicId for ${media.id}`);
      continue;
    }

    await prisma.productMedia.update({
      where: { id: media.id },
      data: { publicId },
    });
    updated += 1;
  }

  console.log(`Backfill complete. Updated ${updated} records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
