import { prisma } from "../../src/lib/prisma";

async function main() {
  const [totalUsers, linkedUsers, nextAuthOnly, supabaseOnly, hybridUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { supabaseAuthId: { not: null } } }),
      prisma.user.count({ where: { authProvider: "NEXTAUTH" } }),
      prisma.user.count({ where: { authProvider: "SUPABASE" } }),
      prisma.user.count({ where: { authProvider: "HYBRID" } }),
    ]);

  console.log("Supabase Auth Migration Status");
  console.log("--------------------------------");
  console.log(`Total users: ${totalUsers}`);
  console.log(`Linked to Supabase: ${linkedUsers}`);
  console.log(`Not linked: ${Math.max(totalUsers - linkedUsers, 0)}`);
  console.log("");
  console.log("Auth provider split:");
  console.log(`- NEXTAUTH: ${nextAuthOnly}`);
  console.log(`- SUPABASE: ${supabaseOnly}`);
  console.log(`- HYBRID: ${hybridUsers}`);
}

main()
  .catch((error) => {
    console.error("Failed to read migration status:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
