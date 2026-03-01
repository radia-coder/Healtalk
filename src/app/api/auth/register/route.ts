import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildIdentifier, createToken, hashToken } from "@/lib/tokens";
import { z } from "zod";
import { parseJson } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { createAuditLog } from "@/lib/audit";
import {
  createSupabaseUserForMigration,
  isSupabaseAuthMigrationEnabled,
  signInSupabaseWithPassword,
  verifySupabaseAccessToken,
} from "@/lib/supabase-auth";

const registerSchema = z
  .object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional().nullable(),
    password: z.string().min(8),
    role: z.enum(["PATIENT", "PSYCHOLOGIST"]).optional(),
    credentials: z.string().optional(),
    licenseNumber: z.string().optional(),
    experience: z.coerce.number().int().min(0).optional(),
    bio: z.string().optional(),
    specializations: z.array(z.string()).optional(),
    price60: z.coerce.number().int().positive().optional(),
    price90: z.coerce.number().int().positive().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.role !== "PSYCHOLOGIST") return;

    if (!value.credentials?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["credentials"], message: "Credentials are required." });
    }
    if (!value.licenseNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["licenseNumber"], message: "License number is required." });
    }
    if (!value.bio?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bio"], message: "Bio is required." });
    }
    if (!value.specializations || value.specializations.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["specializations"], message: "Specializations are required." });
    }
    if (!Number.isFinite(value.experience)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["experience"], message: "Experience is required." });
    }
    if (!Number.isFinite(value.price60) || !Number.isFinite(value.price90)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["price60"], message: "Session prices are required." });
    }
  });

export async function POST(request: Request) {
  try {
    const rateLimit = await requireRateLimit({
      request,
      key: "auth:register",
      limit: 5,
      window: "10 m",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { data, error } = await parseJson(request, registerSchema);
    if (error) return error;

    const fullName = data.fullName.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone?.trim() || undefined;
    const password = data.password;
    const role = data.role === "PSYCHOLOGIST" ? "PSYCHOLOGIST" : "PATIENT";
    const credentials = data.credentials?.trim();
    const licenseNumber = data.licenseNumber?.trim();
    const experience = data.experience;
    const bio = data.bio?.trim();
    const specializations = Array.isArray(data.specializations)
      ? data.specializations.map((item) => item.trim()).filter(Boolean)
      : [];
    const price60 = data.price60;
    const price90 = data.price90;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    if (role === "PSYCHOLOGIST" && licenseNumber) {
      const existingLicense = await prisma.psychologist.findUnique({
        where: { licenseNumber },
        select: { id: true },
      });

      if (existingLicense) {
        return NextResponse.json(
          { error: "A psychologist with that license number already exists." },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        phone: phone || null,
        password: hashedPassword,
        role,
        patient: role === "PATIENT" ? { create: {} } : undefined,
        psychologist:
          role === "PSYCHOLOGIST"
            ? {
                create: {
                  credentials: credentials as string,
                  licenseNumber: licenseNumber as string,
                  experience: experience as number,
                  bio: bio as string,
                  specializations,
                  price60: price60 as number,
                  price90: price90 as number,
                },
              }
            : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (isSupabaseAuthMigrationEnabled()) {
      let supabaseAuthId: string | null = null;
      let syncError: string | null = null;

      const createResult = await createSupabaseUserForMigration({
        email,
        password,
        emailConfirmed: false,
      });

      if (createResult.userId) {
        supabaseAuthId = createResult.userId;
      } else {
        syncError = createResult.error;
        const signInResult = await signInSupabaseWithPassword(email, password);
        if (signInResult.accessToken) {
          const verification = await verifySupabaseAccessToken(
            signInResult.accessToken
          );
          supabaseAuthId = verification.user?.id || null;
          if (!supabaseAuthId && verification.error) {
            syncError = verification.error;
          }
        } else if (signInResult.error) {
          syncError = signInResult.error;
        }
      }

      if (supabaseAuthId) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            supabaseAuthId,
            supabaseLinkedAt: new Date(),
            authProvider: "HYBRID",
          },
        });
      } else if (syncError) {
        console.warn("Supabase auth sync skipped:", syncError);
      }
    }

    await createAuditLog({
      actorId: user.id,
      action: "AUTH_REGISTER",
      targetType: "User",
      targetId: user.id,
      metadata: { role: user.role },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const rawToken = createToken("verify");
    const hashedToken = hashToken(rawToken);
    const identifier = buildIdentifier(email, "verify");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: hashedToken,
        expires,
      },
    });

    const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(
      rawToken
    )}`;

    try {
      await sendEmail({
        to: email,
        subject: "Verify your HealTalk email",
        text: `Welcome to HealTalk! Verify your email: ${verifyUrl}`,
        html: `
          <p>Welcome to HealTalk!</p>
          <p>Please verify your email to activate your account:</p>
          <p><a href="${verifyUrl}">Verify my email</a></p>
          <p>If you did not create this account, you can ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Verification email error:", emailError);
    }

    return NextResponse.json(
      {
        ...user,
        verificationRequired: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }
}
