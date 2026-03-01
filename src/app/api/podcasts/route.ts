import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { parseSearchParams } from '@/lib/validation';
import { RESOURCE_FALLBACK_PODCASTS } from '@/lib/resource-fallback';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(request: Request) {
  try {
    const { data, error } = parseSearchParams(request, querySchema);
    if (error) return error;
    const page = data.page;
    const limit = data.limit;

    const where = {
      published: true,
    };

    let [episodes, total] = await Promise.all([
      prisma.podcastEpisode.findMany({
        where,
        orderBy: { episodeNumber: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.podcastEpisode.count({ where }),
    ]);

    if (total === 0 && process.env.NODE_ENV !== 'production') {
      const relaxedWhere = { ...where };
      delete (relaxedWhere as { published?: boolean }).published;

      const [relaxedEpisodes, relaxedTotal] = await Promise.all([
        prisma.podcastEpisode.findMany({
          where: relaxedWhere,
          orderBy: { episodeNumber: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.podcastEpisode.count({ where: relaxedWhere }),
      ]);

      if (relaxedTotal > 0) {
        episodes = relaxedEpisodes;
        total = relaxedTotal;
      } else {
        const paged = RESOURCE_FALLBACK_PODCASTS.slice(
          (page - 1) * limit,
          page * limit
        );
        return NextResponse.json({
          episodes: paged,
          pagination: {
            page,
            limit,
            total: RESOURCE_FALLBACK_PODCASTS.length,
            totalPages: Math.ceil(RESOURCE_FALLBACK_PODCASTS.length / limit),
          },
          fallback: true,
        });
      }
    }

    return NextResponse.json({
      episodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching podcast episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcast episodes' },
      { status: 500 }
    );
  }
}
