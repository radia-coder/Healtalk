import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres@localhost:5432/psyconnect?schema=public";
process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient();

async function hashOrSkip(plain: string | undefined) {
  if (!plain) return null;
  return bcrypt.hash(plain, 10);
}

async function updateUser({
  label,
  currentEmail,
  desiredEmail,
  passwordHash,
}: {
  label: string;
  currentEmail: string;
  desiredEmail: string;
  passwordHash: string | null;
}) {
  if (!passwordHash && currentEmail === desiredEmail) {
    return;
  }

  const emailCandidates = Array.from(
    new Set([currentEmail, desiredEmail].filter(Boolean))
  );

  const user = await prisma.user.findFirst({
    where: {
      OR: emailCandidates.map((email) => ({
        email: { equals: email, mode: "insensitive" },
      })),
    },
  });

  if (!user) {
    throw new Error(
      `${label} user not found. Set CURRENT_${label}_EMAIL to the existing email in the database.`
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(passwordHash ? { password: passwordHash } : {}),
      ...(desiredEmail && desiredEmail !== user.email
        ? { email: desiredEmail }
        : {}),
    },
  });
}

async function main() {
  const normalizeEmail = (email: string) => email.trim().toLowerCase();
  const psychPlain = process.env.PSYCHOLOGIST_PASSWORD;
  const patientPlain = process.env.PATIENT_PASSWORD;
  const adminPlain = process.env.ADMIN_PASSWORD;

  const hasAnyPassword = Boolean(psychPlain || patientPlain || adminPlain);
  const hasAnyEmail = Boolean(
    process.env.PSYCHOLOGIST_EMAIL ||
      process.env.PATIENT_EMAIL ||
      process.env.ADMIN_EMAIL
  );

  if (!hasAnyPassword && !hasAnyEmail) {
    throw new Error(
      "Set at least one of PSYCHOLOGIST_PASSWORD, PATIENT_PASSWORD, ADMIN_PASSWORD or PSYCHOLOGIST_EMAIL, PATIENT_EMAIL, ADMIN_EMAIL in .env"
    );
  }

  const [psychHash, patientHash, adminHash] = await Promise.all([
    hashOrSkip(psychPlain),
    hashOrSkip(patientPlain),
    hashOrSkip(adminPlain),
  ]);

  const psychCurrentEmail = normalizeEmail(
    process.env.CURRENT_PSYCHOLOGIST_EMAIL || "ahmet@example.com"
  );
  const patientCurrentEmail = normalizeEmail(
    process.env.CURRENT_PATIENT_EMAIL || "john@example.com"
  );
  const adminCurrentEmail = normalizeEmail(
    process.env.CURRENT_ADMIN_EMAIL || "admin@example.com"
  );

  const psychDesiredEmail = normalizeEmail(
    process.env.PSYCHOLOGIST_EMAIL || psychCurrentEmail
  );
  const patientDesiredEmail = normalizeEmail(
    process.env.PATIENT_EMAIL || patientCurrentEmail
  );
  const adminDesiredEmail = normalizeEmail(
    process.env.ADMIN_EMAIL || adminCurrentEmail
  );

  await updateUser({
    label: "PSYCHOLOGIST",
    currentEmail: psychCurrentEmail,
    desiredEmail: psychDesiredEmail,
    passwordHash: psychHash,
  });

  await updateUser({
    label: "PATIENT",
    currentEmail: patientCurrentEmail,
    desiredEmail: patientDesiredEmail,
    passwordHash: patientHash,
  });

  await updateUser({
    label: "ADMIN",
    currentEmail: adminCurrentEmail,
    desiredEmail: adminDesiredEmail,
    passwordHash: adminHash,
  });

  console.log("Credentials update complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
