import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { parseSearchParams } from '@/lib/validation';
import { getOrSetServerCache } from '@/lib/server-cache';

// Cache TTL for the psychologist list — balances freshness with performance.
// Public page with infrequently-changing data, so 60 s is safe.
const PSYCHOLOGISTS_CACHE_TTL_MS = 60_000;

const querySchema = z.object({
  search: z.string().optional(),
  specialization: z.string().optional(),
  minRating: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const DEFAULT_PAGE = 1;
const MAX_PRICE_UNSET = 999_999;
const CURRENCY_CENTS_MULTIPLIER = 100;
const DEVELOPMENT_HOSPITAL_NAME = 'HealTalk Online Clinic';
const DEVELOPMENT_HOSPITAL_LOCATION = 'Remote';
const DEVELOPMENT_HOSPITAL_ADDRESS = 'Online';
const DEVELOPMENT_HOSPITAL_STATUS = 'active';
const DEVELOPMENT_SEEDED_STATUS = 'APPROVED';
const PREPARED_STATEMENT_MISSING_PATTERN = /prepared statement .* does not exist/i;

type AllowedPsychologistStatus = Array<'APPROVED' | 'PENDING'>;
type NormalizedQuery = {
  search: string;
  specialization: string;
  minRating: number;
  maxPrice: number;
  page: number;
  limit: number;
};

const DEMO_PSYCHOLOGISTS = [
  {
    name: 'Dr. Amina Noor',
    email: 'demo.psych1@healtalk.local',
    licenseNumber: 'DEMO-PSY-001',
    credentials: 'PhD, Clinical Psychologist',
    experience: 8,
    bio: 'Specializes in anxiety, stress, and emotional resilience.',
    specializations: ['Anxiety Disorders', 'Stress Management'],
    price60: 8000,
    price90: 11000,
    rating: 4.8,
    reviewCount: 48,
  },
  {
    name: 'Dr. Omar Hassan',
    email: 'demo.psych2@healtalk.local',
    licenseNumber: 'DEMO-PSY-002',
    credentials: 'PhD, Psychotherapist',
    experience: 10,
    bio: 'Focuses on depression recovery and trauma-informed care.',
    specializations: ['Depression', 'Trauma & PTSD'],
    price60: 9000,
    price90: 12500,
    rating: 4.9,
    reviewCount: 67,
  },
  {
    name: 'Dr. Sara Malik',
    email: 'demo.psych3@healtalk.local',
    licenseNumber: 'DEMO-PSY-003',
    credentials: 'PsyD, Counseling Psychologist',
    experience: 7,
    bio: 'Supports relationship challenges, burnout, and life transitions.',
    specializations: ['Family Therapy', 'Couples Counseling'],
    price60: 7500,
    price90: 10500,
    rating: 4.7,
    reviewCount: 39,
  },
] as const;

const isDevelopmentEnvironment = () => process.env.NODE_ENV !== 'production';

// Tracks whether the dev seed check has already run this process lifetime.
// This avoids a DB count query on every single page load in dev.
let devSeedChecked = false;

const normalizeQuery = (raw: z.infer<typeof querySchema>): NormalizedQuery => ({
  search: raw.search?.trim() || '',
  specialization: raw.specialization?.trim() || '',
  minRating: raw.minRating ?? 0,
  maxPrice: raw.maxPrice ?? MAX_PRICE_UNSET,
  page: raw.page,
  limit: raw.limit,
});

const isFirstPageWithoutFilters = (query: NormalizedQuery) =>
  query.page === DEFAULT_PAGE &&
  !query.search &&
  !query.specialization &&
  query.minRating <= 0 &&
  query.maxPrice >= MAX_PRICE_UNSET;

const shouldUseDevelopmentFallbackFlow = (query: NormalizedQuery) =>
  isDevelopmentEnvironment() && isFirstPageWithoutFilters(query);

const getOrCreateDevelopmentHospital = async () => {
  const existingHospital = await prisma.hospital.findFirst({
    where: { name: DEVELOPMENT_HOSPITAL_NAME },
    select: { id: true },
  });
  if (existingHospital) return existingHospital;

  return prisma.hospital.create({
    data: {
      name: DEVELOPMENT_HOSPITAL_NAME,
      location: DEVELOPMENT_HOSPITAL_LOCATION,
      address: DEVELOPMENT_HOSPITAL_ADDRESS,
      status: DEVELOPMENT_HOSPITAL_STATUS,
    },
    select: { id: true },
  });
};

const upsertDevelopmentPsychologist = async (
  demo: (typeof DEMO_PSYCHOLOGISTS)[number],
  hospitalId: string
) => {
  const user = await prisma.user.upsert({
    where: { email: demo.email },
    update: {
      name: demo.name,
      role: 'PSYCHOLOGIST',
      emailVerified: new Date(),
    },
    create: {
      name: demo.name,
      email: demo.email,
      role: 'PSYCHOLOGIST',
      emailVerified: new Date(),
    },
    select: { id: true },
  });

  const existingPsychologist = await prisma.psychologist.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (existingPsychologist) return;

  await prisma.psychologist.create({
    data: {
      userId: user.id,
      credentials: demo.credentials,
      licenseNumber: demo.licenseNumber,
      experience: demo.experience,
      bio: demo.bio,
      specializations: [...demo.specializations],
      price60: demo.price60,
      price90: demo.price90,
      rating: demo.rating,
      reviewCount: demo.reviewCount,
      status: DEVELOPMENT_SEEDED_STATUS,
      approvedAt: new Date(),
      hospitalId,
    },
  });
};

const ensureDevelopmentPsychologists = async () => {
  if (!isDevelopmentEnvironment()) return;
  // Skip the DB count if we already ran the check this process lifetime.
  if (devSeedChecked) return;

  const existingCount = await prisma.psychologist.count();
  devSeedChecked = true; // Don't check again even if count is 0 (avoids repeated seeding on every request)

  if (existingCount > 0) return;

  const hospital = await getOrCreateDevelopmentHospital();
  for (const demoPsychologist of DEMO_PSYCHOLOGISTS) {
    await upsertDevelopmentPsychologist(demoPsychologist, hospital.id);
  }
};

const buildPsychologistWhere = (
  query: NormalizedQuery,
  statuses: AllowedPsychologistStatus
): Prisma.PsychologistWhereInput => {
  const where: Prisma.PsychologistWhereInput = {
    status: statuses.length === 1 ? statuses[0] : { in: statuses },
  };

  if (query.search) {
    where.user = { is: { name: { contains: query.search, mode: 'insensitive' } } };
  }

  if (query.specialization) {
    where.specializations = { has: query.specialization };
  }

  if (query.minRating > 0) {
    where.rating = { gte: query.minRating };
  }

  if (query.maxPrice < MAX_PRICE_UNSET) {
    where.price60 = { lte: query.maxPrice * CURRENCY_CENTS_MULTIPLIER };
  }

  return where;
};

const isPreparedStatementMissing = (error: unknown) =>
  error instanceof Error && PREPARED_STATEMENT_MISSING_PATTERN.test(error.message);

type PsychologistListQueryOptions = {
  whereInput: Prisma.PsychologistWhereInput;
  orderBy:
    | Prisma.PsychologistOrderByWithRelationInput
    | Prisma.PsychologistOrderByWithRelationInput[];
  skip: number;
  take: number;
};

const runPsychologistListQuery = ({
  whereInput,
  orderBy,
  skip,
  take,
}: PsychologistListQueryOptions) =>
  Promise.all([
    prisma.psychologist.findMany({
      where: whereInput,
      include: {
        user: { select: { name: true, image: true } },
        hospital: { select: { name: true, location: true } },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.psychologist.count({ where: whereInput }),
  ]);

const runPsychologistListQueryWithRetry = async (
  options: PsychologistListQueryOptions
) => {
  try {
    return await runPsychologistListQuery(options);
  } catch (error) {
    if (!isPreparedStatementMissing(error)) throw error;
    return runPsychologistListQuery(options);
  }
};

export async function GET(request: Request) {
  try {
    const { data, error } = parseSearchParams(request, querySchema);
    if (error) return error;
    const query = normalizeQuery(data);

    const useDevelopmentFallbackFlow = shouldUseDevelopmentFallbackFlow(query);
    if (useDevelopmentFallbackFlow) {
      // Seed demo data only once per process — the flag prevents extra DB calls on every request.
      await ensureDevelopmentPsychologists();
    }

    // Build a stable cache key from the query params so each unique filter set
    // gets its own cached response. Bust with ":v1" if the response shape changes.
    const cacheKey = `psychologists:v1:p${query.page}:l${query.limit}:s${query.search}:sp${query.specialization}:r${query.minRating}:mp${query.maxPrice}`;

    const payload = await getOrSetServerCache(cacheKey, PSYCHOLOGISTS_CACHE_TTL_MS, async () => {
      let where = buildPsychologistWhere(query, ['APPROVED']);

      let [psychologists, total] = await runPsychologistListQueryWithRetry({
        whereInput: where,
        orderBy: { rating: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      let showingPendingFallback = false;
      if (total === 0 && useDevelopmentFallbackFlow) {
        where = buildPsychologistWhere(query, ['APPROVED', 'PENDING']);
        [psychologists, total] = await runPsychologistListQueryWithRetry({
          whereInput: where,
          orderBy: [{ status: 'asc' }, { rating: 'desc' }],
          skip: 0,
          take: query.limit,
        });
        showingPendingFallback = total > 0;
      }

      return {
        psychologists,
        showingPendingFallback,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching psychologists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch psychologists' },
      { status: 500 }
    );
  }
}
