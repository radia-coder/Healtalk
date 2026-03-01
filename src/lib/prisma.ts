import { PrismaClient } from '@prisma/client'

const ensureSupabasePoolerParams = (rawUrl: string) => {
  if (!rawUrl.includes('pooler.supabase.com')) return rawUrl

  try {
    const parsed = new URL(rawUrl)
    if (!parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true')
    }
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1')
    }
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require')
    }
    return parsed.toString()
  } catch {
    const suffix = rawUrl.includes('?') ? '&' : '?'
    return `${rawUrl}${suffix}pgbouncer=true&connection_limit=1&sslmode=require`
  }
}

const databaseUrl = ensureSupabasePoolerParams(
  process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/psyconnect?schema=public'
)
process.env.DATABASE_URL = databaseUrl

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
