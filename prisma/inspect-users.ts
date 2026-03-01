import { PrismaClient } from "@prisma/client";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres@localhost:5432/psyconnect?schema=public";
process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      password: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!users.length) {
    console.log("No users found.");
    return;
  }

  console.log(
    users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: Boolean(user.password),
      createdAt: user.createdAt.toISOString(),
    }))
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
