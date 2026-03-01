import { prisma } from "../../src/lib/prisma";

const readArg = (name: string) => {
  const match = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1).trim() : "";
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

async function main() {
  const emailArg = readArg("--email");
  const supabaseId = readArg("--supabase-id");

  if (!emailArg || !supabaseId) {
    console.error(
      "Usage: npm run supabase:migration:link-user -- --email=user@example.com --supabase-id=<uuid>"
    );
    process.exit(1);
  }

  const email = normalizeEmail(emailArg);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, authProvider: true, supabaseAuthId: true },
  });

  if (!user) {
    console.error(`User not found for email: ${email}`);
    process.exit(1);
  }

  const existingOwner = await prisma.user.findUnique({
    where: { supabaseAuthId: supabaseId },
    select: { id: true, email: true },
  });

  if (existingOwner && existingOwner.id !== user.id) {
    console.error(
      `Supabase ID already linked to another user: ${existingOwner.email}`
    );
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      supabaseAuthId: supabaseId,
      supabaseLinkedAt: new Date(),
      authProvider: user.authProvider === "NEXTAUTH" ? "HYBRID" : user.authProvider,
    },
    select: {
      id: true,
      email: true,
      authProvider: true,
      supabaseAuthId: true,
      supabaseLinkedAt: true,
    },
  });

  console.log("Linked user successfully:");
  console.log(updated);
}

main()
  .catch((error) => {
    console.error("Failed to link user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
