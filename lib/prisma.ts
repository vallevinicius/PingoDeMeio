import { PrismaClient } from '@prisma/client'

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return

  const { DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME } = process.env
  if (!DATABASE_HOST || !DATABASE_USER || !DATABASE_PASSWORD || !DATABASE_NAME) {
    throw new Error(
      'Configure DATABASE_URL, ou DATABASE_HOST + DATABASE_USER + DATABASE_PASSWORD + DATABASE_NAME (DATABASE_PORT é opcional, padrão 3306).',
    )
  }

  const port = DATABASE_PORT || '3306'
  process.env.DATABASE_URL =
    `mysql://${encodeURIComponent(DATABASE_USER)}:${encodeURIComponent(DATABASE_PASSWORD)}@${DATABASE_HOST}:${port}/${DATABASE_NAME}`
}

ensureDatabaseUrl()

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
