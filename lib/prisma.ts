import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function fixDbUrl(url: string | undefined): string {
  const base =
    url ??
    "postgresql://postgres.yrlxpppyrdtakbsjlwkc:NexHR%4018000@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

  // Count literal @ signs (not already-encoded %40)
  const atCount = (base.match(/@/g) ?? []).length;
  if (atCount >= 2) {
    return base.replace(/^(postgresql:\/\/[^:]+:[^@]*)@/, "$1%40");
  }
  return base;
}

// Mutate process.env so Prisma's query engine binary also picks up the fixed URL
const fixedDbUrl = fixDbUrl(process.env.DATABASE_URL);
process.env.DATABASE_URL = fixedDbUrl;

const fixedDirectUrl = fixDbUrl(process.env.DIRECT_URL);
process.env.DIRECT_URL = fixedDirectUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
