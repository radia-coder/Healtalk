import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImages() {
  const psychs = await prisma.user.findMany({
    where: { role: 'PSYCHOLOGIST' },
    select: { name: true, image: true },
    take: 10
  });

  console.log('\nSample psychologist images:');
  psychs.forEach(p => {
    console.log(`  ${p.name}: ${p.image || 'NO IMAGE'}`);
  });

  const total = await prisma.user.count({ where: { role: 'PSYCHOLOGIST' }});
  const withImages = await prisma.user.count({
    where: { role: 'PSYCHOLOGIST', image: { not: null } }
  });

  console.log(`\n✓ Total: ${total} psychologists`);
  console.log(`✓ With images: ${withImages}`);
  console.log(`✗ Without images: ${total - withImages}\n`);
}

checkImages()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
