import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRateLimit } from "@/lib/rate-limit";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:blog-posts:update",
    limit: 60,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  const updateData: Prisma.BlogPostUpdateInput = {};
  if (typeof body.published === "boolean") updateData.published = body.published;
  if (typeof body.title === "string" && body.title.trim()) updateData.title = body.title.trim();
  if (typeof body.excerpt === "string") updateData.excerpt = body.excerpt.trim();
  if (typeof body.category === "string") updateData.category = body.category;
  if (typeof body.imageUrl === "string") updateData.imageUrl = body.imageUrl.trim();
  if (typeof body.date === "string") updateData.date = new Date(body.date);

  const updated = await prisma.blogPost.update({
    where: { id },
    data: updateData,
    select: { id: true, title: true, published: true, category: true, updatedAt: true },
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "ADMIN_BLOG_UPDATE",
    targetType: "BlogPost",
    targetId: updated.id,
    metadata: { published: updated.published },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = await requireRateLimit({
    request,
    key: "admin:blog-posts:delete",
    limit: 30,
    window: "1 m",
  });
  if (rateLimit) return rateLimit;

  const { id } = await params;

  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id } });

  await createAuditLog({
    actorId: session.user.id,
    action: "ADMIN_BLOG_DELETE",
    targetType: "BlogPost",
    targetId: id,
    metadata: {},
  });

  return NextResponse.json({ success: true });
}
