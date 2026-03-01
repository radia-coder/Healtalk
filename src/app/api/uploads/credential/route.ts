import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { parseSearchParams } from "@/lib/validation";

const utapi = new UTApi({
  token:
    process.env.UPLOADTHING_TOKEN ||
    process.env.UPLOADTHING_SECRET ||
    process.env.UPLOADTHING_KEY,
});

const querySchema = z.object({
  psychologistId: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = parseSearchParams(request, querySchema);
  if (error) return error;
  const psychologistId = data.psychologistId || null;

  let psychologist:
    | {
        credentialDocumentKey: string | null;
      }
    | null = null;

  if (session.user.role === "ADMIN" && psychologistId) {
    psychologist = await prisma.psychologist.findUnique({
      where: { id: psychologistId },
      select: { credentialDocumentKey: true },
    });
  } else if (session.user.role === "PSYCHOLOGIST") {
    psychologist = await prisma.psychologist.findUnique({
      where: { userId: session.user.id },
      select: { credentialDocumentKey: true },
    });
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!psychologist?.credentialDocumentKey) {
    return NextResponse.json(
      { error: "Credential document not found" },
      { status: 404 }
    );
  }

  try {
    const signed = await utapi.generateSignedURL(
      psychologist.credentialDocumentKey,
      { expiresIn: 600 }
    );

    return NextResponse.json({ url: signed.ufsUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
