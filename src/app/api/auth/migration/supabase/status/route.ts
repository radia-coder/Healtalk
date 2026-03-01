import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSupabaseAuthMigrationEnabled } from "@/lib/supabase-auth";
import { getAuthCutoverMode } from "@/lib/auth-cutover";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      authProvider: true,
      supabaseAuthId: true,
      supabaseLinkedAt: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    migrationEnabled: isSupabaseAuthMigrationEnabled(),
    cutoverMode: getAuthCutoverMode(),
    linked: Boolean(user.supabaseAuthId),
    user,
  });
}
