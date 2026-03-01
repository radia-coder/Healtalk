import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { parseSearchParams } from '@/lib/validation';
import { RESOURCE_FALLBACK_GUIDES } from '@/lib/resource-fallback';

const querySchema = z.object({
  theme: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(request: Request) {
  try {
    const { data, error } = parseSearchParams(request, querySchema);
    if (error) return error;
    const theme = data.theme || '';
    const page = data.page;
    const limit = data.limit;

    const where: Prisma.GuideWhereInput = {
      published: true,
    };

    if (theme) {
      where.theme = theme;
    }

    let [guides, total] = await Promise.all([
      prisma.guide.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.guide.count({ where }),
    ]);

    if (total === 0 && process.env.NODE_ENV !== 'production') {
      const relaxedWhere = { ...where };
      delete relaxedWhere.published;

      const [relaxedGuides, relaxedTotal] = await Promise.all([
        prisma.guide.findMany({
          where: relaxedWhere,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.guide.count({ where: relaxedWhere }),
      ]);

      if (relaxedTotal > 0) {
        guides = relaxedGuides;
        total = relaxedTotal;
      } else {
        const normalizedTheme = theme.trim().toLowerCase();
        const filtered = RESOURCE_FALLBACK_GUIDES.filter((guide) =>
          normalizedTheme ? guide.theme.toLowerCase() === normalizedTheme : true
        );
        const paged = filtered.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
          guides: paged,
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
      guides,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guides' },
      { status: 500 }
    );
  }
}
