import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { parseSearchParams } from '@/lib/validation';
import { RESOURCE_FALLBACK_BLOG_POSTS } from '@/lib/resource-fallback';

const querySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(request: Request) {
  try {
    const { data, error } = parseSearchParams(request, querySchema);
    if (error) return error;
    const category = data.category || '';
    const search = data.search || '';
    const page = data.page;
    const limit = data.limit;

    const where: Prisma.BlogPostWhereInput = {
      published: true,
    };

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Search by title or excerpt
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    let [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              role: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    if (total === 0 && process.env.NODE_ENV !== 'production') {
      const relaxedWhere = { ...where };
      delete relaxedWhere.published;

      const [relaxedPosts, relaxedTotal] = await Promise.all([
        prisma.blogPost.findMany({
          where: relaxedWhere,
          include: {
            author: {
              select: {
                name: true,
                role: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.blogPost.count({ where: relaxedWhere }),
      ]);

      if (relaxedTotal > 0) {
        posts = relaxedPosts;
        total = relaxedTotal;
      } else {
        const normalizedCategory = category.trim().toLowerCase();
        const normalizedSearch = search.trim().toLowerCase();

        const filtered = RESOURCE_FALLBACK_BLOG_POSTS
          .filter((post) =>
            normalizedCategory
              ? String(post.category || '').toLowerCase() === normalizedCategory
              : true
          )
          .filter((post) =>
            normalizedSearch
              ? post.title.toLowerCase().includes(normalizedSearch) ||
                post.excerpt.toLowerCase().includes(normalizedSearch)
              : true
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const paged = filtered.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
          posts: paged,
          pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
          },
          fallback: true,
        });
      }
    }

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
