import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildIdentifier, createToken, hashToken } from "@/lib/tokens";
import { z } from "zod";
import { parseJson } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { createAuditLog } from "@/lib/audit";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const rateLimit = await requireRateLimit({
      request: req,
      key: "auth:forgot",
      limit: 5,
      window: "10 m",
    });
    if (rateLimit) return rateLimit;

    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;

    const { data, error } = await parseJson(req, forgotPasswordSchema);
    if (error) return error;

    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return ok to prevent user enumeration
    if (!user) {
         return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
    }

    await createAuditLog({
      actorId: user.id,
      action: "AUTH_PASSWORD_RESET_REQUEST",
      targetType: "User",
      targetId: user.id,
    });

    // Generate token
    const rawToken = createToken("reset");
    const hashedToken = hashToken(rawToken);
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    const identifier = buildIdentifier(normalizedEmail, "reset");

    // Store token
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: hashedToken,
        expires,
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(
      rawToken
    )}`;

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Reset your HealTalk password",
        text: `Reset your password: ${resetUrl}`,
        html: `
          <p>Hello,</p>
          <p>You requested a password reset for HealTalk.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Forgot password email error:", emailError);
    }

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
