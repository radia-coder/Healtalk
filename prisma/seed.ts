import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { hospitalSeedData } from './seeds/hospitals';
import { psychologistSeedData } from './seeds/psychologists';
import { blogAuthorSeedData, blogPostSeedData } from './seeds/blog';
import { guideSeedData } from './seeds/guides';
import { podcastSeedData } from './seeds/podcasts';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/psyconnect?schema=public';
process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient();

interface BlogContentItem {
  type: string;
  value: string | string[];
}

async function main() {
  console.log('Seeding database...');

  const normalizeEmail = (email: string) => email.trim().toLowerCase();
  const psychPlain = process.env.PSYCHOLOGIST_PASSWORD || "password123";
  const patientPlain = process.env.PATIENT_PASSWORD || "password123";
  const adminPlain = process.env.ADMIN_PASSWORD || "password123";
  const psychEmail = normalizeEmail(
    process.env.PSYCHOLOGIST_EMAIL || "ahmet@example.com"
  );
  const patientEmail = normalizeEmail(
    process.env.PATIENT_EMAIL || "john@example.com"
  );
  const adminEmail = normalizeEmail(
    process.env.ADMIN_EMAIL || "admin@example.com"
  );

  // Seed hospitals
  console.log('\nSeeding hospitals...');
  const hospitalMap = new Map<string, string>();

  for (const h of hospitalSeedData) {
    // Check if hospital already exists
    let hospital = await prisma.hospital.findFirst({
      where: { name: h.name }
    });

    if (!hospital) {
      hospital = await prisma.hospital.create({
        data: {
          name: h.name,
          location: h.location,
          address: h.address,
          status: h.status
        }
      });
      console.log(`  ✓ ${h.name}`);
    } else {
      console.log(`  ⊘ ${h.name} (already exists)`);
    }

    hospitalMap.set(h.name, hospital.id);
  }
  console.log(`Total hospitals: ${hospitalMap.size}`);

  // Create bootstrap psychologist user
  console.log('\nSeeding bootstrap users...');
  const acibademHospital = await prisma.hospital.findFirst({
    where: { name: 'Acıbadem Hospital' }
  });

  const existingPsych = await prisma.user.findUnique({ where: { email: psychEmail } });
  if (!existingPsych) {
    const psychHashedPassword = await bcrypt.hash(psychPlain, 10);
    await prisma.user.create({
      data: {
        name: 'Dr. Ahmet Yılmaz',
        email: psychEmail,
        password: psychHashedPassword,
        role: 'PSYCHOLOGIST',
        emailVerified: new Date(),
        psychologist: {
          create: {
            credentials: 'PhD, Clinical Psychologist',
            licenseNumber: 'PSY-12345-TR',
            experience: 12,
            bio: 'Licensed clinical psychologist with over 12 years of experience in treating anxiety disorders, depression, and trauma.',
            specializations: ['Anxiety Disorders', 'Depression', 'Trauma & PTSD'],
            price60: 45000, // $450 in cents
            price90: 65000, // $650 in cents
            rating: 4.8,
            reviewCount: 120,
            status: 'APPROVED',
            approvedAt: new Date(),
            hospitalId: acibademHospital?.id,
          },
        },
      },
    });
    console.log('  ✓ Bootstrap psychologist created');
  } else {
    console.log('  ⊘ Bootstrap psychologist already exists');
  }

  // Create patient user
  const existingPatient = await prisma.user.findUnique({ where: { email: patientEmail } });
  if (!existingPatient) {
    const patientHashedPassword = await bcrypt.hash(patientPlain, 10);
    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: patientEmail,
        password: patientHashedPassword,
        role: 'PATIENT',
        emailVerified: new Date(),
        patient: {
          create: {},
        },
      },
    });
    console.log('  ✓ Bootstrap patient created');
  } else {
    console.log('  ⊘ Bootstrap patient already exists');
  }

  // Create admin user
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const adminHashedPassword = await bcrypt.hash(adminPlain, 10);
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: adminHashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
        admin: {
          create: {},
        },
      },
    });
    console.log('  ✓ Bootstrap admin created');
  } else {
    console.log('  ⊘ Bootstrap admin already exists');
  }

  // Seed psychologists
  console.log('\nSeeding psychologists...');
  let seededCount = 0;

  for (const p of psychologistSeedData) {
    try {
      const hospitalId = hospitalMap.get(p.hospitalName);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: p.user.email }
      });

      if (existingUser) {
        console.log(`  ⊘ ${p.user.name} (email already exists)`);
        continue;
      }

      await prisma.user.create({
        data: {
          name: p.user.name,
          email: p.user.email,
          role: 'PSYCHOLOGIST',
          emailVerified: new Date(),
          psychologist: {
            create: {
              credentials: p.credentials,
              licenseNumber: p.licenseNumber,
              experience: p.experience,
              bio: p.bio,
              specializations: p.specializations,
              price60: p.price60,
              price90: p.price90,
              rating: p.rating,
              reviewCount: p.reviewCount,
              status: p.status,
              approvedAt: new Date(),
              hospitalId: hospitalId || null
            }
          }
        }
      });
      seededCount++;
      console.log(`  ✓ ${p.user.name}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.log(`  ✗ ${p.user.name}: ${message}`);
    }
  }
  console.log(`Total psychologists seeded: ${seededCount}`);

  // Seed blog authors
  console.log('\nSeeding blog authors...');
  const authorMap = new Map();
  for (const a of blogAuthorSeedData) {
    const author = await prisma.blogAuthor.upsert({
      where: { name: a.name },
      update: {
        role: a.role,
        bio: a.bio,
        imageUrl: a.imageUrl,
        linkedinUrl: a.linkedinUrl,
        socialLabel: a.socialLabel ?? null,
      },
      create: a
    });
    authorMap.set(a.name, author.id);
    console.log(`  ✓ ${a.name}`);
  }

  // Seed blog posts
  console.log('\nSeeding blog posts...');
  for (const post of blogPostSeedData) {
    const authorId = authorMap.get(post.authorName);

    await prisma.blogPost.create({
      data: {
        title: post.title,
        subtitle: post.subtitle,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        category: post.category,
        date: post.date,
        heroType: post.heroType,
        heroIllustration: post.heroIllustration,
        theme: post.theme,
        published: post.published,
        authorId: authorId,
        content: {
          create: (post.content as BlogContentItem[]).map((item, index: number) => ({
            order: index,
            type: item.type,
            value: Array.isArray(item.value) ? JSON.stringify(item.value) : item.value
          }))
        }
      }
    });
    console.log(`  ✓ ${post.title}`);
  }

  // Seed guides
  console.log('\nSeeding guides...');
  for (const guide of guideSeedData) {
    await prisma.guide.upsert({
      where: { href: guide.href },
      update: {},
      create: guide
    });
    console.log(`  ✓ ${guide.title}`);
  }

  // Seed podcast episodes
  console.log('\nSeeding podcast episodes...');
  for (const episode of podcastSeedData) {
    await prisma.podcastEpisode.create({
      data: episode
    });
    console.log(`  ✓ Episode ${episode.episodeNumber}: ${episode.title}`);
  }

  console.log('\n✓ Database seeded successfully!');
  console.log({
    hospitals: hospitalMap.size,
    psychologists: seededCount,
    blogAuthors: authorMap.size,
    blogPosts: blogPostSeedData.length,
    guides: guideSeedData.length,
    podcasts: podcastSeedData.length,
    bootstrapUsers: {
      psychologist: { email: psychEmail, password: psychPlain },
      patient: { email: patientEmail, password: patientPlain },
      admin: { email: adminEmail, password: adminPlain },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
