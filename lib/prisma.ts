import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function encodeDbUrl(url: string): string {
  // Split on :// to isolate the credentials+host part
  const schemeEnd = url.indexOf("://");
  if (schemeEnd === -1) return url;
  const scheme = url.substring(0, schemeEnd); // postgresql
  const rest = url.substring(schemeEnd + 3); // user:pass@host/db

  // The last @ separates credentials from host
  const lastAt = rest.lastIndexOf("@");
  if (lastAt === -1) return url;

  const creds = rest.substring(0, lastAt); // user:pass (may contain literal @)
  const hostPart = rest.substring(lastAt + 1); // host/db

  // Encode any literal @ inside credentials (in the password)
  const fixedCreds = creds.replace("@", "%40");

  return scheme + "://" + fixedCreds + "@" + hostPart;
}

// Always use the hardcoded correct URL as base — env var may have unencoded @
const RAW_DB_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres.yrlxpppyrdtakbsjlwkc:NexHR@18000@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const RAW_DIRECT_URL =
  process.env.DIRECT_URL ??
  "postgresql://postgres.yrlxpppyrdtakbsjlwkc:NexHR@18000@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

// Fix the URLs and write back to process.env so Prisma engine picks them up
process.env.DATABASE_URL = encodeDbUrl(RAW_DB_URL);
process.env.DIRECT_URL = encodeDbUrl(RAW_DIRECT_URL);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
