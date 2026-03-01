import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseSearchParams } from "@/lib/validation";
import { requireRateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

const querySchema = z.object({
  search: z.string().optional(),
  published: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:blog-posts:list",
    limit: 120,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { data, error } = parseSearchParams(request, querySchema);
  if (error) return error;
  const search = data.search || "";
  const published = data.published || "";
  const page = data.page;
  const limit = data.limit;

  const where: Prisma.BlogPostWhereInput = {};

  if (published === "true") {
    where.published = true;
  }

  if (published === "false") {
    where.published = false;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  const [posts, total] = await prisma.$transaction([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        category: true,
        date: true,
        published: true,
        createdAt: true,
        author: {
          select: { name: true, role: true },
        },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:blog-posts:create",
    limit: 30,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (typeof body.excerpt !== "string" || !body.excerpt.trim()) {
    return NextResponse.json({ error: "Excerpt is required" }, { status: 400 });
  }

  // Find or create a blog author for the current admin user
  let author = await prisma.blogAuthor.findFirst({
    where: { name: session.user.name || session.user.email || "Admin" },
  });

  if (!author) {
    author = await prisma.blogAuthor.create({
      data: {
        name: session.user.name || session.user.email || "Admin",
        role: "Administrator",
        bio: "",
        imageUrl: session.user.image || "",
        linkedinUrl: "",
      },
    });
  }

  const post = await prisma.blogPost.create({
    data: {
      title: body.title.trim(),
      subtitle: typeof body.subtitle === "string" ? body.subtitle.trim() || null : null,
      excerpt: body.excerpt.trim(),
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "",
      category: typeof body.category === "string" ? body.category.trim() || null : null,
      date: typeof body.date === "string" ? new Date(body.date) : new Date(),
      theme: typeof body.theme === "string" ? body.theme.trim() || null : null,
      published: typeof body.published === "boolean" ? body.published : false,
      authorId: author.id,
    },
    select: {
      id: true,
      title: true,
      category: true,
      published: true,
      createdAt: true,
      author: { select: { name: true, role: true } },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
