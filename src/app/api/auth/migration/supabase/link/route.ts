import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/validation";
import { validateCsrf } from "@/lib/csrf";
import { requireRateLimit } from "@/lib/rate-limit";
import {
  isSupabaseAuthMigrationEnabled,
  verifySupabaseAccessToken,
} from "@/lib/supabase-auth";

const bodySchema = z.object({
  accessToken: z.string().min(20),
});

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase();

export async function POST(request: Request) {
  if (!isSupabaseAuthMigrationEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "auth:migration:supabase:link",
    limit: 10,
    window: "1 h",
  });
  if (rateLimit) return rateLimit;

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const parsed = await parseJson(request, bodySchema);
  if (parsed.error) return parsed.error;

  const verification = await verifySupabaseAccessToken(parsed.data.accessToken);
  if (verification.error || !verification.user?.id) {
    return NextResponse.json(
      { error: verification.error || "Invalid Supabase token" },
      { status: 401 }
    );
  }

  const supabaseUser = verification.user;
  const supabaseEmail = normalizeEmail(supabaseUser.email);
  if (!supabaseEmail) {
    return NextResponse.json(
      { error: "Supabase account has no email" },
      { status: 400 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      authProvider: true,
      supabaseAuthId: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (normalizeEmail(dbUser.email) !== supabaseEmail) {
    return NextResponse.json(
      {
        error:
          "Email mismatch. Login with the same email on both current auth and Supabase.",
      },
      { status: 409 }
    );
  }

  const owner = await prisma.user.findUnique({
    where: { supabaseAuthId: supabaseUser.id },
    select: { id: true },
  });

  if (owner && owner.id !== dbUser.id) {
    return NextResponse.json(
      { error: "This Supabase account is already linked to another user." },
      { status: 409 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      supabaseAuthId: supabaseUser.id,
      supabaseLinkedAt: new Date(),
      authProvider: dbUser.authProvider === "NEXTAUTH" ? "HYBRID" : dbUser.authProvider,
      emailVerified:
        dbUser.emailVerified ||
        (supabaseUser.email_confirmed_at
          ? new Date(supabaseUser.email_confirmed_at)
          : dbUser.emailVerified),
    },
    select: {
      id: true,
      email: true,
      authProvider: true,
      supabaseAuthId: true,
      supabaseLinkedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    user: updatedUser,
    message: "Supabase account linked successfully",
  });
}
