import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function fixDbUrl(url: string | undefined): string {
  const base =
    url ??
    "postgresql://postgres.yrlxpppyrdtakbsjlwkc:NexHR%4018000@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

  // Count literal @ signs (not %40)
  const atCount = (base.match(/@/g) ?? []).length;
  if (atCount >= 2) {
    // Password contains a literal @: encode the first one
    return base.replace(/^(postgresql:\/\/[^:]+:[^@]*)@/, "$1%40");
  }
  return base;
}

const dbUrl = fixDbUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: { db: { url: dbUrl } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
