import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function fixDbUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // Fix: postgresql://user:PASS@host where PASS contains literal @
  // Standard: user:pass@host — if pass has @, it must be %40
  // Detect pattern: two @ signs in the URL means password has a literal @
  const atCount = (url.match(/@/g) ?? []).length;
  if (atCount === 2) {
    // Format: postgresql://user:PASS@extra@host/db
    // Replace the first @ (inside password) with %40
    return url.replace(/^(postgresql:\/\/[^:]+:[^@]*)@/, "$1%40");
  }
  return url;
}

const dbUrl = fixDbUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
