import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseJson } from "@/lib/validation";
import { validateCsrf } from "@/lib/csrf";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  credentials: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  experience: z.coerce.number().int().min(0).optional().nullable(),
  specializations: z.array(z.string()).optional().nullable(),
  price60: z.coerce.number().int().positive().optional().nullable(),
  price90: z.coerce.number().int().positive().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      role: true,
      image: true,
      psychologist: {
        select: {
          bio: true,
          credentials: true,
          licenseNumber: true,
          experience: true,
          specializations: true,
          price60: true,
          price90: true,
          credentialDocumentUrl: true,
          credentialDocumentKey: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const { data: body, error } = await parseJson(request, updateProfileSchema);
  if (error) return error;
  const data: {
    name?: string;
    phone?: string | null;
    dateOfBirth?: Date | null;
  } = {};

  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    data.name = trimmed;
  }

  if (body.phone !== undefined) {
    data.phone = body.phone ? body.phone.trim() : null;
  }

  if (body.dateOfBirth !== undefined) {
    if (body.dateOfBirth) {
      const parsed = new Date(body.dateOfBirth);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
      }
      data.dateOfBirth = parsed;
    } else {
      data.dateOfBirth = null;
    }
  }

  const hasPsychologistUpdate =
    session.user.role === "PSYCHOLOGIST" &&
    (body.bio !== undefined ||
      body.credentials !== undefined ||
      body.licenseNumber !== undefined ||
      body.experience !== undefined ||
      body.specializations !== undefined ||
      body.price60 !== undefined ||
      body.price90 !== undefined);

  const psychologistData: {
    bio?: string;
    credentials?: string;
    licenseNumber?: string;
    experience?: number;
    specializations?: string[];
    price60?: number;
    price90?: number;
  } = {};

  if (hasPsychologistUpdate) {
    if (body.bio !== undefined) {
      psychologistData.bio = body.bio?.trim() || "";
    }

    if (body.credentials !== undefined) {
      const credentials = body.credentials?.trim() || "";
      if (!credentials) {
        return NextResponse.json(
          { error: "Credentials are required." },
          { status: 400 }
        );
      }
      psychologistData.credentials = credentials;
    }

    if (body.licenseNumber !== undefined) {
      const licenseNumber = body.licenseNumber?.trim() || "";
      if (!licenseNumber) {
        return NextResponse.json(
          { error: "License number is required." },
          { status: 400 }
        );
      }

      const existing = await prisma.psychologist.findFirst({
        where: {
          licenseNumber,
          NOT: { userId: session.user.id },
        },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          { error: "That license number is already in use." },
          { status: 409 }
        );
      }

      psychologistData.licenseNumber = licenseNumber;
    }

    if (body.experience !== undefined) {
      if (!Number.isFinite(body.experience) || (body.experience ?? 0) < 0) {
        return NextResponse.json(
          { error: "Experience must be 0 or greater." },
          { status: 400 }
        );
      }
      psychologistData.experience = body.experience ?? 0;
    }

    if (body.specializations !== undefined) {
      const specializations = Array.isArray(body.specializations)
        ? body.specializations.map((item) => item.trim()).filter(Boolean)
        : [];
      psychologistData.specializations = specializations;
    }

    if (body.price60 !== undefined) {
      if (!Number.isFinite(body.price60) || (body.price60 ?? 0) <= 0) {
        return NextResponse.json(
          { error: "Session price must be greater than 0." },
          { status: 400 }
        );
      }
      psychologistData.price60 = body.price60 ?? 0;
    }

    if (body.price90 !== undefined) {
      if (!Number.isFinite(body.price90) || (body.price90 ?? 0) <= 0) {
        return NextResponse.json(
          { error: "Extended session price must be greater than 0." },
          { status: 400 }
        );
      }
      psychologistData.price90 = body.price90 ?? 0;
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...data,
      ...(hasPsychologistUpdate && Object.keys(psychologistData).length > 0
        ? {
            psychologist: {
              update: psychologistData,
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      role: true,
      image: true,
      psychologist: {
        select: { bio: true, credentialDocumentUrl: true, credentialDocumentKey: true },
      },
    },
  });

  return NextResponse.json(user);
}
