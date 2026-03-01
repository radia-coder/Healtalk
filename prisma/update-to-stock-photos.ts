import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Professional diverse headshots from Unsplash
const STOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&q=80', // Professional woman
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&q=80', // Professional man
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&q=80', // Professional woman 2
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&q=80', // Professional woman 3
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80', // Professional man 2
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80', // Professional woman 4
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&q=80', // Professional man 3
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80', // Professional woman 5
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80', // Professional man 4
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80', // Professional woman 6
  'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop&q=80', // Professional woman 7
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80', // Professional man 5
  'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=400&fit=crop&q=80', // Professional man 6
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80', // Professional woman 8
  'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop&q=80', // Professional man 7
  'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop&q=80', // Professional man 8
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&q=80', // Professional woman 9
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&q=80', // Professional woman 10
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80', // Professional man 9
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&q=80', // Professional man 10
  'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=400&h=400&fit=crop&q=80', // Professional woman 11
  'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=400&h=400&fit=crop&q=80', // Professional man 11
  'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400&h=400&fit=crop&q=80', // Professional woman 12
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80', // Professional man 12
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80', // Professional woman 13
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&q=80', // Professional man 13
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&q=80', // Professional woman 14
  'https://images.unsplash.com/photo-1542190891-2093d38760f2?w=400&h=400&fit=crop&q=80', // Professional man 14
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&q=80', // Professional woman 15
  'https://images.unsplash.com/photo-1563237023-b1e970526dcb?w=400&h=400&fit=crop&q=80', // Professional man 15
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&q=80', // Professional woman 16
  'https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=400&h=400&fit=crop&q=80', // Professional man 16
  'https://images.unsplash.com/photo-1546672741-d327539d5f13?w=400&h=400&fit=crop&q=80', // Professional woman 17
  'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=400&h=400&fit=crop&q=80', // Professional man 17
  'https://images.unsplash.com/photo-1521252659862-eec69941b071?w=400&h=400&fit=crop&q=80', // Professional woman 18
  'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=400&fit=crop&q=80', // Professional man 18
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&q=80', // Professional woman 19
  'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=400&h=400&fit=crop&q=80', // Professional man 19
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&q=80', // Professional woman 20
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&q=80', // Professional man 20
];

async function updateToStockPhotos() {
  console.log('Updating psychologist photos to stock images...\n');

  const psychologists = await prisma.user.findMany({
    where: { role: 'PSYCHOLOGIST' },
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${psychologists.length} psychologists\n`);

  for (let i = 0; i < psychologists.length; i++) {
    const psych = psychologists[i];
    const photoUrl = STOCK_PHOTOS[i % STOCK_PHOTOS.length];

    await prisma.user.update({
      where: { id: psych.id },
      data: { image: photoUrl }
    });

    console.log(`  ✓ ${psych.name} → Stock photo ${i + 1}`);
  }

  console.log(`\n✓ Updated ${psychologists.length} psychologist photos!`);
  console.log('Refresh your browser to see the new photos.');
}

updateToStockPhotos()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
