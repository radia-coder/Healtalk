const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const [rawKey, ...rest] = line.split('=');
    const key = rawKey.trim();
    if (process.env[key]) continue;
    let value = rest.join('=').trim();
    value = value.replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  }
}

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres@localhost:5432/psyconnect?schema=public';
process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient();

async function main() {
  const entries = [];
  for (let i = 1; i <= 10; i += 1) {
    const email = process.env[`PSYCHOLOGIST_${i}_EMAIL`];
    const password = process.env[`PSYCHOLOGIST_${i}_PASSWORD`];
    if (!email || !password) {
      console.warn(`Skipping PSYCHOLOGIST_${i}: missing email or password`);
      continue;
    }
    entries.push({ index: i, email: email.trim().toLowerCase(), password });
  }

  if (entries.length === 0) {
    throw new Error('No psychologist credentials found in .env');
  }

  for (const entry of entries) {
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: entry.email, mode: 'insensitive' },
      },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user) {
      console.warn(`No user found for ${entry.email} (index ${entry.index})`);
      continue;
    }

    const hashed = await bcrypt.hash(entry.password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        role: 'PSYCHOLOGIST',
        emailVerified: user.emailVerified ?? new Date(),
      },
    });

    console.log(`Updated password for ${user.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
