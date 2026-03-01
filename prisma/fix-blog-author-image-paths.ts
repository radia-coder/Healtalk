import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IMAGE_FIXES: Record<string, string> = {
  '/images/ciro.png': '/images/Ciro.png',
  '/images/koonfur.png': '/images/Koonfur.png',
};

async function fixBlogAuthorImagePaths() {
  console.log('Fixing blog author image paths...\n');

  let updated = 0;
  for (const [from, to] of Object.entries(IMAGE_FIXES)) {
    const result = await prisma.blogAuthor.updateMany({
      where: { imageUrl: from },
      data: { imageUrl: to },
    });
    updated += result.count;
    console.log(`  ${from} -> ${to}: ${result.count} row(s)`);
  }

  console.log(`\nDone. Updated ${updated} blog author row(s).`);
}

fixBlogAuthorImagePaths()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
